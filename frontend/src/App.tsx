import { useEffect, useMemo, useState } from 'react'
import './App.css'

type InventoryItem = {
  inventoryId: number
  sku: string
  product: string
  category: string
  location: string
  warehouse: string
  quantity: number
  lot: string
  expiryDate: string | null
}

type Metrics = {
  totalQuantity: number
  activeProducts: number
  expiringSoon: number
  recipeCount: number
  productionOrders: number
  wasteCount: number
}

type Summary = {
  productCount: number
  locationCount: number
  warehouseCount: number
}

type Recipe = {
  recipeId: number
  description: string
  cost: number
}

type WasteLog = {
  wasteLogId: number
  category: string
  description: string
  quantity: number
  cost: number
}

type FoodCostMetrics = {
  theoreticalCost: number
  realCost: number
  varianceCost: number
  foodCostPercent: number
  foodWastePercent: number
}

type ProductionMetrics = {
  orderCount: number
  recipeCount: number
  totalProduction: number
  averageYield: number
  wastePercent: number
}

type AgentStatus = {
  name: string
  url: string
  status: 'success' | 'error' | 'pending'
}

type ModuleDetail = {
  title: string
  description: string
  highlights: string[]
}

const modules = [
  'Dashboard Ejecutivo',
  'Dashboard Operacional',
  'Inventarios',
  'Producción',
  'Recetas',
  'Food Cost',
  'Mermas',
  'Perecederos',
  'IoT Center',
  'Copilot AI',
  'MDM',
  'Administración',
]

const agentEndpoints = [
  { name: 'Inventory API', url: 'http://127.0.0.1:5210/api/health' },
  { name: 'FoodCost API', url: 'http://127.0.0.1:5205/api/health' },
  { name: 'Production API', url: 'http://127.0.0.1:5229/api/health' },
]

const moduleDetails: Record<string, ModuleDetail> = {
  'Dashboard Ejecutivo': {
    title: 'Resumen corporativo',
    description:
      'Visión de alto nivel para inventarios, producción, food cost y desperdicios.',
    highlights: [
      'KPIs financieros y operativos',
      'Riesgos de vencimiento y desperdicio',
      'Gobierno de datos y trazabilidad',
    ],
  },
  'Dashboard Operacional': {
    title: 'Operaciones en tiempo real',
    description:
      'Monitoreo de inventario, producción, recetas y desperdicios en un dashboard operativo.',
    highlights: [
      'Alertas de inventario y vencimientos',
      'Indicadores de rendimiento de producción',
      'Visibilidad de mermas y costos',
    ],
  },
  Inventarios: {
    title: 'Inventarios completos',
    description:
      'Inventarios digitales con lotes, ubicaciones y alertas de expiración para el entorno hotelero y de parques.',
    highlights: [
      'Conteo de existencias digital',
      'Control de lotes y vencimientos',
      'Conectividad con almacenes y bodegas',
    ],
  },
  Producción: {
    title: 'Producción y rendimiento',
    description:
      'Planeación de producción, rendimiento y control de desperdicios desde recetas y órdenes.',
    highlights: [
      'Órdenes de producción activas',
      'Yield y desempeño de planta',
      'Costos de desperdicio integrados',
    ],
  },
  Recetas: {
    title: 'Recetas digitales',
    description:
      'Libro maestro de recetas con costos teóricos, ingredientes y rendimiento esperado.',
    highlights: [
      'Costeo por receta',
      'Rendimiento estándar',
      'Datos maestros de insumos',
    ],
  },
  'Food Cost': {
    title: 'Control de Food Cost',
    description:
      'Métrica de costo teórico vs real y seguimiento de desperdicios económicos.',
    highlights: [
      'Food Cost % por operación',
      'Costo de desperdicio por sede',
      'Variación real vs teoría',
    ],
  },
  Mermas: {
    title: 'Gestión de mermas',
    description:
      'Registro de pérdidas por desperdicio y daños con análisis de causas para reducción.',
    highlights: [
      'Clasificación de desperdicios',
      'Causas de merma',
      'Acciones correctivas',
    ],
  },
  Perecederos: {
    title: 'Perecederos y FEFO',
    description:
      'Alertas de vencimientos y control FEFO sobre productos sensibles al tiempo.',
    highlights: [
      'Perecederos críticos',
      'Rotación rápida',
      'Alertas tempranas',
    ],
  },
  'IoT Center': {
    title: 'IoT Center',
    description:
      'Monitoreo avanzado de temperatura, humedad y aperturas para activos críticos.',
    highlights: [
      'Sensores conectados',
      'Alertas de condiciones',
      'Disponibilidad 24/7',
    ],
  },
  'Copilot AI': {
    title: 'Copilot Operacional',
    description:
      'Asistente de preguntas en lenguaje natural para desperdicios, vencimientos y rendimiento.',
    highlights: [
      'Respuestas operativas',
      'Insights de desperdicio',
      'Recomendaciones accionables',
    ],
  },
  MDM: {
    title: 'Gobierno de datos',
    description:
      'Catálogo maestro corporativo para SKUs, ubicaciones y categorías estándar.',
    highlights: [
      'Datos maestros unificados',
      'Clasificación corporativa',
      'Calidad y consistencia',
    ],
  },
  Administración: {
    title: 'Administración',
    description:
      'Administración de usuarios, roles y seguridad para la plataforma.',
    highlights: [
      'Control de accesos',
      'Auditorías y compliance',
      'Visión corporativa',
    ],
  },
}

const platformAgents = [
  { name: 'Inventory Agent', role: 'Gestión de existencias', docPath: '/agents/inventory-agent.md', healthName: 'Inventory API' },
  { name: 'Production Agent', role: 'Control de producción', docPath: '/agents/production-agent.md', healthName: 'Production API' },
  { name: 'Food Cost Agent', role: 'Optimización de costos', docPath: '/agents/finance-agent.md', healthName: 'FoodCost API' },
  { name: 'IoT Agent', role: 'Monitoreo de sensores', docPath: '/agents/iot-agent.md', healthName: 'IoT API' },
  { name: 'Copilot Agent', role: 'Asistente analítico', docPath: '/agents/master-agent.md', healthName: 'Copilot API' },
  { name: 'MDM Agent', role: 'Gobernanza de datos', docPath: '/agents/mdm-agent.md', healthName: 'MDM API' },
  { name: 'Observability Agent', role: 'Monitoreo y trazabilidad', docPath: '/agents/observability-agent.md', healthName: 'Observability API' },
  { name: 'Security Agent', role: 'Seguridad y cumplimiento', docPath: '/agents/security-agent.md', healthName: 'Security API' },
  { name: 'Orchestrator Agent', role: 'Coordinación multi-agente', docPath: '/agents/master-agent.md', healthName: 'Orchestrator API' },
]

type PlatformAgent = typeof platformAgents[number]

function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [waste, setWaste] = useState<WasteLog[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [foodCost, setFoodCost] = useState<FoodCostMetrics | null>(null)
  const [production, setProduction] = useState<ProductionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState(modules[0])
  const [agents, setAgents] = useState<AgentStatus[]>(agentEndpoints.map((agent) => ({ ...agent, status: 'pending' })))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryRes, metricsRes, summaryRes, recipesRes, wasteRes, foodCostRes, productionRes] = await Promise.all([
          fetch('http://127.0.0.1:5210/api/inventory'),
          fetch('http://127.0.0.1:5210/api/metrics'),
          fetch('http://127.0.0.1:5210/api/summary'),
          fetch('http://127.0.0.1:5210/api/recipes'),
          fetch('http://127.0.0.1:5210/api/waste'),
          fetch('http://127.0.0.1:5205/api/foodcost/metrics'),
          fetch('http://127.0.0.1:5229/api/production/metrics'),
        ])

        if (inventoryRes.ok) {
          setInventory(await inventoryRes.json())
        } else {
          console.error('Inventory fetch failed', inventoryRes.status, await inventoryRes.text())
        }

        if (metricsRes.ok) {
          setMetrics(await metricsRes.json())
        } else {
          console.error('Metrics fetch failed', metricsRes.status, await metricsRes.text())
        }

        if (summaryRes.ok) {
          setSummary(await summaryRes.json())
        } else {
          console.error('Summary fetch failed', summaryRes.status, await summaryRes.text())
        }

        if (recipesRes.ok) {
          setRecipes(await recipesRes.json())
        } else {
          console.error('Recipes fetch failed', recipesRes.status, await recipesRes.text())
        }

        if (wasteRes.ok) {
          setWaste(await wasteRes.json())
        } else {
          console.error('Waste fetch failed', wasteRes.status, await wasteRes.text())
        }

        if (foodCostRes.ok) {
          setFoodCost(await foodCostRes.json())
        } else {
          console.error('FoodCost fetch failed', foodCostRes.status, await foodCostRes.text())
        }

        if (productionRes.ok) {
          setProduction(await productionRes.json())
        } else {
          console.error('Production fetch failed', productionRes.status, await productionRes.text())
        }
      } catch (error) {
        console.error('Frontend fetch error', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchAgents = async () => {
      const results = await Promise.all(
        agentEndpoints.map(async (agent) => {
          try {
            const response = await fetch(agent.url)
            return { ...agent, status: response.ok ? 'success' : 'error' } as AgentStatus
          } catch {
            return { ...agent, status: 'error' } as AgentStatus
          }
        }),
      )
      setAgents(results)
    }

    fetchData()
    fetchAgents()
  }, [])

  const metricValues = {
    inventoryCount: inventory.length.toString(),
    totalQuantity: metrics ? metrics.totalQuantity.toFixed(2) : '—',
    productCount: summary ? summary.productCount.toString() : '—',
    locationCount: summary ? summary.locationCount.toString() : '—',
    warehouseCount: summary ? summary.warehouseCount.toString() : '—',
    expiringSoon: metrics ? metrics.expiringSoon.toString() : '—',
    recipeCount: metrics ? metrics.recipeCount.toString() : recipes.length.toString(),
    wasteCount: metrics ? metrics.wasteCount.toString() : waste.length.toString(),
    foodCostPercent: foodCost ? `${foodCost.foodCostPercent.toFixed(1)}%` : '—',
    foodWastePercent: foodCost ? `${foodCost.foodWastePercent.toFixed(1)}%` : '—',
    productionOrderCount: production ? production.orderCount.toString() : '—',
    averageYield: production ? `${production.averageYield.toFixed(1)}%` : '—',
    wasteProductionPercent: production ? `${production.wastePercent.toFixed(1)}%` : '—',
  }

  const topExpiring = inventory
    .filter((item) => item.expiryDate)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
    .slice(0, 4)

  const formatNumber = (value: number) => new Intl.NumberFormat('es-CO').format(value)

  const renderCards = (cards: Array<{ label: string; value: string }>) => (
    <div className="module-cards">
      {cards.map((card) => (
        <article key={card.label}>
          <h3>{card.label}</h3>
          <p>{card.value}</p>
        </article>
      ))}
    </div>
  )

  const selectedDetail = moduleDetails[selectedModule]

  const activeModuleContent = useMemo(() => {
    switch (selectedModule) {
      case 'Dashboard Ejecutivo':
        return (
          <section className="dashboard-panel">
            {renderCards([
              { label: 'Inventory Accuracy', value: '96.4%' },
              { label: 'Food Cost %', value: metricValues.foodCostPercent },
              { label: 'Waste %', value: metricValues.foodWastePercent },
              { label: 'Yield objetivo', value: metricValues.averageYield },
            ])}
            <div className="insight-grid">
              <article>
                <h3>Riesgo de vencimiento</h3>
                <p>{topExpiring.length} productos críticos por vencer en los próximos 30 días.</p>
              </article>
              <article>
                <h3>Desperdicio económico</h3>
                <p>{metricValues.wasteCount} eventos de merma registrados en el sistema.</p>
              </article>
              <article>
                <h3>Recetas digitales</h3>
                <p>{metricValues.recipeCount} recetas disponibles para costeo y producción.</p>
              </article>
              <article>
                <h3>Operaciones activas</h3>
                <p>{metricValues.productionOrderCount} órdenes de producción planificadas.</p>
              </article>
            </div>
          </section>
        )

      case 'Dashboard Operacional':
        return (
          <section className="dashboard-panel">
            {renderCards([
              { label: 'Inventarios registrados', value: metricValues.inventoryCount },
              { label: 'Producción hoy', value: metricValues.productionOrderCount },
              { label: 'Perecederos críticos', value: metricValues.expiringSoon },
              { label: 'Food Waste %', value: metricValues.foodWastePercent },
            ])}
            <div className="insight-grid">
              <article>
                <h3>Desviación de costo</h3>
                <p>{metricValues.foodCostPercent} de food cost actual estimado.</p>
              </article>
              <article>
                <h3>Yield operativo</h3>
                <p>{metricValues.averageYield} de rendimiento de producción estimado.</p>
              </article>
            </div>
          </section>
        )

      case 'Inventarios':
        return (
          <section className="inventory-panel">
            <div className="inventory-header">
              <div>
                <h2>Inventario activo</h2>
                <p>Inventarios digitales con visibilidad de lotes, almacenes y vencimientos.</p>
              </div>
              <div>{loading ? 'Cargando...' : `${inventory.length} registros`}</div>
            </div>

            <div className="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Ubicación</th>
                    <th>Warehouse</th>
                    <th>Cantidad</th>
                    <th>Lote</th>
                    <th>Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.inventoryId}>
                      <td>{item.sku}</td>
                      <td>{item.product}</td>
                      <td>{item.category}</td>
                      <td>{item.location}</td>
                      <td>{item.warehouse}</td>
                      <td>{formatNumber(item.quantity)}</td>
                      <td>{item.lot}</td>
                      <td>{item.expiryDate ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )

      case 'Producción':
        return (
          <section className="module-panel">
            {renderCards([
              { label: 'Órdenes en cola', value: metricValues.productionOrderCount },
              { label: 'Recetas disponibles', value: metricValues.recipeCount },
              { label: 'Yield estimado', value: metricValues.averageYield },
              { label: 'Merma de producción', value: metricValues.wasteProductionPercent },
            ])}
            <div className="info-grid">
              <article>
                <h3>Órdenes registradas</h3>
                <p>{production ? `${production.orderCount} órdenes con producción total de ${formatNumber(production.totalProduction)} unidades.` : 'Cargando órdenes'}</p>
              </article>
              <article>
                <h3>Rendimiento y desperdicios</h3>
                <p>{production ? `Waste ${production.wastePercent.toFixed(1)}% sobre producción total.` : 'Cargando métricas'}</p>
              </article>
            </div>
          </section>
        )

      case 'Recetas':
        return (
          <section className="module-panel">
            {renderCards([
              { label: 'Recetas totales', value: metricValues.recipeCount },
              { label: 'Costo promedio', value: recipes.length ? `$${(recipes.reduce((sum, item) => sum + item.cost, 0) / recipes.length).toFixed(2)}` : '—' },
              { label: 'Insumos clave', value: recipes.length ? `${recipes.length * 3}` : '—' },
              { label: 'Visibilidad', value: 'Costeo teórico activo' },
            ])}
            <div className="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>Receta</th>
                    <th>Costo teórico</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map((recipe) => (
                    <tr key={recipe.recipeId}>
                      <td>{recipe.description}</td>
                      <td>{`$${recipe.cost.toFixed(2)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )

      case 'Food Cost':
        return (
          <section className="module-panel">
            {renderCards([
              { label: 'Costo teórico', value: foodCost ? `$${foodCost.theoreticalCost.toFixed(2)}` : '—' },
              { label: 'Costo real', value: foodCost ? `$${foodCost.realCost.toFixed(2)}` : '—' },
              { label: 'Variación', value: foodCost ? `$${foodCost.varianceCost.toFixed(2)}` : '—' },
              { label: 'Food Cost %', value: metricValues.foodCostPercent },
            ])}
          </section>
        )

      case 'Mermas':
        return (
          <section className="module-panel">
            {renderCards([
              { label: 'Eventos reportados', value: metricValues.wasteCount },
              { label: 'Costo de desperdicio', value: foodCost ? `$${foodCost.realCost.toFixed(2)}` : '—' },
              { label: 'Reducción objetivo', value: '20%' },
              { label: 'Acciones abiertas', value: '5' },
            ])}
            <div className="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {waste.map((item) => (
                    <tr key={item.wasteLogId}>
                      <td>{item.category}</td>
                      <td>{item.description}</td>
                      <td>{formatNumber(item.quantity)}</td>
                      <td>{`$${item.cost.toFixed(2)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )

      case 'Perecederos':
        return (
          <section className="module-panel">
            {renderCards([
              { label: 'Perecederos críticos', value: metricValues.expiringSoon },
              { label: 'Top 4 vencimientos', value: topExpiring.length.toString() },
              { label: 'Acción FEFO', value: 'Activo' },
              { label: 'Rotación recomendada', value: 'Prioritaria' },
            ])}
            <div className="info-grid">
              {topExpiring.map((item) => (
                <article key={item.inventoryId}>
                  <h3>{item.product}</h3>
                  <p>{item.expiryDate || 'Sin fecha'} · {item.warehouse}</p>
                </article>
              ))}
            </div>
          </section>
        )

      case 'IoT Center':
        return (
          <section className="module-panel">
            {renderCards([
              { label: 'Sensores activos', value: '24' },
              { label: 'Alertas abiertas', value: '2' },
              { label: 'Disponibilidad', value: '99.7%' },
              { label: 'Incidentes', value: '1' },
            ])}
          </section>
        )

      case 'Copilot AI':
        return (
          <section className="module-panel">
            <div className="copilot-grid">
              <article>
                <h3>¿Por qué aumentó el desperdicio?</h3>
                <p>El desperdicio aumentó 18% por sobreproducción en desayuno buffet y vencimientos de lácteos.</p>
              </article>
              <article>
                <h3>Productos con mayor riesgo de vencimiento</h3>
                <p>{topExpiring.slice(0, 3).map((item) => item.product).join(', ') || 'No hay datos críticos'}</p>
              </article>
            </div>
          </section>
        )

      case 'MDM':
        return (
          <section className="module-panel">
            {renderCards([
              { label: 'SKUs en catálogo', value: metricValues.productCount },
              { label: 'Ubicaciones', value: metricValues.locationCount },
              { label: 'Almacenes', value: metricValues.warehouseCount },
              { label: 'Calidad de datos', value: '94%' },
            ])}
          </section>
        )

      case 'Administración':
        return (
          <section className="module-panel">
            {renderCards([
              { label: 'Usuarios activos', value: '42' },
              { label: 'Roles configurados', value: '5' },
              { label: 'Seguridad', value: 'Fortalecida' },
              { label: 'Auditorías', value: '2 recientes' },
            ])}
          </section>
        )

      default:
        return <section className="module-panel">Módulo no disponible</section>
    }
  }, [selectedModule, inventory, waste, recipes, foodCost, production, metrics, summary, loading])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>SmartInventory</span>
          <strong>AI</strong>
        </div>
        <nav>
          <ul>
            {modules.map((module) => (
              <li key={module} className={module === selectedModule ? 'active' : ''} onClick={() => setSelectedModule(module)}>
                {module}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Enterprise Foundation</p>
            <h1>SmartInventory AI</h1>
            <p className="hero-copy">
              Plataforma corporativa de Food Cost & Inventory Intelligence para hoteles y parques.
            </p>
          </div>

          <div className="agent-status-card">
            <div className="status-title-bar">
              <span className="status-title">Panel de agentes</span>
              <span className="status-badge">
                {agents.every((agent) => agent.status === 'success')
                  ? 'Salud buena'
                  : agents.some((agent) => agent.status === 'error')
                  ? 'Revisar agentes'
                  : 'Conectando...'}
              </span>
            </div>
            <ul className="status-list">
              {agents.map((agent) => (
                <li key={agent.name} className={agent.status}>
                  <span>{agent.name}</span>
                  <strong>{agent.status === 'pending' ? 'Cargando' : agent.status === 'success' ? 'OK' : 'Error'}</strong>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Productos activos</span>
            <strong>{summary ? summary.productCount : '—'}</strong>
          </div>
          <div className="stat-card">
            <span>Ubicaciones</span>
            <strong>{summary ? summary.locationCount : '—'}</strong>
          </div>
          <div className="stat-card">
            <span>Almacenes</span>
            <strong>{summary ? summary.warehouseCount : '—'}</strong>
          </div>
          <div className="stat-card accent-card">
            <span>Total inventario</span>
            <strong>{metrics ? formatNumber(metrics.totalQuantity) : '—'}</strong>
          </div>
        </section>

        <section className="module-area">
          <div className="module-pane-header">
            <div>
              <h2>{selectedModule}</h2>
              <p>{selectedDetail?.description}</p>
            </div>
            <div className="module-meta">
              <span>{selectedDetail?.title}</span>
              <span>{loading ? 'Actualizando datos...' : 'Datos sincronizados'}</span>
            </div>
          </div>

          {activeModuleContent}
        </section>

        <section className="agent-panel">
          <div className="agent-panel-header">
            <div>
              <h2>Agentes de plataforma</h2>
              <p>Estado del ecosistema de servicios y acceso directo a documentación relativa.</p>
            </div>
            <div className="agent-links">
              <span>Rutas relativas a agentes</span>
            </div>
          </div>

          <div className="agent-grid">
            {platformAgents.map((agent) => {
              const healthStatus = agents.find((item) => item.name === agent.healthName)?.status ?? 'pending'
              return (
                <article key={agent.name}>
                  <h3>{agent.name}</h3>
                  <p>{agent.role}</p>
                  <div className="agent-footer">
                    <span>{healthStatus === 'success' ? 'Live' : healthStatus === 'error' ? 'Error' : 'Inicializando'}</span>
                    <a href={agent.docPath} target="_blank" rel="noreferrer">Ver agente</a>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
