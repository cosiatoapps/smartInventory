using Inventory.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace Inventory.Api.Endpoints;

public static class UnitOfMeasureEndpoints
{
    public static void MapUnitOfMeasureEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/admin/unitsofmeasure");

        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"SELECT UnitOfMeasureId, Code, Name FROM UnitOfMeasure ORDER BY Code;";

            var list = new List<UnitOfMeasureDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new UnitOfMeasureDto(reader.GetInt32(0), reader.GetString(1), reader.GetString(2)));
            }

            return Results.Ok(list);
        });
    }
}