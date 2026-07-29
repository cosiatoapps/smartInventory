using Inventory.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace Inventory.Api.Endpoints;

public static class SubsidiaryEndpoints
{
    public static void MapSubsidiaryEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/admin/subsidiaries");

        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"SELECT SubsidiaryId, CompanyId, Name FROM Subsidiary ORDER BY Name;";

            var list = new List<SubsidiaryDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new SubsidiaryDto(reader.GetInt32(0), reader.GetInt32(1), reader.GetString(2)));
            }

            return Results.Ok(list);
        });

        group.MapPost("/", async (SubsidiaryCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var newId = await ProductEndpoints.GetNextId(connection, "Subsidiary", "SubsidiaryId");
            var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Subsidiary (SubsidiaryId, CompanyId, Name) VALUES ($id, $companyId, $name);";
            command.Parameters.AddWithValue("$id", newId);
            command.Parameters.AddWithValue("$companyId", dto.CompanyId);
            command.Parameters.AddWithValue("$name", dto.Name);

            await command.ExecuteNonQueryAsync();
            return Results.Created($"/api/admin/subsidiaries/{newId}", new SubsidiaryDto(newId, dto.CompanyId, dto.Name));
        });

        group.MapPut("/{id:int}", async (int id, SubsidiaryCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"UPDATE Subsidiary SET CompanyId = $companyId, Name = $name WHERE SubsidiaryId = $id;";
            command.Parameters.AddWithValue("$id", id);
            command.Parameters.AddWithValue("$companyId", dto.CompanyId);
            command.Parameters.AddWithValue("$name", dto.Name);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:int}", async (int id) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"DELETE FROM Subsidiary WHERE SubsidiaryId = $id;";
            command.Parameters.AddWithValue("$id", id);

            await command.ExecuteNonQueryAsync();
            return Results.NoContent();
        });
    }
}