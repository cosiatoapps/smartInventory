using Inventory.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace Inventory.Api.Endpoints;

public static class LocationEndpoints
{
    public static void MapLocationEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/admin/locations");

        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"SELECT l.LocationId, l.WarehouseId, l.Code, COALESCE(w.Name, '') FROM Location l
                                     LEFT JOIN Warehouse w ON w.WarehouseId = l.WarehouseId
                                     ORDER BY l.Code;";

            var list = new List<LocationDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new LocationDto(reader.GetInt32(0), reader.GetInt32(1), reader.GetString(2), reader.GetString(3)));
            }

            return Results.Ok(list);
        });

        group.MapPost("/", async (LocationCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var newId = await ProductEndpoints.GetNextId(connection, "Location", "LocationId");
            var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Location (LocationId, WarehouseId, Code) VALUES ($id, $warehouseId, $code);";
            command.Parameters.AddWithValue("$id", newId);
            command.Parameters.AddWithValue("$warehouseId", dto.WarehouseId);
            command.Parameters.AddWithValue("$code", dto.Code);

            await command.ExecuteNonQueryAsync();
            return Results.Created($"/api/admin/locations/{newId}", new LocationDto(newId, dto.WarehouseId, dto.Code, string.Empty));
        });

        group.MapPut("/{id:int}", async (int id, LocationCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"UPDATE Location SET WarehouseId = $warehouseId, Code = $code WHERE LocationId = $id;";
            command.Parameters.AddWithValue("$id", id);
            command.Parameters.AddWithValue("$warehouseId", dto.WarehouseId);
            command.Parameters.AddWithValue("$code", dto.Code);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"DELETE FROM Location WHERE LocationId = $id;";
            command.Parameters.AddWithValue("$id", id);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });
    }
}