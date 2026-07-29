import { useEffect, useState } from 'react'
import './App.css'
import { inventoryService } from './services/inventoryService'
import { syncOfflineData } from './services/offline/syncManager'

import { DashboardModule } from './modules/DashboardModule'
import { InventoryModule } from './modules/InventoryModule'
import { ProductionModule } from './modules/ProductionModule'
import { ProductionYieldModule } from './modules/ProductionYieldModule'
import { RecipesModule } from './modules/RecipesModule'
import { FoodCostModule } from './modules/FoodCostModule'
import { WasteModule } from './modules/WasteModule'
import { PerishablesModule } from './modules/PerishablesModule'
import { IotModule } from './modules/IotModule'
import { CopilotModule } from './modules/CopilotModule'
import { MdmModule } from './modules/MdmModule'
import { AdminModule } from './modules/AdminModule'
import { RecipeBuilderModule } from './modules/RecipeBuilderModule'

import type {
  InventoryItem,
  Metrics,
  Summary,
  AdminResource,
  AdminItem,
  FoodCostMetrics,
  ProductionMetrics,
  Recipe,
  WasteLog,
  ProductionOrderPayload,
} from './types'

const mainModules = [
  'Dashboard Ejecutivo',
  'Dashboard Operacional',
  'Inventarios',
  'Producción',
  'Rendimiento (Yield)',
  'Recetas',
  'Crear Receta', 
  'Food Cost',
  'Mermas',
  'Perecederos',
  'IoT Center',
  'Copilot AI',
  'MDM',
]

const adminSubmodules: AdminResource[] = [
  'Subsidiarias',
  'Sedes',
  'Bodegas',
  'Ubicaciones',
  'Categorías',
  'Productos',
]

const endpointMap: Record<AdminResource, string> = {
  Subsidiarias: 'subsidiaries',
  Sedes: 'sites',
  Bodegas: 'warehouses',
  Ubicaciones: 'locations',
  Categorías: 'categories',
  Productos: 'products',
}

export function App() {
  const [selectedModule, setSelectedModule] = useState<string>('Dashboard Ejecutivo')
  const [isAdminOpen, setIsAdminOpen] = useState(false)

  // Estado para Mapeo de Llaves Foráneas
  const [lookupData, setLookupData] = useState<Record<AdminResource, AdminItem[]>>({
    Subsidiarias: [],
    Sedes: [],
    Bodegas: [],
    Ubicaciones: [],
    Categorías: [],
    Productos: [],
  })

  // Estados de datos generales
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [foodCost, setFoodCost] = useState<FoodCostMetrics | null>(null)
  const [production, setProduction] = useState<ProductionMetrics | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [waste, setWaste] = useState<WasteLog[]>([])

  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Estados para submódulos de Administración
  const [adminItems, setAdminItems] = useState<AdminItem[]>([])
  const [adminLoading, setAdminLoading] = useState(false)

  // Detectar si el módulo actual pertenece a Administración
  const isAdminModule = adminSubmodules.includes(selectedModule as AdminResource)

  // 1. Manejo de Estado Offline / Online
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      await syncOfflineData()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 2. Carga general de datos de módulos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const results = await Promise.allSettled([
        inventoryService.getInventory(),
        inventoryService.getMetrics(),
        inventoryService.getSummary(),
        inventoryService.getRecipes(),
        inventoryService.getWaste(),
        inventoryService.getFoodCostMetrics(),
        inventoryService.getProductionMetrics(),
      ])

      if (results[0].status === 'fulfilled') setInventory(results[0].value)
      if (results[1].status === 'fulfilled') setMetrics(results[1].value)
      if (results[2].status === 'fulfilled') setSummary(results[2].value)
      if (results[3].status === 'fulfilled') setRecipes(results[3].value)
      if (results[4].status === 'fulfilled') setWaste(results[4].value)
      if (results[5].status === 'fulfilled') setFoodCost(results[5].value)
      if (results[6].status === 'fulfilled') setProduction(results[6].value)

      setLoading(false)
    }

    loadData()
  }, [])

  // 3. Carga dinámica de datos de administración y catálogos FK
  useEffect(() => {
    if (!isAdminModule) return

    const currentResource = selectedModule as AdminResource

    const fetchAdmin = async () => {
      setAdminLoading(true)
      try {
        const data = await inventoryService.getAdminItems(endpointMap[currentResource])
        setAdminItems(data)
      } catch (err) {
        console.error('Error cargando recursos de administración:', err)
      } finally {
        setAdminLoading(false)
      }
    }

    const fetchAllLookups = async () => {
      try {
        const [subs, sites, whs, locs, cats, prods] = await Promise.all([
          inventoryService.getAdminItems('subsidiaries'),
          inventoryService.getAdminItems('sites'),
          inventoryService.getAdminItems('warehouses'),
          inventoryService.getAdminItems('locations'),
          inventoryService.getAdminItems('categories'),
          inventoryService.getAdminItems('products'),
        ])

        setLookupData({
          Subsidiarias: subs,
          Sedes: sites,
          Bodegas: whs,
          Ubicaciones: locs,
          Categorías: cats,
          Productos: prods,
        })
      } catch (err) {
        console.error('Error precargando catálogos de administración:', err)
      }
    }

    fetchAdmin()
    fetchAllLookups()
  }, [selectedModule, isAdminModule])

  // --- Handlers de Operaciones CRUD para Administración ---
  const refreshAdminItems = async (resource: AdminResource) => {
    try {
      const data = await inventoryService.getAdminItems(endpointMap[resource])
      setAdminItems(data)
    } catch (err) {
      console.error('Error refrescando items de administración:', err)
    }
  }

  const handleSaveAdmin = async (
    resource: AdminResource,
    id: number | null,
    payload: Record<string, unknown>
  ) => {
    await inventoryService.saveAdminItem(endpointMap[resource], id, payload)
    await refreshAdminItems(resource)
  }

  const handleDeleteAdmin = async (resource: AdminResource, id: number) => {
    await inventoryService.deleteAdminItem(endpointMap[resource], id)
    await refreshAdminItems(resource)
  }

  // --- Handler para Guardar Órdenes de Rendimiento (Yield) ---
  const handleSaveProductionYield = async (payload: { recipeId: number; rawQty: number; usefulQty: number }) => {
    const productionPayload: ProductionOrderPayload = {
      siteId: 1, // Sede predeterminada o HQ
      recipeId: payload.recipeId,
      rawMaterialUsedQty: payload.rawQty,
      usefulOutputQty: payload.usefulQty,
    }

    if (inventoryService.createProductionOrder) {
      await inventoryService.createProductionOrder(productionPayload)
      // Refrescar las métricas de producción tras guardar
      const updatedProduction = await inventoryService.getProductionMetrics()
      setProduction(updatedProduction)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>SmartInventory</span>
          <strong>AI</strong>
          <small style={{ color: isOnline ? '#4ade80' : '#f87171', marginTop: '4px', display: 'block' }}>
            {isOnline ? '● En Línea' : '○ Modo Offline'}
          </small>
        </div>
        <nav>
          <ul>
            {/* Módulos principales */}
            {mainModules.map((mod) => (
              <li
                key={mod}
                className={mod === selectedModule ? 'active' : ''}
                onClick={() => setSelectedModule(mod)}
              >
                {mod}
              </li>
            ))}

            {/* Menú Desplegable de Administración */}
            <li className={`admin-menu-header ${isAdminModule ? 'active' : ''}`}>
              <div
                className="admin-menu-title"
                onClick={() => setIsAdminOpen((prev) => !prev)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Administración</span>
                <span style={{ fontSize: '0.8rem' }}>{isAdminOpen ? '▲' : '▼'}</span>
              </div>

              {isAdminOpen && (
                <ul className="sub-menu" style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '8px' }}>
                  {adminSubmodules.map((subMod) => (
                    <li
                      key={subMod}
                      className={subMod === selectedModule ? 'active-sub' : ''}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedModule(subMod)
                      }}
                      style={{ padding: '8px 12px', fontSize: '0.9rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {subMod}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Enterprise Foundation</p>
            <h1>SmartInventory AI</h1>
          </div>
        </header>

        {/* Tarjetas de estadísticas superiores */}
        <section className="stats-grid">
          <div className="stat-card">
            <span>Productos activos</span>
            <strong>{summary?.productCount ?? '—'}</strong>
          </div>
          <div className="stat-card">
            <span>Ubicaciones</span>
            <strong>{summary?.locationCount ?? '—'}</strong>
          </div>
          <div className="stat-card">
            <span>Almacenes</span>
            <strong>{summary?.warehouseCount ?? '—'}</strong>
          </div>
          <div className="stat-card accent-card">
            <span>Total inventario</span>
            <strong>{metrics ? new Intl.NumberFormat('es-CO').format(metrics.totalQuantity) : '—'}</strong>
          </div>
        </section>

        <section className="module-area">
          {/* Renderizado de módulos independientes */}
          {selectedModule === 'Dashboard Ejecutivo' && (
            <DashboardModule
              mode="executive"
              inventory={inventory}
              foodCost={foodCost}
              production={production}
              wasteCount={waste.length}
              recipeCount={recipes.length}
            />
          )}

          {selectedModule === 'Dashboard Operacional' && (
            <DashboardModule
              mode="operational"
              inventory={inventory}
              foodCost={foodCost}
              production={production}
              wasteCount={waste.length}
              recipeCount={recipes.length}
            />
          )}

          {selectedModule === 'Inventarios' && <InventoryModule inventory={inventory} loading={loading} />}
          {selectedModule === 'Producción' && <ProductionModule production={production} loading={loading} />}
          
          {/* Renderizado de Rendimiento / Yield */}
          {selectedModule === 'Rendimiento (Yield)' && (
            <ProductionYieldModule
              recipes={recipes}
              onSaveProduction={handleSaveProductionYield}
            />
          )}

          {selectedModule === 'Recetas' && (
            <RecipesModule
              recipes={recipes}
              products={lookupData.Productos}
              loading={loading}
              onSaveRecipe={async (payload) => {
                if (payload.recipeId) {
                  await inventoryService.updateRecipeFull(payload.recipeId, payload)
                } else {
                  await inventoryService.saveRecipeFull(payload)
                }
                const updatedRecipes = await inventoryService.getRecipes()
                setRecipes(updatedRecipes)
              }}
            />
          )}

          {selectedModule === 'Food Cost' && <FoodCostModule foodCost={foodCost} loading={loading} />}
          {selectedModule === 'Mermas' && <WasteModule waste={waste} loading={loading} />}
          {selectedModule === 'Perecederos' && <PerishablesModule inventory={inventory} loading={loading} />}
          {selectedModule === 'IoT Center' && <IotModule />}
          {selectedModule === 'Copilot AI' && <CopilotModule inventory={inventory} />}
          {selectedModule === 'MDM' && <MdmModule summary={summary} loading={loading} />}

          {selectedModule === 'Crear Receta' && (
            <RecipeBuilderModule
              products={lookupData.Productos}
              onSaveRecipe={async (payload) => {
                await inventoryService.saveRecipeFull(payload)
                // Refrescar las recetas cargadas en el sistema
                const updatedRecipes = await inventoryService.getRecipes()
                setRecipes(updatedRecipes)
              }}
            />
          )}

          {/* Renderizado dinámico de cualquier submódulo de Administración con lookupData enviado */}
          {isAdminModule && (
            <AdminModule
              selectedResource={selectedModule as AdminResource}
              onSelectResource={(res) => setSelectedModule(res)}
              items={adminItems}
              loading={adminLoading}
              lookupData={lookupData}
              onSave={handleSaveAdmin}
              onDelete={handleDeleteAdmin}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App