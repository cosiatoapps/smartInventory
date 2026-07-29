BEGIN TRANSACTION;

-- ============================================================================
-- 1. ESTRUCTURA ORGANIZACIONAL Y UBICACIONES (Existente)
-- ============================================================================
INSERT INTO Company (CompanyId, Name, Country, Status) VALUES (1, 'SmartInventory AI Group', 'USA', 'Active');

INSERT INTO Subsidiary (SubsidiaryId, CompanyId, Name) VALUES (1, 1, 'SmartInventory North America');
INSERT INTO Subsidiary (SubsidiaryId, CompanyId, Name) VALUES (2, 1, 'SmartInventory EMEA');

INSERT INTO Site (SiteId, SubsidiaryId, Name, Type) VALUES (1, 1, 'HQ Nashville', 'Office');
INSERT INTO Site (SiteId, SubsidiaryId, Name, Type) VALUES (2, 1, 'Distribution Center', 'Warehouse');
INSERT INTO Site (SiteId, SubsidiaryId, Name, Type) VALUES (3, 2, 'EMEA Logistics', 'Warehouse');

INSERT INTO Warehouse (WarehouseId, SiteId, Name) VALUES (1, 2, 'Central Warehouse');
INSERT INTO Warehouse (WarehouseId, SiteId, Name) VALUES (2, 2, 'Cold Storage 1');
INSERT INTO Warehouse (WarehouseId, SiteId, Name) VALUES (3, 3, 'EMEA Hub');
INSERT INTO Warehouse (WarehouseId, SiteId, Name) VALUES (4, 2, 'Dry Goods Warehouse');
INSERT INTO Warehouse (WarehouseId, SiteId, Name) VALUES (5, 3, 'Fresh Produce Unit');
INSERT INTO Warehouse (WarehouseId, SiteId, Name) VALUES (6, 1, 'R&D Test Storage');

INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (1, 1, 'A1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (2, 1, 'A2');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (3, 1, 'B1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (4, 2, 'C1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (5, 2, 'C2');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (6, 2, 'D1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (7, 3, 'E1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (8, 3, 'E2');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (9, 3, 'F1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (10, 4, 'G1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (11, 4, 'G2');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (12, 4, 'H1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (13, 5, 'I1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (14, 5, 'I2');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (15, 5, 'J1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (16, 6, 'K1');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (17, 6, 'K2');
INSERT INTO Location (LocationId, WarehouseId, Code) VALUES (18, 6, 'L1');

-- ============================================================================
-- 2. CATEGORÍAS Y PRODUCTOS (Existente)
-- ============================================================================
INSERT INTO Category (CategoryId, Name) VALUES (1, 'Dairy');
INSERT INTO Category (CategoryId, Name) VALUES (2, 'Proteins');
INSERT INTO Category (CategoryId, Name) VALUES (3, 'Produce');
INSERT INTO Category (CategoryId, Name) VALUES (4, 'Beverages');
INSERT INTO Category (CategoryId, Name) VALUES (5, 'Dry Goods');
INSERT INTO Category (CategoryId, Name) VALUES (6, 'Chemicals');

INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1001, 'SKU-1001', 'Whole Milk 1L', 1);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1002, 'SKU-1002', 'Cheddar Cheese 500g', 1);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1003, 'SKU-1003', 'Greek Yogurt 150g', 1);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1004, 'SKU-1004', 'Chicken Breast 1kg', 2);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1005, 'SKU-1005', 'Ground Beef 1kg', 2);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1006, 'SKU-1006', 'Pork Loin 1kg', 2);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1007, 'SKU-1007', 'Tomatoes 1kg', 3);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1008, 'SKU-1008', 'Lettuce 1 unit', 3);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1009, 'SKU-1009', 'Apples 1kg', 3);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1010, 'SKU-1010', 'Orange Juice 2L', 4);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1011, 'SKU-1011', 'Coffee Beans 1kg', 4);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1012, 'SKU-1012', 'Sparkling Water 24pk', 4);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1013, 'SKU-1013', 'Flour 5kg', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1014, 'SKU-1014', 'Sugar 2kg', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1015, 'SKU-1015', 'Rice 10kg', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1016, 'SKU-1016', 'Baking Soda 1kg', 6);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1017, 'SKU-1017', 'Sanitizer 500ml', 6);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1018, 'SKU-1018', 'Cleaning Towels', 6);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1019, 'SKU-1019', 'Olive Oil 1L', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1020, 'SKU-1020', 'Butter 250g', 1);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1021, 'SKU-1021', 'Yogurt Drink 1L', 1);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1022, 'SKU-1022', 'Beef Steak 500g', 2);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1023, 'SKU-1023', 'Poultry Thigh 1kg', 2);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1024, 'SKU-1024', 'Cucumber 1 unit', 3);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1025, 'SKU-1025', 'Banana 1kg', 3);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1026, 'SKU-1026', 'Tea Bags 100ct', 4);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1027, 'SKU-1027', 'Energy Drink 6pk', 4);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1028, 'SKU-1028', 'Pasta 5kg', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1029, 'SKU-1029', 'Breadcrumbs 1kg', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1030, 'SKU-1030', 'Detergent 5L', 6);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1031, 'SKU-1031', 'Glass Cleaner 1L', 6);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1032, 'SKU-1032', 'Salt 1kg', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1033, 'SKU-1033', 'Black Pepper 100g', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1034, 'SKU-1034', 'Ice Cream 1L', 1);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1035, 'SKU-1035', 'Turkey Breast 1kg', 2);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1036, 'SKU-1036', 'Spinach 500g', 3);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1037, 'SKU-1037', 'Lemon 1kg', 3);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1038, 'SKU-1038', 'Cola 24pk', 4);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1039, 'SKU-1039', 'Nuts Mix 1kg', 5);
INSERT INTO Product (ProductId, SKU, Description, CategoryId) VALUES (1040, 'SKU-1040', 'Surface Spray 1L', 6);

-- ============================================================================
-- 3. UNIDADES DE MEDIDA Y CONVERSIONES (NUEVO)
-- ============================================================================
INSERT INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (1, 'Kg', 'Kilogramos');
INSERT INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (2, 'Gr', 'Gramos');
INSERT INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (3, 'Lt', 'Litros');
INSERT INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (4, 'Ml', 'Militros');
INSERT INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (5, 'Und', 'Unidades');
INSERT INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (6, 'Cja', 'Caja');

-- Factores de Conversión por producto (Ejemplos)
INSERT INTO UnitConversionFactor (UnitConversionFactorId, ProductId, FromUnitId, ToUnitId, Factor) VALUES (1, 1013, 6, 1, 5.0000);  -- 1 Caja de Harina = 5 Kg
INSERT INTO UnitConversionFactor (UnitConversionFactorId, ProductId, FromUnitId, ToUnitId, Factor) VALUES (2, 1019, 3, 4, 1000.0000);-- 1 Lt Aceite = 1000 Ml
INSERT INTO UnitConversionFactor (UnitConversionFactorId, ProductId, FromUnitId, ToUnitId, Factor) VALUES (3, 1005, 1, 2, 1000.0000);-- 1 Kg Carne = 1000 Gr

-- ============================================================================
-- 4. INVENTARIOS Y CONTEOS (Existente)
-- ============================================================================
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (1, 1, 1001, 120.50, 'L001', '2026-12-31');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (2, 1, 1002, 45.00, 'L002', '2026-09-20');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (3, 2, 1003, 60.00, 'L003', '2026-10-05');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (4, 2, 1004, 25.70, 'L004', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (5, 3, 1005, 38.20, 'L005', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (6, 3, 1006, 19.00, 'L006', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (7, 4, 1007, 82.40, 'L007', '2026-09-05');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (8, 4, 1008, 12.00, 'L008', '2026-08-15');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (9, 5, 1009, 28.00, 'L009', '2026-09-12');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (10, 5, 1010, 14.00, 'L010', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (11, 6, 1011, 9.80, 'L011', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (12, 6, 1012, 18.00, 'L012', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (13, 7, 1013, 220.00, 'L013', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (14, 7, 1014, 97.60, 'L014', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (15, 8, 1015, 300.00, 'L015', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (16, 8, 1016, 55.00, 'L016', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (17, 9, 1017, 26.75, 'L017', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (18, 9, 1018, 40.00, 'L018', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (19, 10, 1019, 73.20, 'L019', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (20, 10, 1020, 18.30, 'L020', '2026-08-28');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (21, 11, 1021, 34.00, 'L021', '2026-10-15');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (22, 11, 1022, 12.40, 'L022', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (23, 12, 1023, 27.50, 'L023', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (24, 12, 1024, 100.00, 'L024', '2026-11-02');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (25, 13, 1025, 67.20, 'L025', '2026-09-21');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (26, 13, 1026, 48.00, 'L026', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (27, 14, 1027, 38.50, 'L027', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (28, 14, 1028, 132.00, 'L028', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (29, 15, 1029, 15.80, 'L029', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (30, 15, 1030, 21.00, 'L030', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (31, 16, 1031, 13.75, 'L031', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (32, 16, 1032, 89.00, 'L032', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (33, 17, 1033, 6.00, 'L033', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (34, 17, 1034, 42.10, 'L034', '2026-10-01');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (35, 18, 1035, 19.90, 'L035', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (36, 18, 1036, 40.00, 'L036', '2026-09-08');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (37, 1, 1037, 14.00, 'L037', '2026-08-12');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (38, 2, 1038, 96.00, 'L038', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (39, 3, 1039, 54.00, 'L039', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (40, 4, 1040, 21.00, 'L040', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (41, 5, 1001, 68.00, 'L041', '2026-11-14');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (42, 6, 1002, 32.00, 'L042', '2026-09-01');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (43, 7, 1003, 72.00, 'L043', '2026-10-10');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (44, 8, 1004, 14.00, 'L044', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (45, 9, 1005, 39.00, 'L045', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (46, 10, 1006, 18.00, 'L046', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (47, 11, 1007, 88.25, 'L047', '2026-08-22');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (48, 12, 1008, 10.00, 'L048', '2026-08-17');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (49, 13, 1009, 28.00, 'L049', '2026-09-18');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (50, 14, 1010, 16.00, 'L050', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (51, 15, 1011, 11.00, 'L051', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (52, 16, 1012, 20.00, 'L052', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (53, 17, 1013, 210.00, 'L053', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (54, 18, 1014, 82.00, 'L054', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (55, 1, 1015, 310.00, 'L055', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (56, 2, 1016, 62.00, 'L056', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (57, 3, 1017, 29.50, 'L057', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (58, 4, 1018, 44.00, 'L058', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (59, 5, 1019, 78.00, 'L059', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (60, 6, 1020, 24.50, 'L060', '2026-08-25');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (61, 7, 1021, 37.00, 'L061', '2026-10-22');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (62, 8, 1022, 14.00, 'L062', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (63, 9, 1023, 30.00, 'L063', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (64, 10, 1024, 110.00, 'L064', '2026-11-05');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (65, 11, 1025, 75.20, 'L065', '2026-09-02');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (66, 12, 1026, 50.00, 'L066', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (67, 13, 1027, 42.00, 'L067', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (68, 14, 1028, 138.00, 'L068', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (69, 15, 1029, 20.00, 'L069', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (70, 16, 1030, 26.00, 'L070', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (71, 17, 1031, 15.50, 'L071', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (72, 18, 1032, 91.00, 'L072', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (73, 1, 1033, 8.00, 'L073', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (74, 2, 1034, 47.00, 'L074', '2026-10-12');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (75, 3, 1035, 21.00, 'L075', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (76, 4, 1036, 45.00, 'L076', '2026-09-10');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (77, 5, 1037, 18.00, 'L077', '2026-08-18');
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (78, 6, 1038, 98.00, 'L078', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (79, 7, 1039, 58.00, 'L079', NULL);
INSERT INTO InventoryBalance (InventoryId, LocationId, ProductId, Quantity, Lot, ExpiryDate) VALUES (80, 8, 1040, 23.00, 'L080', NULL);

INSERT INTO InventoryCount (CountId, LocationId, CountDate) VALUES (1, 1, '2026-07-01 08:00:00');
INSERT INTO InventoryCount (CountId, LocationId, CountDate) VALUES (2, 2, '2026-07-02 08:30:00');
INSERT INTO InventoryCount (CountId, LocationId, CountDate) VALUES (3, 3, '2026-07-03 09:00:00');

INSERT INTO InventoryCountDetail (DetailId, CountId, ProductId, Quantity) VALUES (1, 1, 1001, 120.5);
INSERT INTO InventoryCountDetail (DetailId, CountId, ProductId, Quantity) VALUES (2, 1, 1002, 45.0);
INSERT INTO InventoryCountDetail (DetailId, CountId, ProductId, Quantity) VALUES (3, 2, 1007, 82.4);

-- ============================================================================
-- 5. RECETAS, INGREDIENTES Y PRODUCCIÓN CON RENDIMIENTO/YIELD (AJUSTADO)
-- ============================================================================
-- Receta 1: Margherita Pizza
INSERT INTO Recipe (RecipeId, Name, PosPluCode, YieldQuantity, StandardYieldPct, EstimatedCost) 
VALUES (1, 'Margherita Pizza', 'PLU-101', 1, 92.50, 4.50);

-- Receta 2: Beef Burger Deluxe
INSERT INTO Recipe (RecipeId, Name, PosPluCode, YieldQuantity, StandardYieldPct, EstimatedCost) 
VALUES (2, 'Beef Burger Deluxe', 'PLU-102', 1, 88.00, 6.20);

-- Ingredientes Margherita Pizza (Flour 5kg, Olive Oil 1L, Tomatoes 1kg)
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (1, 1, 1013, 0.2500, 1, 2.00); -- 250 Gr Harina (Kg)
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (2, 1, 1019, 0.0300, 3, 0.00); -- 30 Ml Aceite Olive (Lt)
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (3, 1, 1007, 0.1500, 1, 5.00); -- 150 Gr Tomate (Kg)

-- Ingredientes Beef Burger Deluxe (Ground Beef 1kg, Cheddar Cheese 500g, Lettuce)
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (4, 2, 1005, 0.2000, 1, 10.00); -- 200 Gr Carne Molida
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (5, 2, 1002, 0.0500, 1, 2.00);  -- 50 Gr Queso Cheddar
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (6, 2, 1008, 0.2500, 5, 8.00);  -- 0.25 Unidades Lechuga

-- Órdenes de Producción (Entrada bruta, Salida útil obtenida y Rendimiento Real calculado)
INSERT INTO ProductionOrder (ProductionId, SiteId, RecipeId, RawMaterialUsedQty, UsefulOutputQty, ActualYieldPct, ProductionDate) 
VALUES (1, 2, 1, 130.0000, 120.0000, 92.31, '2026-07-20 10:00:00');

INSERT INTO ProductionOrder (ProductionId, SiteId, RecipeId, RawMaterialUsedQty, UsefulOutputQty, ActualYieldPct, ProductionDate) 
VALUES (2, 2, 2, 50.0000, 43.5000, 87.00, '2026-07-22 14:30:00');

-- ============================================================================
-- 6. MERMAS Y REGISTRO DE VENTAS DEL POS (AJUSTADO Y NUEVO)
-- ============================================================================
INSERT INTO WasteLog (WasteId, Category, Reason, Quantity, Cost) VALUES (1, 'Food', 'Expired cheese', 12.5, 45.0);
INSERT INTO WasteLog (WasteId, Category, Reason, Quantity, Cost) VALUES (2, 'Inventory', 'Damaged packaging', 8.0, 22.0);

-- Ventas reportadas por el Punto de Venta (POS) para calcular Consumo Teórico
INSERT INTO PosSaleItem (SaleItemId, SiteId, PluCode, QuantitySold, SaleDate) 
VALUES (1, 2, 'PLU-101', 85.00, '2026-07-25 21:00:00');

INSERT INTO PosSaleItem (SaleItemId, SiteId, PluCode, QuantitySold, SaleDate) 
VALUES (2, 2, 'PLU-102', 40.00, '2026-07-25 21:00:00');

COMMIT;