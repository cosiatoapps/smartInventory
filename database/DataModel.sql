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

CREATE TABLE Category(
    CategoryId INTEGER PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
);
CREATE UNIQUE INDEX UX_Category_Name ON Category(Name);

CREATE TABLE Product(
    ProductId INTEGER PRIMARY KEY,
    SKU VARCHAR(50) NOT NULL,
    Description VARCHAR(255),
    CategoryId INTEGER,
    FOREIGN KEY (CategoryId) REFERENCES Category(CategoryId) ON DELETE SET NULL
);
CREATE UNIQUE INDEX UX_Product_SKU ON Product(SKU);

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

CREATE TABLE Recipe(
    RecipeId INTEGER PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    YieldPct DECIMAL(5,2) NOT NULL
);

CREATE TABLE RecipeIngredient(
    RecipeId INTEGER NOT NULL,
    ProductId INTEGER NOT NULL,
    Quantity DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (RecipeId) REFERENCES Recipe(RecipeId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Product(ProductId) ON DELETE CASCADE
);
CREATE INDEX IX_RecipeIngredient_RecipeId ON RecipeIngredient(RecipeId);
CREATE INDEX IX_RecipeIngredient_ProductId ON RecipeIngredient(ProductId);

CREATE TABLE ProductionOrder(
    ProductionId INTEGER PRIMARY KEY,
    RecipeId INTEGER NOT NULL,
    QuantityProduced DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (RecipeId) REFERENCES Recipe(RecipeId) ON DELETE CASCADE
);
CREATE INDEX IX_ProductionOrder_RecipeId ON ProductionOrder(RecipeId);

CREATE TABLE WasteLog(
    WasteId INTEGER PRIMARY KEY,
    Category VARCHAR(100) NOT NULL,
    Reason VARCHAR(255),
    Quantity DECIMAL(18,2) NOT NULL,
    Cost DECIMAL(18,2) NOT NULL
);

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