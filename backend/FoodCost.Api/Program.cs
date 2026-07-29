using FoodCost.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Configuración de CORS más flexible para desarrollo
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
app.MapFoodCostEndpoints(dbPath);
app.MapWasteEndpoints(dbPath);

app.MapGet("/api/health", () => new { Service = "FoodCost.Api", Status = "OK" });

app.Run();