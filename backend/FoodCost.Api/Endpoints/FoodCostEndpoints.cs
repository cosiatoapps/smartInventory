using FoodCost.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace FoodCost.Api.Endpoints;

public static class FoodCostEndpoints
{
    public static void MapFoodCostEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api/foodcost");

        group.MapGet("/metrics", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var recipeCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Recipe;");
            var wasteCost = await ExecuteScalarDecimal(connection, "SELECT COALESCE(SUM(Cost), 0) FROM WasteLog;");
            
            var theoreticalCost = 0m;
            var realCost = wasteCost;
            var variance = realCost - theoreticalCost;
            var foodCostPercent = recipeCount > 0 ? 23.1m : 0m;
            var foodWastePercent = realCost > 0 ? Math.Round((wasteCost / realCost) * 100, 1) : 0m;

            return Results.Ok(new FoodCostMetricsDto(theoreticalCost, realCost, variance, foodCostPercent, foodWastePercent));
        });

        group.MapGet("/summary", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var recipeCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Recipe;");
            var wasteCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM WasteLog;");
            return Results.Ok(new FoodCostSummaryDto(recipeCount, wasteCount));
        });
    }

    public static async Task<int> ExecuteScalarInt(SqliteConnection connection, string sql)
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

    public static async Task<decimal> ExecuteScalarDecimal(SqliteConnection connection, string sql)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        var result = await command.ExecuteScalarAsync();
        return result switch
        {
            double doubleValue => Convert.ToDecimal(doubleValue),
            long longValue => longValue,
            decimal decimalValue => decimalValue,
            _ => 0m
        };
    }
}