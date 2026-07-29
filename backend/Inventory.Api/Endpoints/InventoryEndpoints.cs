using Inventory.Api.Dtos;
using Microsoft.Data.Sqlite;

namespace Inventory.Api.Endpoints;

public static class InventoryEndpoints
{
    public static void MapInventoryEndpoints(this IEndpointRouteBuilder routes, string dbPath)
    {
        var group = routes.MapGroup("/api");

        group.MapGet("/inventory", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText =
                @"SELECT i.InventoryId,
                         p.SKU,
                         p.Description AS Product,
                         COALESCE(c.Name, 'Sin Categoría') AS Category,
                         l.Code AS Location,
                         w.Name AS Warehouse,
                         i.Quantity,
                         i.Lot,
                         i.ExpiryDate
                  FROM InventoryBalance i
                  LEFT JOIN Product p ON p.ProductId = i.ProductId
                  LEFT JOIN Category c ON c.CategoryId = p.CategoryId
                  LEFT JOIN Location l ON l.LocationId = i.LocationId
                  LEFT JOIN Warehouse w ON w.WarehouseId = l.WarehouseId
                  ORDER BY i.InventoryId;";

            var inventory = new List<InventoryItemDto>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                inventory.Add(new InventoryItemDto(
                    reader.GetInt32(0),
                    reader.IsDBNull(1) ? "S/N" : reader.GetString(1),
                    reader.IsDBNull(2) ? "Sin Descripción" : reader.GetString(2),
                    reader.GetString(3),
                    reader.IsDBNull(4) ? "Gral" : reader.GetString(4),
                    reader.IsDBNull(5) ? "Principal" : reader.GetString(5),
                    reader.GetDecimal(6),
                    reader.IsDBNull(7) ? "-" : reader.GetString(7),
                    reader.IsDBNull(8) ? null : reader.GetString(8)
                ));
            }

            return Results.Ok(inventory);
        });

        group.MapGet("/metrics", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var totalInventory = await ExecuteScalarDecimal(connection, "SELECT COALESCE(SUM(Quantity), 0) FROM InventoryBalance;");
            var activeProducts = await ExecuteScalarInt(connection, "SELECT COUNT(DISTINCT ProductId) FROM InventoryBalance;");
            var expiringSoon = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM InventoryBalance WHERE ExpiryDate IS NOT NULL AND ExpiryDate <= DATE('now','+30 day');");

            return Results.Ok(new InventoryMetricsDto(totalInventory, activeProducts, expiringSoon));
        });

        group.MapGet("/summary", async () =>
        {
            await using var connection = new SqliteConnection($"Data Source={dbPath}");
            await connection.OpenAsync();

            var productCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Product;");
            var locationCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Location;");
            var warehouseCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Warehouse;");

            return Results.Ok(new SummaryDto(productCount, locationCount, warehouseCount));
        });
    }

    private static async Task<int> ExecuteScalarInt(SqliteConnection connection, string sql)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        var result = await command.ExecuteScalarAsync();
        return result is long longValue ? (int)longValue : 0;
    }

    private static async Task<decimal> ExecuteScalarDecimal(SqliteConnection connection, string sql)
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