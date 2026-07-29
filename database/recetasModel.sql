BEGIN TRANSACTION;

-- 1. Asegurar la existencia de las tablas
CREATE TABLE IF NOT EXISTS UnitOfMeasure (
    UnitOfMeasureId INTEGER PRIMARY KEY,
    Code VARCHAR(20) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS UnitConversionFactor (
    UnitConversionFactorId INTEGER PRIMARY KEY,
    ProductId INTEGER NOT NULL,
    FromUnitId INTEGER NOT NULL,
    ToUnitId INTEGER NOT NULL,
    Factor DECIMAL(18,4) NOT NULL,
    FOREIGN KEY (ProductId) REFERENCES Product(ProductId) ON DELETE CASCADE,
    FOREIGN KEY (FromUnitId) REFERENCES UnitOfMeasure(UnitOfMeasureId),
    FOREIGN KEY (ToUnitId) REFERENCES UnitOfMeasure(UnitOfMeasureId)
);

-- 2. Inserción segura (SI YA EXISTEN, LOS REEMPLAZA O LOS IGNORA)
INSERT OR REPLACE INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (1, 'Kg', 'Kilogramos');
INSERT OR REPLACE INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (2, 'Gr', 'Gramos');
INSERT OR REPLACE INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (3, 'Lt', 'Litros');
INSERT OR REPLACE INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (4, 'Ml', 'Mililitros');
INSERT OR REPLACE INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (5, 'Und', 'Unidades');
INSERT OR REPLACE INTO UnitOfMeasure (UnitOfMeasureId, Code, Name) VALUES (6, 'Cja', 'Caja');

INSERT OR REPLACE INTO UnitConversionFactor (UnitConversionFactorId, ProductId, FromUnitId, ToUnitId, Factor) VALUES (1, 1013, 6, 1, 5.0000);
INSERT OR REPLACE INTO UnitConversionFactor (UnitConversionFactorId, ProductId, FromUnitId, ToUnitId, Factor) VALUES (2, 1019, 3, 4, 1000.0000);
INSERT OR REPLACE INTO UnitConversionFactor (UnitConversionFactorId, ProductId, FromUnitId, ToUnitId, Factor) VALUES (3, 1005, 1, 2, 1000.0000);

-- 3. Inserción de Recetas e Ingredientes
DROP TABLE IF EXISTS RecipeIngredient;
DROP TABLE IF EXISTS Recipe;

CREATE TABLE Recipe (
    RecipeId INTEGER PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    PosPluCode VARCHAR(50),
    YieldQuantity INTEGER NOT NULL DEFAULT 1,
    StandardYieldPct DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    EstimatedCost DECIMAL(18,2) DEFAULT 0.00
);

CREATE TABLE RecipeIngredient (
    RecipeItemId INTEGER PRIMARY KEY,
    RecipeId INTEGER NOT NULL,
    ProductId INTEGER NOT NULL,
    Quantity DECIMAL(18,4) NOT NULL,
    UnitOfMeasureId INTEGER NOT NULL,
    ExpectedWastePct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (RecipeId) REFERENCES Recipe(RecipeId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Product(ProductId) ON DELETE CASCADE,
    FOREIGN KEY (UnitOfMeasureId) REFERENCES UnitOfMeasure(UnitOfMeasureId)
);

-- Receta 1: Margherita Pizza
INSERT INTO Recipe (RecipeId, Name, PosPluCode, YieldQuantity, StandardYieldPct, EstimatedCost) 
VALUES (1, 'Margherita Pizza', 'PLU-101', 1, 92.50, 4.50);

INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (1, 1, 1013, 0.2500, 1, 2.00);
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (2, 1, 1019, 0.0300, 3, 0.00);
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (3, 1, 1007, 0.1500, 1, 5.00);
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (4, 1, 1002, 0.1200, 1, 1.00);

-- Receta 2: Beef Burger Deluxe
INSERT INTO Recipe (RecipeId, Name, PosPluCode, YieldQuantity, StandardYieldPct, EstimatedCost) 
VALUES (2, 'Beef Burger Deluxe', 'PLU-102', 1, 88.00, 6.20);

INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (5, 2, 1005, 0.2000, 1, 10.00);
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (6, 2, 1002, 0.0500, 1, 2.00);
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (7, 2, 1008, 0.2500, 5, 8.00);
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (8, 2, 1007, 0.0800, 1, 4.00);

-- Receta 3: Grilled Chicken Bowl
INSERT INTO Recipe (RecipeId, Name, PosPluCode, YieldQuantity, StandardYieldPct, EstimatedCost) 
VALUES (3, 'Grilled Chicken Bowl', 'PLU-103', 1, 90.00, 5.80);

INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (9, 3, 1004, 0.2500, 1, 12.00);
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (10, 3, 1015, 0.1500, 1, 0.00);
INSERT INTO RecipeIngredient (RecipeItemId, RecipeId, ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct) 
VALUES (11, 3, 1019, 0.0150, 3, 0.00);

COMMIT;