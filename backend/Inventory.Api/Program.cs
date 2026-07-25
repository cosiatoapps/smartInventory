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

app.MapGet("/api/admin/subsidiaries", async () =>
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

    return list;
});

app.MapPost("/api/admin/subsidiaries", async (SubsidiaryCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var newId = await GetNextId(connection, "Subsidiary", "SubsidiaryId");
    var command = connection.CreateCommand();
    command.CommandText = @"INSERT INTO Subsidiary (SubsidiaryId, CompanyId, Name) VALUES ($id, $companyId, $name);";
    command.Parameters.AddWithValue("$id", newId);
    command.Parameters.AddWithValue("$companyId", dto.CompanyId);
    command.Parameters.AddWithValue("$name", dto.Name);

    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/admin/subsidiaries/{newId}", new SubsidiaryDto(newId, dto.CompanyId, dto.Name));
});

app.MapPut("/api/admin/subsidiaries/{id}", async (int id, SubsidiaryCreateDto dto) =>
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

app.MapDelete("/api/admin/subsidiaries/{id}", async (int id) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"DELETE FROM Subsidiary WHERE SubsidiaryId = $id;";
    command.Parameters.AddWithValue("$id", id);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapGet("/api/admin/sites", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"SELECT s.SiteId, s.SubsidiaryId, s.Name, s.Type, sub.Name FROM Site s
                             LEFT JOIN Subsidiary sub ON sub.SubsidiaryId = s.SubsidiaryId
                             ORDER BY s.Name;";

    var list = new List<SiteDto>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        list.Add(new SiteDto(
            reader.GetInt32(0),
            reader.GetInt32(1),
            reader.GetString(2),
            reader.GetString(3),
            reader.IsDBNull(4) ? string.Empty : reader.GetString(4)
        ));
    }

    return list;
});

app.MapPost("/api/admin/sites", async (SiteCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var newId = await GetNextId(connection, "Site", "SiteId");
    var command = connection.CreateCommand();
    command.CommandText = @"INSERT INTO Site (SiteId, SubsidiaryId, Name, Type) VALUES ($id, $subsidiaryId, $name, $type);";
    command.Parameters.AddWithValue("$id", newId);
    command.Parameters.AddWithValue("$subsidiaryId", dto.SubsidiaryId);
    command.Parameters.AddWithValue("$name", dto.Name);
    command.Parameters.AddWithValue("$type", dto.Type);

    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/admin/sites/{newId}", new SiteDto(newId, dto.SubsidiaryId, dto.Name, dto.Type, string.Empty));
});

app.MapPut("/api/admin/sites/{id}", async (int id, SiteCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"UPDATE Site SET SubsidiaryId = $subsidiaryId, Name = $name, Type = $type WHERE SiteId = $id;";
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$subsidiaryId", dto.SubsidiaryId);
    command.Parameters.AddWithValue("$name", dto.Name);
    command.Parameters.AddWithValue("$type", dto.Type);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapDelete("/api/admin/sites/{id}", async (int id) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"DELETE FROM Site WHERE SiteId = $id;";
    command.Parameters.AddWithValue("$id", id);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapGet("/api/admin/warehouses", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"SELECT w.WarehouseId, w.SiteId, w.Name, s.Name FROM Warehouse w
                             LEFT JOIN Site s ON s.SiteId = w.SiteId
                             ORDER BY w.Name;";

    var list = new List<WarehouseDto>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        list.Add(new WarehouseDto(
            reader.GetInt32(0),
            reader.GetInt32(1),
            reader.GetString(2),
            reader.IsDBNull(3) ? string.Empty : reader.GetString(3)
        ));
    }

    return list;
});

app.MapPost("/api/admin/warehouses", async (WarehouseCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var newId = await GetNextId(connection, "Warehouse", "WarehouseId");
    var command = connection.CreateCommand();
    command.CommandText = @"INSERT INTO Warehouse (WarehouseId, SiteId, Name) VALUES ($id, $siteId, $name);";
    command.Parameters.AddWithValue("$id", newId);
    command.Parameters.AddWithValue("$siteId", dto.SiteId);
    command.Parameters.AddWithValue("$name", dto.Name);

    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/admin/warehouses/{newId}", new WarehouseDto(newId, dto.SiteId, dto.Name, string.Empty));
});

app.MapPut("/api/admin/warehouses/{id}", async (int id, WarehouseCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"UPDATE Warehouse SET SiteId = $siteId, Name = $name WHERE WarehouseId = $id;";
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$siteId", dto.SiteId);
    command.Parameters.AddWithValue("$name", dto.Name);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapDelete("/api/admin/warehouses/{id}", async (int id) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"DELETE FROM Warehouse WHERE WarehouseId = $id;";
    command.Parameters.AddWithValue("$id", id);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapGet("/api/admin/locations", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"SELECT l.LocationId, l.WarehouseId, l.Code, w.Name FROM Location l
                             LEFT JOIN Warehouse w ON w.WarehouseId = l.WarehouseId
                             ORDER BY l.Code;";

    var list = new List<LocationDto>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        list.Add(new LocationDto(
            reader.GetInt32(0),
            reader.GetInt32(1),
            reader.GetString(2),
            reader.IsDBNull(3) ? string.Empty : reader.GetString(3)
        ));
    }

    return list;
});

app.MapPost("/api/admin/locations", async (LocationCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var newId = await GetNextId(connection, "Location", "LocationId");
    var command = connection.CreateCommand();
    command.CommandText = @"INSERT INTO Location (LocationId, WarehouseId, Code) VALUES ($id, $warehouseId, $code);";
    command.Parameters.AddWithValue("$id", newId);
    command.Parameters.AddWithValue("$warehouseId", dto.WarehouseId);
    command.Parameters.AddWithValue("$code", dto.Code);

    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/admin/locations/{newId}", new LocationDto(newId, dto.WarehouseId, dto.Code, string.Empty));
});

app.MapPut("/api/admin/locations/{id}", async (int id, LocationCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"UPDATE Location SET WarehouseId = $warehouseId, Code = $code WHERE LocationId = $id;";
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$warehouseId", dto.WarehouseId);
    command.Parameters.AddWithValue("$code", dto.Code);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapDelete("/api/admin/locations/{id}", async (int id) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"DELETE FROM Location WHERE LocationId = $id;";
    command.Parameters.AddWithValue("$id", id);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapGet("/api/admin/categories", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"SELECT CategoryId, Name FROM Category ORDER BY Name;";

    var list = new List<CategoryDto>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        list.Add(new CategoryDto(reader.GetInt32(0), reader.GetString(1)));
    }

    return list;
});

app.MapPost("/api/admin/categories", async (CategoryCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var newId = await GetNextId(connection, "Category", "CategoryId");
    var command = connection.CreateCommand();
    command.CommandText = @"INSERT INTO Category (CategoryId, Name) VALUES ($id, $name);";
    command.Parameters.AddWithValue("$id", newId);
    command.Parameters.AddWithValue("$name", dto.Name);

    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/admin/categories/{newId}", new CategoryDto(newId, dto.Name));
});

app.MapPut("/api/admin/categories/{id}", async (int id, CategoryCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"UPDATE Category SET Name = $name WHERE CategoryId = $id;";
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$name", dto.Name);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapDelete("/api/admin/categories/{id}", async (int id) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"DELETE FROM Category WHERE CategoryId = $id;";
    command.Parameters.AddWithValue("$id", id);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapGet("/api/admin/products", async () =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"SELECT p.ProductId, p.SKU, p.Description, p.CategoryId, c.Name FROM Product p
                             LEFT JOIN Category c ON c.CategoryId = p.CategoryId
                             ORDER BY p.SKU;";

    var list = new List<ProductDto>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        list.Add(new ProductDto(
            reader.GetInt32(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetInt32(3),
            reader.IsDBNull(4) ? string.Empty : reader.GetString(4)
        ));
    }

    return list;
});

app.MapPost("/api/admin/products", async (ProductCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var newId = await GetNextId(connection, "Product", "ProductId");
    var command = connection.CreateCommand();
    command.CommandText = @"INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES ($id, $sku, $description, $categoryId);";
    command.Parameters.AddWithValue("$id", newId);
    command.Parameters.AddWithValue("$sku", dto.SKU);
    command.Parameters.AddWithValue("$description", dto.Description);
    command.Parameters.AddWithValue("$categoryId", dto.CategoryId);

    await command.ExecuteNonQueryAsync();
    return Results.Created($"/api/admin/products/{newId}", new ProductDto(newId, dto.SKU, dto.Description, dto.CategoryId, string.Empty));
});

app.MapPut("/api/admin/products/{id}", async (int id, ProductCreateDto dto) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"UPDATE Product SET SKU = $sku, Description = $description, CategoryId = $categoryId WHERE ProductId = $id;";
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$sku", dto.SKU);
    command.Parameters.AddWithValue("$description", dto.Description);
    command.Parameters.AddWithValue("$categoryId", dto.CategoryId);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
});

app.MapDelete("/api/admin/products/{id}", async (int id) =>
{
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"DELETE FROM Product WHERE ProductId = $id;";
    command.Parameters.AddWithValue("$id", id);

    await command.ExecuteNonQueryAsync();
    return Results.NoContent();
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

static async Task<int> GetNextId(SqliteConnection connection, string table, string idColumn)
{
    await using var command = connection.CreateCommand();
    command.CommandText = $"SELECT COALESCE(MAX({idColumn}), 0) + 1 FROM {table};";
    var result = await command.ExecuteScalarAsync();
    return result switch
    {
        long longValue => (int)longValue,
        int intValue => intValue,
        decimal decimalValue => (int)decimalValue,
        _ => 1,
    };
}

record InventoryItemDto(int InventoryId, string SKU, string Product, string Category, string Location, string Warehouse, decimal Quantity, string Lot, string? ExpiryDate);
record RecipeDto(int RecipeId, string Description, decimal Cost);
record ProductionOrderDto(int ProductionOrderId, int RecipeId, string RecipeDescription, decimal Quantity);
record WasteLogDto(int WasteLogId, string Category, string Description, decimal Quantity, decimal Cost);
record InventoryMetricsDto(decimal TotalQuantity, int ActiveProducts, int ExpiringSoon, int RecipeCount, int ProductionOrders, int WasteCount);
record SummaryDto(int ProductCount, int LocationCount, int WarehouseCount);
record SubsidiaryDto(int SubsidiaryId, int CompanyId, string Name);
record SubsidiaryCreateDto(int CompanyId, string Name);
record SiteDto(int SiteId, int SubsidiaryId, string Name, string Type, string SubsidiaryName);
record SiteCreateDto(int SubsidiaryId, string Name, string Type);
record WarehouseDto(int WarehouseId, int SiteId, string Name, string SiteName);
record WarehouseCreateDto(int SiteId, string Name);
record LocationDto(int LocationId, int WarehouseId, string Code, string WarehouseName);
record LocationCreateDto(int WarehouseId, string Code);
record CategoryDto(int CategoryId, string Name);
record CategoryCreateDto(string Name);
record ProductDto(int ProductId, string SKU, string Description, int CategoryId, string CategoryName);
record ProductCreateDto(string SKU, string Description, int CategoryId);
