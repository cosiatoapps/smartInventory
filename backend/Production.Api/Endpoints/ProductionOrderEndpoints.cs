using Microsoft.Data.Sqlite;
using Production.Api.Dtos;

namespace Production.Api.Endpoints;

public static class ProductionOrderEndpoints
{
    public static void MapProductionOrderEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/production");

        group.MapGet("/metrics", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var orderCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM ProductionOrder;");
            var recipeCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Recipe;");
            var wasteQuantity = await ExecuteScalarDecimal(connection, "SELECT COALESCE(SUM(Quantity), 0) FROM WasteLog;");
            
            // Usamos UsefulOutputQty del nuevo esquema de BD
            var totalProduction = await ExecuteScalarDecimal(
                connection, 
                "SELECT COALESCE(SUM(UsefulOutputQty), 0) FROM ProductionOrder;"
            );
            
            var averageYield = await ExecuteScalarDecimal(
                connection, 
                "SELECT COALESCE(AVG(ActualYieldPct), 91.2) FROM ProductionOrder;"
            );

            var wastePercent = totalProduction > 0 
                ? Math.Round((wasteQuantity / totalProduction) * 100, 1) 
                : 0m;

            return Results.Ok(new ProductionMetricsDto(
                orderCount, 
                recipeCount, 
                totalProduction, 
                Math.Round(averageYield, 1), 
                wastePercent
            ));
        });

        group.MapGet("/orders", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText =
                @"SELECT po.ProductionId,
                         po.RecipeId,
                         COALESCE(r.Name, 'Preparación Desconocida') AS Description,
                         COALESCE(po.RawMaterialUsedQty, 0) AS RawMaterialUsedQty,
                         COALESCE(po.UsefulOutputQty, 0) AS Quantity,
                         COALESCE(po.ActualYieldPct, 100.0) AS ActualYieldPct
                  FROM ProductionOrder po
                  LEFT JOIN Recipe r ON r.RecipeId = po.RecipeId
                  ORDER BY po.ProductionId DESC;";

            var orders = new List<ProductionOrderDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                orders.Add(new ProductionOrderDto(
                    reader.GetInt32(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.GetDecimal(3),
                    reader.GetDecimal(4),
                    reader.GetDecimal(5)
                ));
            }

            return Results.Ok(orders);
        });

        group.MapPost("/orders", async (ProductionOrderCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var newId = await RecipeEndpoints.GetNextId(connection, "ProductionOrder", "ProductionId");
            var actualYieldPct = dto.RawMaterialUsedQty > 0 
                ? Math.Round((dto.UsefulOutputQty / dto.RawMaterialUsedQty) * 100, 2) 
                : 0m;

            var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO ProductionOrder (ProductionId, SiteId, RecipeId, RawMaterialUsedQty, UsefulOutputQty, ActualYieldPct) 
                                     VALUES ($id, $siteId, $recipeId, $rawQty, $usefulQty, $yieldPct);";
            
            command.Parameters.AddWithValue("$id", newId);
            command.Parameters.AddWithValue("$siteId", dto.SiteId);
            command.Parameters.AddWithValue("$recipeId", dto.RecipeId);
            command.Parameters.AddWithValue("$rawQty", dto.RawMaterialUsedQty);
            command.Parameters.AddWithValue("$usefulQty", dto.UsefulOutputQty);
            command.Parameters.AddWithValue("$yieldPct", actualYieldPct);

            await command.ExecuteNonQueryAsync();
            return Results.Created($"/api/production/orders/{newId}", new { ProductionId = newId, ActualYieldPct = actualYieldPct });
        });
    }

    private static async Task<int> ExecuteScalarInt(SqliteConnection connection, string sql)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        var result = await command.ExecuteScalarAsync();
        return result switch
        {
            long longValue => (int)longValue,
            int intValue => intValue,
            _ => 0
        };
    }

    private static async Task<decimal> ExecuteScalarDecimal(SqliteConnection connection, string sql)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        var result = await command.ExecuteScalarAsync();
        return result switch
        {
            double doubleValue => Convert.ToDecimal(doubleValue),
            float floatValue => Convert.ToDecimal(floatValue),
            long longValue => Convert.ToDecimal(longValue),
            decimal decimalValue => decimalValue,
            _ => 0m
        };
    }
}