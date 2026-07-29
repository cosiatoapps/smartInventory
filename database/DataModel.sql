-- ============================================================================
-- SMARTINVENTORY AI - DATAMODEL COMPLETO
-- ============================================================================

-- 1. ESTRUCTURA CORPORATIVA Y UBICACIONES
CREATE TABLE Company(
    CompanyId INTEGER PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Country VARCHAR(100),
    Status VARCHAR(50)
);

CREATE TABLE Subsidiary(
    SubsidiaryId INTEGER PRIMARY KEY,
    CompanyId INTEGER NOT NULL,
    Name VARCHAR(200) NOT NULL,
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId) ON DELETE CASCADE
);
CREATE INDEX IX_Subsidiary_CompanyId ON Subsidiary(CompanyId);

CREATE TABLE Site(
    SiteId INTEGER PRIMARY KEY,
    SubsidiaryId INTEGER NOT NULL,
    Name VARCHAR(200) NOT NULL,
    Type VARCHAR(50),
    FOREIGN KEY (SubsidiaryId) REFERENCES Subsidiary(SubsidiaryId) ON DELETE CASCADE
);
CREATE INDEX IX_Site_SubsidiaryId ON Site(SubsidiaryId);

CREATE TABLE Warehouse(
    WarehouseId INTEGER PRIMARY KEY,
    SiteId INTEGER NOT NULL,
    Name VARCHAR(200) NOT NULL,
    FOREIGN KEY (SiteId) REFERENCES Site(SiteId) ON DELETE CASCADE
);
CREATE INDEX IX_Warehouse_SiteId ON Warehouse(SiteId);

CREATE TABLE Location(
    LocationId INTEGER PRIMARY KEY,
    WarehouseId INTEGER NOT NULL,
    Code VARCHAR(50) NOT NULL,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouse(WarehouseId) ON DELETE CASCADE
);
CREATE INDEX IX_Location_WarehouseId ON Location(WarehouseId);

-- 2. CATEGORÍAS, UNIDADES DE MEDIDA Y PRODUCTOS
CREATE TABLE Category(
    CategoryId INTEGER PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
);
CREATE UNIQUE INDEX UX_Category_Name ON Category(Name);

CREATE TABLE UnitOfMeasure (
    UnitOfMeasureId INTEGER PRIMARY KEY,
    Code VARCHAR(20) NOT NULL UNIQUE,  -- Ej: Kg, Gr, Lt, Ml, Und, Cja
    Name VARCHAR(100) NOT NULL         -- Ej: Kilogramos, Gramos, etc.
);

CREATE TABLE Product(
    ProductId INTEGER PRIMARY KEY,
    SKU VARCHAR(50) NOT NULL,
    Description VARCHAR(255),
    CategoryId INTEGER,
    FOREIGN KEY (CategoryId) REFERENCES Category(CategoryId) ON DELETE SET NULL
);
CREATE UNIQUE INDEX UX_Product_SKU ON Product(SKU);

-- Factores de conversión de unidades por producto
CREATE TABLE UnitConversionFactor (
    UnitConversionFactorId INTEGER PRIMARY KEY,
    ProductId INTEGER NOT NULL,
    FromUnitId INTEGER NOT NULL,
    ToUnitId INTEGER NOT NULL,
    Factor DECIMAL(18,4) NOT NULL,
    FOREIGN KEY (ProductId) REFERENCES Product(ProductId) ON DELETE CASCADE,
    FOREIGN KEY (FromUnitId) REFERENCES UnitOfMeasure(UnitOfMeasureId),
    FOREIGN KEY (ToUnitId) REFERENCES UnitOfMeasure(UnitOfMeasureId)
);
CREATE INDEX IX_UnitConversionFactor_ProductId ON UnitConversionFactor(ProductId);

-- 3. INVENTARIOS Y CONTEOS FISICOS
CREATE TABLE InventoryBalance(
    InventoryId INTEGER PRIMARY KEY,
    LocationId INTEGER NOT NULL,
    ProductId INTEGER NOT NULL,
    Quantity DECIMAL(18,2) NOT NULL,
    Lot VARCHAR(100),
    ExpiryDate DATE,
    FOREIGN KEY (LocationId) REFERENCES Location(LocationId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Product(ProductId) ON DELETE CASCADE
);

CREATE TABLE InventoryCount(
    CountId INTEGER PRIMARY KEY,
    LocationId INTEGER NOT NULL,
    CountDate DATETIME NOT NULL,
    FOREIGN KEY (LocationId) REFERENCES Location(LocationId) ON DELETE CASCADE
);

CREATE TABLE InventoryCountDetail(
    DetailId INTEGER PRIMARY KEY,
    CountId INTEGER NOT NULL,
    ProductId INTEGER NOT NULL,
    Quantity DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (CountId) REFERENCES InventoryCount(CountId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Product(ProductId) ON DELETE CASCADE
);

-- 4. FICHA TECNICA, RECETAS Y PRODUCCION (MOTOR DE RENDIMIENTO Y YIELD)
CREATE TABLE Recipe (
    RecipeId INTEGER PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    PosPluCode VARCHAR(50),               -- Código de integración con el POS (Punto de Venta)
    YieldQuantity INTEGER NOT NULL DEFAULT 1, -- Porciones generadas
    StandardYieldPct DECIMAL(5,2) NOT NULL DEFAULT 100.00, -- Rendimiento esperado (%)
    EstimatedCost DECIMAL(18,2) DEFAULT 0.00
);
CREATE INDEX IX_Recipe_PosPluCode ON Recipe(PosPluCode);

CREATE TABLE RecipeIngredient (
    RecipeItemId INTEGER PRIMARY KEY,
    RecipeId INTEGER NOT NULL,
    ProductId INTEGER NOT NULL,
    Quantity DECIMAL(18,4) NOT NULL,     -- Cantidad en unidad de consumo
    UnitOfMeasureId INTEGER NOT NULL,    -- Unidad de Medida
    ExpectedWastePct DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Merma esperada
    FOREIGN KEY (RecipeId) REFERENCES Recipe(RecipeId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Product(ProductId) ON DELETE CASCADE,
    FOREIGN KEY (UnitOfMeasureId) REFERENCES UnitOfMeasure(UnitOfMeasureId)
);
CREATE INDEX IX_RecipeIngredient_RecipeId ON RecipeIngredient(RecipeId);
CREATE INDEX IX_RecipeIngredient_ProductId ON RecipeIngredient(ProductId);

CREATE TABLE ProductionOrder (
    ProductionId INTEGER PRIMARY KEY,
    SiteId INTEGER NOT NULL,
    RecipeId INTEGER NOT NULL,
    RawMaterialUsedQty DECIMAL(18,4) NOT NULL, -- Entrada bruta (Ej: 10 Kg de papa)
    UsefulOutputQty DECIMAL(18,4) NOT NULL,    -- Salida útil obtenida (Ej: 8.2 Kg pelada)
    ActualYieldPct DECIMAL(5,2) NOT NULL,       -- Rendimiento Real (%)
    ProductionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SiteId) REFERENCES Site(SiteId) ON DELETE CASCADE,
    FOREIGN KEY (RecipeId) REFERENCES Recipe(RecipeId) ON DELETE CASCADE
);
CREATE INDEX IX_ProductionOrder_SiteId ON ProductionOrder(SiteId);
CREATE INDEX IX_ProductionOrder_RecipeId ON ProductionOrder(RecipeId);

-- 5. CONTROL DE MERMAS Y VENTAS DEL POS
CREATE TABLE WasteLog(
    WasteId INTEGER PRIMARY KEY,
    Category VARCHAR(100) NOT NULL,
    Reason VARCHAR(255),
    Quantity DECIMAL(18,2) NOT NULL,
    Cost DECIMAL(18,2) NOT NULL
);

CREATE TABLE PosSaleItem (
    SaleItemId INTEGER PRIMARY KEY,
    SiteId INTEGER NOT NULL,
    PluCode VARCHAR(50) NOT NULL,
    QuantitySold DECIMAL(18,2) NOT NULL,
    SaleDate DATETIME NOT NULL,
    FOREIGN KEY (SiteId) REFERENCES Site(SiteId) ON DELETE CASCADE
);
CREATE INDEX IX_PosSaleItem_SiteId_Date ON PosSaleItem(SiteId, SaleDate);

-- 6. USUARIOS Y PERMISOS
CREATE TABLE Profile(
    ProfileId INTEGER PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(255)
);
CREATE UNIQUE INDEX UX_Profile_Name ON Profile(Name);

CREATE TABLE Role(
    RoleId INTEGER PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(255)
);
CREATE UNIQUE INDEX UX_Role_Name ON Role(Name);

CREATE TABLE UserAccount(
    UserId INTEGER PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    DisplayName VARCHAR(200),
    Email VARCHAR(200) NOT NULL UNIQUE,
    ProfileId INTEGER NOT NULL,
    Status VARCHAR(50),
    PasswordHash VARCHAR(512),
    FOREIGN KEY (ProfileId) REFERENCES Profile(ProfileId) ON DELETE SET NULL
);

CREATE TABLE UserRole(
    UserId INTEGER NOT NULL,
    RoleId INTEGER NOT NULL,
    PRIMARY KEY (UserId, RoleId),
    FOREIGN KEY (UserId) REFERENCES UserAccount(UserId) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES Role(RoleId) ON DELETE CASCADE
);