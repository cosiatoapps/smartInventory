-- Inventario por bodega
SELECT w.Name, p.SKU, p.Description, ib.Quantity
FROM InventoryBalance ib
JOIN Product p ON p.ProductId=ib.ProductId
JOIN Location l ON l.LocationId=ib.LocationId
JOIN Warehouse w ON w.WarehouseId=l.WarehouseId;

-- Productos próximos a vencer (7 días)
SELECT SKU, Description, ExpiryDate
FROM Product p
JOIN InventoryBalance ib ON p.ProductId=ib.ProductId
WHERE ExpiryDate <= DATEADD(day,7,GETDATE());

-- Top desperdicio
SELECT Category, SUM(Cost) TotalCost
FROM WasteLog
GROUP BY Category
ORDER BY TotalCost DESC;

-- Producción por receta
SELECT r.Name, SUM(po.QuantityProduced) Total
FROM ProductionOrder po
JOIN Recipe r ON r.RecipeId=po.RecipeId
GROUP BY r.Name;

-- Exactitud inventario
SELECT COUNT(*) TotalConteos
FROM InventoryCount;
