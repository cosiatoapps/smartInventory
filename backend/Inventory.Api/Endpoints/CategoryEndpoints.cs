using Inventory.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace Inventory.Api.Endpoints;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/admin/categories");

        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"SELECT CategoryId, Name FROM Category ORDER BY Name;";

            var list = new List<CategoryDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new CategoryDto(reader.GetInt32(0), reader.GetString(1)));
            }

            return Results.Ok(list);
        });

        group.MapPost("/", async (CategoryCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var newId = await ProductEndpoints.GetNextId(connection, "Category", "CategoryId");
            var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Category (CategoryId, Name) VALUES ($id, $name);";
            command.Parameters.AddWithValue("$id", newId);
            command.Parameters.AddWithValue("$name", dto.Name);

            await command.ExecuteNonQueryAsync();
            return Results.Created($"/api/admin/categories/{newId}", new CategoryDto(newId, dto.Name));
        });

        group.MapPut("/{id:int}", async (int id, CategoryCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"UPDATE Category SET Name = $name WHERE CategoryId = $id;";
            command.Parameters.AddWithValue("$id", id);
            command.Parameters.AddWithValue("$name", dto.Name);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"DELETE FROM Category WHERE CategoryId = $id;";
            command.Parameters.AddWithValue("$id", id);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });
    }
}