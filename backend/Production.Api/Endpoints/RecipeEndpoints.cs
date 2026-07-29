using Microsoft.Data.Sqlite;
using Production.Api.Dtos;

namespace Production.Api.Endpoints;

public static class RecipeEndpoints
{
    public static void MapRecipeEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/recipes");

        // 1. Obtener todas las recetas INCLUYENDO SUS INGREDIENTES
        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            // Consultar recetas e ingredientes mediante LEFT JOIN
            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT 
                    r.RecipeId, r.Name, COALESCE(r.PosPluCode, '') AS PosPluCode, 
                    r.YieldQuantity, r.StandardYieldPct, r.EstimatedCost,
                    ri.ProductId, p.Description AS ProductName, ri.Quantity, ri.UnitOfMeasureId, ri.ExpectedWastePct
                FROM Recipe r
                LEFT JOIN RecipeIngredient ri ON r.RecipeId = ri.RecipeId
                LEFT JOIN Product p ON ri.ProductId = p.ProductId
                ORDER BY r.RecipeId DESC;";

            var recipeMap = new Dictionary<int, RecipeFullDto>();

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var recipeId = reader.GetInt32(0);

                if (!recipeMap.TryGetValue(recipeId, out var recipe))
                {
                    recipe = new RecipeFullDto(
                        recipeId,
                        reader.GetString(1),
                        reader.GetString(2),
                        reader.GetInt32(3),
                        reader.GetDecimal(4),
                        reader.GetDecimal(5),
                        new List<RecipeIngredientDto>()
                    );
                    recipeMap[recipeId] = recipe;
                }

                // Si tiene un ingrediente en la fila del JOIN, agregarlo a la lista de la receta
                if (!reader.IsDBNull(6))
                {
                    recipe.Items.Add(new RecipeIngredientDto(
                        reader.GetInt32(6),                   // ProductId
                        reader.GetDecimal(8),                 // Quantity
                        reader.GetInt32(9),                   // UnitOfMeasureId
                        reader.GetDecimal(10),                // ExpectedWastePct
                        reader.IsDBNull(7) ? $"Producto {reader.GetInt32(6)}" : reader.GetString(7) // ProductName
                    ));
                }
            }

            return Results.Ok(recipeMap.Values.ToList());
        });

        // 2. Crear una nueva Ficha Técnica / Receta completa
        group.MapPost("/", async (RecipeCreateFullDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();
            await using var transaction = (SqliteTransaction)await connection.BeginTransactionAsync();

            try
            {
                var newRecipeId = await GetNextId(connection, "Recipe", "RecipeId");

                var cmdRecipe = connection.CreateCommand();
                cmdRecipe.Transaction = transaction;
                cmdRecipe.CommandText = @"
                    INSERT INTO Recipe (RecipeId, Name, PosPluCode, YieldQuantity, StandardYieldPct, EstimatedCost)
                    VALUES ($id, $name, $plu, $yieldQty, $yieldPct, $cost);";

                cmdRecipe.Parameters.AddWithValue("$id", newRecipeId);
                cmdRecipe.Parameters.AddWithValue("$name", dto.Name);
                cmdRecipe.Parameters.AddWithValue("$plu", (object?)dto.PosPluCode ?? DBNull.Value);
                cmdRecipe.Parameters.AddWithValue("$yieldQty", dto.YieldQuantity <= 0 ? 1 : dto.YieldQuantity);
                cmdRecipe.Parameters.AddWithValue("$yieldPct", dto.StandardYieldPct <= 0 ? 100m : dto.StandardYieldPct);
                cmdRecipe.Parameters.AddWithValue("$cost", dto.EstimatedCost);
                await cmdRecipe.ExecuteNonQueryAsync();

                // Insertar ingredientes
                foreach (var item in dto.Items)
                {
                    var newItemId = await GetNextId(connection, "RecipeIngredient", "RecipeItemId");
                    var cmdItem = connection.CreateCommand();
                    cmdItem.Transaction = transaction;
                    cmdItem.CommandText = @"
                        INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct)
                        VALUES ($itemId, $recipeId, $productId, $qty, $uomId, $waste);";

                    cmdItem.Parameters.AddWithValue("$itemId", newItemId);
                    cmdItem.Parameters.AddWithValue("$recipeId", newRecipeId);
                    cmdItem.Parameters.AddWithValue("$productId", item.ProductId);
                    cmdItem.Parameters.AddWithValue("$qty", item.Quantity);
                    cmdItem.Parameters.AddWithValue("$uomId", item.UnitOfMeasureId);
                    cmdItem.Parameters.AddWithValue("$waste", item.ExpectedWastePct);
                    await cmdItem.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
                return Results.Created($"/api/recipes/{newRecipeId}", new { RecipeId = newRecipeId, Success = true });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });

        // 3. Actualizar Receta existente
        group.MapPut("/{id:int}", async (int id, RecipeCreateFullDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();
            await using var transaction = (SqliteTransaction)await connection.BeginTransactionAsync();

            try
            {
                var cmdRecipe = connection.CreateCommand();
                cmdRecipe.Transaction = transaction;
                cmdRecipe.CommandText = @"
                    UPDATE Recipe 
                    SET Name = $name, PosPluCode = $plu, YieldQuantity = $yieldQty, StandardYieldPct = $yieldPct, EstimatedCost = $cost
                    WHERE RecipeId = $id;";

                cmdRecipe.Parameters.AddWithValue("$id", id);
                cmdRecipe.Parameters.AddWithValue("$name", dto.Name);
                cmdRecipe.Parameters.AddWithValue("$plu", (object?)dto.PosPluCode ?? DBNull.Value);
                cmdRecipe.Parameters.AddWithValue("$yieldQty", dto.YieldQuantity);
                cmdRecipe.Parameters.AddWithValue("$yieldPct", dto.StandardYieldPct);
                cmdRecipe.Parameters.AddWithValue("$cost", dto.EstimatedCost);
                await cmdRecipe.ExecuteNonQueryAsync();

                // Limpiar e insertar ingredientes nuevos
                var cmdClean = connection.CreateCommand();
                cmdClean.Transaction = transaction;
                cmdClean.CommandText = "DELETE FROM RecipeIngredient WHERE RecipeId = $id;";
                cmdClean.Parameters.AddWithValue("$id", id);
                await cmdClean.ExecuteNonQueryAsync();

                foreach (var item in dto.Items)
                {
                    var newItemId = await GetNextId(connection, "RecipeIngredient", "RecipeItemId");
                    var cmdItem = connection.CreateCommand();
                    cmdItem.Transaction = transaction;
                    cmdItem.CommandText = @"
                        INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct)
                        VALUES ($itemId, $recipeId, $productId, $qty, $uomId, $waste);";

                    cmdItem.Parameters.AddWithValue("$itemId", newItemId);
                    cmdItem.Parameters.AddWithValue("$recipeId", id);
                    cmdItem.Parameters.AddWithValue("$productId", item.ProductId);
                    cmdItem.Parameters.AddWithValue("$qty", item.Quantity);
                    cmdItem.Parameters.AddWithValue("$uomId", item.UnitOfMeasureId);
                    cmdItem.Parameters.AddWithValue("$waste", item.ExpectedWastePct);
                    await cmdItem.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
                return Results.Ok(new { RecipeId = id, Success = true });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public static async Task<int> GetNextId(SqliteConnection connection, string table, string idColumn)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = $"SELECT COALESCE(MAX({idColumn}), 0) + 1 FROM {table};";
        var result = await command.ExecuteScalarAsync();
        return result switch
        {
            long longValue => (int)longValue,
            int intValue => intValue,
            _ => 1
        };
    }
}