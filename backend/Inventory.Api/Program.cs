using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("dev", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            origin.StartsWith("http://127.0.0.1:517") || origin.StartsWith("http://localhost:517"))
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var dbPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "SmartInventoryAI.db"));
if (!File.Exists(dbPath))
{
    throw new FileNotFoundException("Database file not found. Create SmartInventoryAI.db from SmartInventoryAI_DataModel.sql.", dbPath);
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("dev");
app.UseHttpsRedirection();

app.MapGet("/api/inventory", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText =
        @"SELECT i.InventoryId,
                 p.SKU,
                 p.Description AS Product,
                 c.Name AS Category,
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
            reader.GetString(1),
            reader.GetString(2),
            reader.GetString(3),
            reader.GetString(4),
            reader.GetString(5),
            reader.GetDecimal(6),
            reader.GetString(7),
            reader.IsDBNull(8) ? null : reader.GetString(8)
        ));
    }

    return inventory;
});

app.MapGet("/api/recipes", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText =
        @"SELECT RecipeId, Name AS Description, YieldPct AS Cost
          FROM Recipe
          ORDER BY Name;";

    var recipes = new List<RecipeDto>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        recipes.Add(new RecipeDto(
            reader.GetInt32(0),
            reader.GetString(1),
            reader.GetDecimal(2)
        ));
    }

    return recipes;
});

app.MapGet("/api/production/orders", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText =
        @"SELECT po.ProductionId AS ProductionOrderId,
                 po.RecipeId,
                 r.Name AS Description,
                 po.QuantityProduced AS Quantity
          FROM ProductionOrder po
          LEFT JOIN Recipe r ON r.RecipeId = po.RecipeId
          ORDER BY po.ProductionId;";

    var orders = new List<ProductionOrderDto>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        orders.Add(new ProductionOrderDto(
            reader.GetInt32(0),
            reader.GetInt32(1),
            reader.GetString(2),
            reader.GetDecimal(3)
        ));
    }

    return orders;
});

app.MapGet("/api/waste", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText =
        @"SELECT WasteId,
                 Category,
                 Reason AS Description,
                 Quantity,
                 Cost
          FROM WasteLog
          ORDER BY WasteId;";

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

    return waste;
});

app.MapGet("/api/metrics", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var totalInventory = await ExecuteScalarDecimal(connection, "SELECT COALESCE(SUM(Quantity), 0) FROM InventoryBalance;");
    var activeProducts = await ExecuteScalarInt(connection, "SELECT COUNT(DISTINCT ProductId) FROM InventoryBalance;");
    var expiringSoon = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM InventoryBalance WHERE ExpiryDate IS NOT NULL AND ExpiryDate <= DATE('now','+30 day');");
    var recipeCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Recipe;");
    var productionOrders = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM ProductionOrder;");
    var wasteCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM WasteLog;");

    return new InventoryMetricsDto(totalInventory, activeProducts, expiringSoon, recipeCount, productionOrders, wasteCount);
});

app.MapGet("/api/summary", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var productCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Product;");
    var locationCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Location;");
    var warehouseCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Warehouse;");

    return new SummaryDto(productCount, locationCount, warehouseCount);
});

app.MapGet("/api/health", () => new { Service = "Inventory.Api", Status = "OK" });

app.Run();

static async Task<int> ExecuteScalarInt(SqliteConnection connection, string sql)
{
    await using var command = connection.CreateCommand();
    command.CommandText = sql;
    var result = await command.ExecuteScalarAsync();
    return result is long longValue ? (int)longValue : 0;
}

static async Task<decimal> ExecuteScalarDecimal(SqliteConnection connection, string sql)
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

record InventoryItemDto(int InventoryId, string SKU, string Product, string Category, string Location, string Warehouse, decimal Quantity, string Lot, string? ExpiryDate);
record RecipeDto(int RecipeId, string Description, decimal Cost);
record ProductionOrderDto(int ProductionOrderId, int RecipeId, string RecipeDescription, decimal Quantity);
record WasteLogDto(int WasteLogId, string Category, string Description, decimal Quantity, decimal Cost);
record InventoryMetricsDto(decimal TotalQuantity, int ActiveProducts, int ExpiringSoon, int RecipeCount, int ProductionOrders, int WasteCount);
record SummaryDto(int ProductCount, int LocationCount, int WarehouseCount);
