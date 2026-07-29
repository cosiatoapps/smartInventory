namespace Production.Api.Dtos;

public record RecipeDto(int RecipeId, string Description, decimal Cost);
public record RecipeCreateDto(string Name, string? PosPluCode, int YieldQuantity, decimal StandardYieldPct);

public record ProductionOrderDto(
    int ProductionOrderId, 
    int RecipeId, 
    string RecipeDescription, 
    decimal RawMaterialUsedQty, 
    decimal Quantity, 
    decimal ActualYieldPct
);

public record ProductionOrderCreateDto(
    int SiteId, 
    int RecipeId, 
    decimal RawMaterialUsedQty, 
    decimal UsefulOutputQty
);

public record ProductionMetricsDto(
    int OrderCount, 
    int RecipeCount, 
    decimal TotalProduction, 
    decimal AverageYield, 
    decimal WastePercent
);

public record RecipeIngredientDto(
    int ProductId, 
    decimal Quantity, 
    int UnitOfMeasureId, 
    decimal ExpectedWastePct,
    string? ProductName = null
);

public record RecipeCreateFullDto(
    string Name, 
    string? PosPluCode, 
    int YieldQuantity, 
    decimal StandardYieldPct, 
    decimal EstimatedCost, 
    List<RecipeIngredientDto> Items
);

public record RecipeFullDto(
    int RecipeId, 
    string Name, 
    string PosPluCode, 
    int YieldQuantity, 
    decimal StandardYieldPct, 
    decimal EstimatedCost, 
    List<RecipeIngredientDto> Items
);