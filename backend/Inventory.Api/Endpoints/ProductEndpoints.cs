using Inventory.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace Inventory.Api.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/admin/products");

        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"SELECT p.ProductId, p.SKU, p.Description, p.CategoryId, COALESCE(c.Name, '') FROM Product p
                                     LEFT JOIN Category c ON c.CategoryId = p.CategoryId
                                     ORDER BY p.SKU;";

            var list = new List<ProductDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new ProductDto(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
                    reader.IsDBNull(3) ? 0 : reader.GetInt32(3),
                    reader.GetString(4)
                ));
            }

            return Results.Ok(list);
        });

        group.MapPost("/", async (ProductCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var newId = await GetNextId(connection, "Product", "ProductId");
            var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES ($id, $sku, $description, $categoryId);";
            command.Parameters.AddWithValue("$id", newId);
            command.Parameters.AddWithValue("$sku", dto.SKU);
            command.Parameters.AddWithValue("$description", dto.Description ?? string.Empty);
            command.Parameters.AddWithValue("$categoryId", dto.CategoryId);

            await command.ExecuteNonQueryAsync();
            return Results.Created($"/api/admin/products/{newId}", new ProductDto(newId, dto.SKU, dto.Description ?? string.Empty, dto.CategoryId, string.Empty));
        });

        group.MapPut("/{id:int}", async (int id, ProductCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"UPDATE Product SET SKU = $sku, Description = $description, CategoryId = $categoryId WHERE ProductId = $id;";
            command.Parameters.AddWithValue("$id", id);
            command.Parameters.AddWithValue("$sku", dto.SKU);
            command.Parameters.AddWithValue("$description", dto.Description ?? string.Empty);
            command.Parameters.AddWithValue("$categoryId", dto.CategoryId);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"DELETE FROM Product WHERE ProductId = $id;";
            command.Parameters.AddWithValue("$id", id);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });
    }

    public static async Task<int> GetNextId(SqliteConnection connection, string table, string idColumn)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = $"SELECT COALESCE(MAX({idColumn}), 0) + 1 FROM {table};";
        var result = await command.ExecuteScalarAsync();
        return result is long longValue ? (int)longValue : 1;
    }
}