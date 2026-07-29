# SmartInventory AI

## Descripción
Plataforma corporativa de Food Cost, Inventory & Operations Intelligence.

## Stack Tecnológico
- React + TypeScript + Fluent UI
- Azure App Services
- Azure SQL + Dataverse
- Azure OpenAI
- Power BI

## Módulos
- Dashboard Ejecutivo
- Inventarios
- Producción
- Recetas
- Food Cost
- Mermas
- Perecederos
- IoT Center
- Copilot AI
- MDM
- Administración

## Ejecución Frontend
npm install
npm run dev

## Roadmap
Iteración 1: Enterprise Foundation
Iteración 2: Producción y Food Cost
Iteración 3: IoT y Analytics
Iteración 4: Copilot AI

## Despliegue en Azure

### 1. Preparar la configuración
- Actualizar el frontend para leer las URLs de los backends desde variables de entorno, por ejemplo:
  - `VITE_INVENTORY_API_URL`
  - `VITE_FOODCOST_API_URL`
  - `VITE_PRODUCTION_API_URL`
- En los servicios backend, configurar `ASPNETCORE_ENVIRONMENT=Production` y una cadena de conexión a una base de datos gestionada en Azure si se desea un entorno productivo.

### 2. Crear el grupo de recursos
```bash
az login
az group create --name rg-smartinventory --location eastus
```

### 3. Crear el plan de hosting y los Web Apps
```bash
az appservice plan create --name asp-smartinventory --resource-group rg-smartinventory --sku B1 --is-linux

az webapp create --resource-group rg-smartinventory --plan asp-smartinventory --name smartinventory-inventory-api --runtime "DOTNETCORE|8.0"
az webapp create --resource-group rg-smartinventory --plan asp-smartinventory --name smartinventory-foodcost-api --runtime "DOTNETCORE|8.0"
az webapp create --resource-group rg-smartinventory --plan asp-smartinventory --name smartinventory-production-api --runtime "DOTNETCORE|8.0"
```

### 4. Publicar los backends
```bash
cd backend/Inventory.Api
dotnet publish -c Release

cd ../FoodCost.Api
dotnet publish -c Release

cd ../Production.Api
dotnet publish -c Release
```

### 5. Publicar el frontend
```bash
cd frontend
npm install
npm run build
```

### 6. Configurar CORS y validación
- Habilitar CORS en los APIs para permitir peticiones desde la URL pública del frontend.
- Validar que cada endpoint responda correctamente en Azure y que la UI pueda consumir los servicios.

### 7. Opcional: infraestructura como código
Este repositorio ya incluye plantillas para infraestructura en:
- [infrastructure/bicep/main.bicep](infrastructure/bicep/main.bicep)
- [infrastructure/terraform/dev/main.tf](infrastructure/terraform/dev/main.tf)


## 🚀 Novedades de la Iteración 2 (Gestión de Fichas Técnicas y Recetas)
En esta segunda versión se ha implementado la gestión completa de **Fichas Técnicas y Recetas**, conectando los componentes visuales con los servicios de backend SQLite y la API de Producción.

### 🌟 Características Clave Agregadas:
1. **Módulo de Creación de Recetas (`RecipeBuilderModule`)**:
   - Construcción interactiva de fichas técnicas seleccionando insumos reales del catálogo.
   - Definición de consumo teórico, unidades de medida y porcentajes de merma esperada.
   - Cálculo del rendimiento estándar de la preparación.

2. **Panel de Edición y Detalle de Ingredientes (`RecipesModule`)**:
   - Visualización responsiva de recetas y número de insumos asociados.
   - Modal amplio (hasta 1100px / 90% viewport) para inspección y edición fluida de ingredientes.
   - Edición en tiempo real de **Cantidades**, **Unidades de Medida** y **% Merma Esperada** con sincronización en SQLite.

3. **Optimizaciones de Tipado y Tolerancia a Fallos**:
   - Refactorización de tipos TypeScript (`Recipe`, `RecipeIngredient`, `AdminItem`).
   - Manejo defensivo contra valores nulos/indefinidos (`null-safety`) en precios, costos y porcentajes de rendimiento (`toFixed`).

4. **Mejoras en el Backend (`Production.Api`)**:
   - Inclusión de endpoints `GET`, `POST` y `PUT` con consultas multi-tabla (`LEFT JOIN` a `RecipeIngredient` y `Product`).
   - Gestión relacional para tablas de unidades de medida (`UnitOfMeasure`) y factores de conversión.

---

## 🛠️ Arquitectura de Microservicios

| Servicio | Puerto | Descripción |
| :--- | :--- | :--- |
| **Inventory.Api** | `5210` | Gestión de Stock, Catálogos MDM y Métricas de Inventario. |
| **Production.Api**| `5229` / `5211` | Fichas Técnicas, Recetas, Componentes y Órdenes de Producción. |
| **FoodCost.Api**  | `5205` / `5212` | Métricas de desperdicios (*Waste Logs*) y control de costos de alimentos. |

---

## 🗄️ Estructura de Base de Datos (Nuevas Tablas)

* **`Recipe`**: Cabecera de la ficha técnica (PluCode, YieldQuantity, StandardYieldPct, EstimatedCost).
* **`RecipeIngredient`**: Detalle relacional de insumos por receta (ProductId, Quantity, UnitOfMeasureId, ExpectedWastePct).
* **`UnitOfMeasure`**: Maestro de unidades de medida (Kg, Gr, Lt, Ml, Und).
* **`UnitConversionFactor`**: Factores de equivalencia para costeo y conversión de stock.