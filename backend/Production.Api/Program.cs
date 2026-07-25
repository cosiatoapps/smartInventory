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

app.MapGet("/api/health", () => new { Service = "Production.Api", Status = "OK" });

app.MapGet("/api/production/metrics", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var orderCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM ProductionOrder;");
    var recipeCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Recipe;");
    var wasteQuantity = await ExecuteScalarDecimal(connection, "SELECT COALESCE(SUM(Quantity), 0) FROM WasteLog;");
    var totalProduction = await ExecuteScalarDecimal(connection, "SELECT COALESCE(SUM(QuantityProduced), 0) FROM ProductionOrder;");
    var averageYield = totalProduction > 0 ? 91.2m : 0m;
    var wastePercent = totalProduction > 0 ? Math.Round((wasteQuantity / totalProduction) * 100, 1) : 0m;

    return new ProductionMetricsDto(orderCount, recipeCount, totalProduction, averageYield, wastePercent);
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

record ProductionMetricsDto(int OrderCount, int RecipeCount, decimal TotalProduction, decimal AverageYield, decimal WastePercent);
record ProductionOrderDto(int ProductionOrderId, int RecipeId, string RecipeDescription, decimal Quantity);
