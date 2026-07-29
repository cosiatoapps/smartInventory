namespace FoodCost.Api.Dtos;

public record FoodCostMetricsDto(
    decimal TheoreticalCost, 
    decimal RealCost, 
    decimal VarianceCost, 
    decimal FoodCostPercent, 
    decimal FoodWastePercent
);

public record FoodCostSummaryDto(int RecipeCount, int WasteEvents);

public record WasteLogDto(
    int WasteLogId, 
    string Category, 
    string Description, 
    decimal Quantity, 
    decimal Cost
);

public record WasteLogCreateDto(
    string Category, 
    string? Description, 
    decimal Quantity, 
    decimal Cost
);