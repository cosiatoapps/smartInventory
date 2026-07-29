using Inventory.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace Inventory.Api.Endpoints;

public static class SiteEndpoints
{
    public static void MapSiteEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/admin/sites");

        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"SELECT s.SiteId, s.SubsidiaryId, s.Name, s.Type, COALESCE(sub.Name, '') FROM Site s
                                     LEFT JOIN Subsidiary sub ON sub.SubsidiaryId = s.SubsidiaryId
                                     ORDER BY s.Name;";

            var list = new List<SiteDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new SiteDto(
                    reader.GetInt32(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.IsDBNull(3) ? "General" : reader.GetString(3),
                    reader.GetString(4)
                ));
            }

            return Results.Ok(list);
        });

        group.MapPost("/", async (SiteCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var newId = await ProductEndpoints.GetNextId(connection, "Site", "SiteId");
            var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Site (SiteId, SubsidiaryId, Name, Type) VALUES ($id, $subsidiaryId, $name, $type);";
            command.Parameters.AddWithValue("$id", newId);
            command.Parameters.AddWithValue("$subsidiaryId", dto.SubsidiaryId);
            command.Parameters.AddWithValue("$name", dto.Name);
            command.Parameters.AddWithValue("$type", dto.Type ?? "General");

            await command.ExecuteNonQueryAsync();
            return Results.Created($"/api/admin/sites/{newId}", new SiteDto(newId, dto.SubsidiaryId, dto.Name, dto.Type ?? "General", string.Empty));
        });

        group.MapPut("/{id:int}", async (int id, SiteCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"UPDATE Site SET SubsidiaryId = $subsidiaryId, Name = $name, Type = $type WHERE SiteId = $id;";
            command.Parameters.AddWithValue("$id", id);
            command.Parameters.AddWithValue("$subsidiaryId", dto.SubsidiaryId);
            command.Parameters.AddWithValue("$name", dto.Name);
            command.Parameters.AddWithValue("$type", dto.Type ?? "General");

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"DELETE FROM Site WHERE SiteId = $id;";
            command.Parameters.AddWithValue("$id", id);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });
    }
}