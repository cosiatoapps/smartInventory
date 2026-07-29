using Inventory.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("dev", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            origin.StartsWith("http://127.0.0.1") || 
            origin.StartsWith("http://localhost"))
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

// Registros Modulares de Minimal APIs
app.MapInventoryEndpoints(dbPath);
app.MapSubsidiaryEndpoints(dbPath);
app.MapSiteEndpoints(dbPath);
app.MapWarehouseEndpoints(dbPath);
app.MapLocationEndpoints(dbPath);
app.MapCategoryEndpoints(dbPath);
app.MapProductEndpoints(dbPath);
app.MapUnitOfMeasureEndpoints(dbPath);

app.MapGet("/api/health", () => new { Service = "Inventory.Api", Status = "OK" });

app.Run();