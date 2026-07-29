using FoodCost.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace FoodCost.Api.Endpoints;

public static class WasteEndpoints
{
    public static void MapWasteEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/waste");

        group.MapGet("/", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText =
                @"SELECT WasteId,
                         Category,
                         COALESCE(Reason, '') AS Description,
                         Quantity,
                         Cost
                  FROM WasteLog
                  ORDER BY WasteId DESC;";

            var waste = new List<WasteLogDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                waste.Add(new WasteLogDto(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetDecimal(3),
                    reader.GetDecimal(4)
                ));
            }

            return Results.Ok(waste);
        });

        group.MapPost("/", async (WasteLogCreateDto dto) =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var newId = await GetNextId(connection, "WasteLog", "WasteId");
            var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO WasteLog (WasteId, Category, Reason, Quantity, Cost) 
                                     VALUES ($id, $category, $reason, $quantity, $cost);";
            
            command.Parameters.AddWithValue("$id", newId);
            command.Parameters.AddWithValue("$category", dto.Category);
            command.Parameters.AddWithValue("$reason", (object?)dto.Description ?? DBNull.Value);
            command.Parameters.AddWithValue("$quantity", dto.Quantity);
            command.Parameters.AddWithValue("$cost", dto.Cost);

            await command.ExecuteNonQueryAsync();
            return Results.Created($"/api/waste/{newId}", new WasteLogDto(newId, dto.Category, dto.Description ?? string.Empty, dto.Quantity, dto.Cost));
        });
    }

    private static async Task<int> GetNextId(SqliteConnection connection, string table, string idColumn)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = $"SELECT COALESCE(MAX({idColumn}), 0) + 1 FROM {table};";
        var result = await command.ExecuteScalarAsync();
        return result switch
        {
            long longValue => (int)longValue,
            int intValue => intValue,
            _ => 1,
        };
    }
}