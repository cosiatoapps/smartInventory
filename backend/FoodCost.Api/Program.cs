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

app.MapGet("/api/health", () => new { Service = "FoodCost.Api", Status = "OK" });

app.MapGet("/api/foodcost/metrics", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var recipeCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Recipe;");
    var wasteCost = await ExecuteScalarDecimal(connection, "SELECT COALESCE(SUM(Cost), 0) FROM WasteLog;");
    var theoreticalCost = 0m;
    var realCost = wasteCost;
    var variance = realCost - theoreticalCost;
    var foodCostPercent = recipeCount > 0 ? Math.Round((decimal)23.1, 1) : 0m;
    var foodWastePercent = realCost > 0 ? Math.Round((wasteCost / realCost) * 100, 1) : 0m;

    return new FoodCostMetricsDto(theoreticalCost, realCost, variance, foodCostPercent, foodWastePercent);
});

app.MapGet("/api/foodcost/summary", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var recipeCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM Recipe;");
    var wasteCount = await ExecuteScalarInt(connection, "SELECT COUNT(*) FROM WasteLog;");
    return new FoodCostSummaryDto(recipeCount, wasteCount);
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

record FoodCostMetricsDto(decimal TheoreticalCost, decimal RealCost, decimal VarianceCost, decimal FoodCostPercent, decimal FoodWastePercent);
record FoodCostSummaryDto(int RecipeCount, int WasteEvents);
