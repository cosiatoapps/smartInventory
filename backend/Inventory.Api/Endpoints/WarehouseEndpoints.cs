using Inventory.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace Inventory.Api.Endpoints;

public static class WarehouseEndpoints
{
    public static void MapWarehouseEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/admin/warehouses");

        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"SELECT w.WarehouseId, w.SiteId, w.Name, COALESCE(s.Name, '') FROM Warehouse w
                                     LEFT JOIN Site s ON s.SiteId = w.SiteId
                                     ORDER BY w.Name;";

            var list = new List<WarehouseDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new WarehouseDto(reader.GetInt32(0), reader.GetInt32(1), reader.GetString(2), reader.GetString(3)));
            }

            return Results.Ok(list);
        });

        group.MapPost("/", async (WarehouseCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var newId = await ProductEndpoints.GetNextId(connection, "Warehouse", "WarehouseId");
            var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Warehouse (WarehouseId, SiteId, Name) VALUES ($id, $siteId, $name);";
            command.Parameters.AddWithValue("$id", newId);
            command.Parameters.AddWithValue("$siteId", dto.SiteId);
            command.Parameters.AddWithValue("$name", dto.Name);

            await command.ExecuteNonQueryAsync();
            return Results.Created($"/api/admin/warehouses/{newId}", new WarehouseDto(newId, dto.SiteId, dto.Name, string.Empty));
        });

        group.MapPut("/{id:int}", async (int id, WarehouseCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"UPDATE Warehouse SET SiteId = $siteId, Name = $name WHERE WarehouseId = $id;";
            command.Parameters.AddWithValue("$id", id);
            command.Parameters.AddWithValue("$siteId", dto.SiteId);
            command.Parameters.AddWithValue("$name", dto.Name);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"DELETE FROM Warehouse WHERE WarehouseId = $id;";
            command.Parameters.AddWithValue("$id", id);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });
    }
}