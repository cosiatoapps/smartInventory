import React from 'react'
import type { FoodCostMetrics, InventoryItem, ProductionMetrics } from '../types'

interface Props {
  mode: 'executive' | 'operational'
  inventory: InventoryItem[]
  foodCost: FoodCostMetrics | null
  production: ProductionMetrics | null
  wasteCount: number
  recipeCount: number
}

export const DashboardModule: React.FC<Props> = ({
  mode,
  inventory,
  foodCost,
  production,
  wasteCount,
  recipeCount,
}) => {
  const topExpiring = inventory
    .filter((item) => item.expiryDate)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
    .slice(0, 4)

  const foodCostPercent = foodCost ? `${foodCost.foodCostPercent.toFixed(1)}%` : '—'
  const foodWastePercent = foodCost ? `${foodCost.foodWastePercent.toFixed(1)}%` : '—'
  const averageYield = production ? `${production.averageYield.toFixed(1)}%` : '—'
  const orderCount = production ? production.orderCount.toString() : '—'

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

  if (mode === 'executive') {
    return (
      <section className="dashboard-panel">
        {renderCards([
          { label: 'Inventory Accuracy', value: '96.4%' },
          { label: 'Food Cost %', value: foodCostPercent },
          { label: 'Waste %', value: foodWastePercent },
          { label: 'Yield objetivo', value: averageYield },
        ])}

        <div className="insight-grid" style={{ marginTop: '24px' }}>
          <article>
            <h3>Riesgo de vencimiento</h3>
            <p>{topExpiring.length} productos críticos por vencer en los próximos 30 días.</p>
          </article>
          <article>
            <h3>Desperdicio económico</h3>
            <p>{wasteCount} eventos de merma registrados en el sistema.</p>
          </article>
          <article>
            <h3>Recetas digitales</h3>
            <p>{recipeCount} recetas disponibles para costeo y producción.</p>
          </article>
          <article>
            <h3>Operaciones activas</h3>
            <p>{orderCount} órdenes de producción planificadas.</p>
          </article>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-panel">
      {renderCards([
        { label: 'Inventarios registrados', value: inventory.length.toString() },
        { label: 'Producción hoy', value: orderCount },
        { label: 'Perecederos críticos', value: topExpiring.length.toString() },
        { label: 'Food Waste %', value: foodWastePercent },
      ])}

      <div className="insight-grid" style={{ marginTop: '24px' }}>
        <article>
          <h3>Desviación de costo</h3>
          <p>{foodCostPercent} de food cost actual estimado.</p>
        </article>
        <article>
          <h3>Yield operativo</h3>
          <p>{averageYield} de rendimiento de producción estimado.</p>
        </article>
      </div>
    </section>
  )
}