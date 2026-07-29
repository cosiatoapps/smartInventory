namespace Inventory.Api.Dtos;

public record InventoryItemDto(int InventoryId, string SKU, string Product, string Category, string Location, string Warehouse, decimal Quantity, string Lot, string? ExpiryDate);
public record InventoryMetricsDto(decimal TotalQuantity, int ActiveProducts, int ExpiringSoon);
public record SummaryDto(int ProductCount, int LocationCount, int WarehouseCount);

public record SubsidiaryDto(int SubsidiaryId, int CompanyId, string Name);
public record SubsidiaryCreateDto(int CompanyId, string Name);

public record SiteDto(int SiteId, int SubsidiaryId, string Name, string Type, string SubsidiaryName);
public record SiteCreateDto(int SubsidiaryId, string Name, string? Type);

public record WarehouseDto(int WarehouseId, int SiteId, string Name, string SiteName);
public record WarehouseCreateDto(int SiteId, string Name);

public record LocationDto(int LocationId, int WarehouseId, string Code, string WarehouseName);
public record LocationCreateDto(int WarehouseId, string Code);

public record CategoryDto(int CategoryId, string Name);
public record CategoryCreateDto(string Name);

public record ProductDto(int ProductId, string SKU, string Description, int CategoryId, string CategoryName);
public record ProductCreateDto(string SKU, string? Description, int CategoryId);

public record UnitOfMeasureDto(int UnitOfMeasureId, string Code, string Name);