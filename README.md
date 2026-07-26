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

# Agentic Enterprise Repository v2.0
Multi-agent platform for SmartInventory AI.
Includes DDD, Hexagonal Architecture, DevSecOps, AI Foundry and Copilot governance.

# Agentic Enterprise Repository v3.0
Runtime-ready foundation with specialized agents, React/.NET structure, DevSecOps and AI governance.