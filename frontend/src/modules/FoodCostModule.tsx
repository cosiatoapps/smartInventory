import React from 'react'
import type { FoodCostMetrics } from '../types'

interface Props {
  foodCost: FoodCostMetrics | null
  loading: boolean
}

export const FoodCostModule: React.FC<Props> = ({ foodCost, loading }) => {
  return (
    <section className="module-panel">
      <div className="module-cards">
        <article>
          <h3>Costo teórico</h3>
          <p>{foodCost ? `$${foodCost.theoreticalCost.toFixed(2)}` : '—'}</p>
        </article>
        <article>
          <h3>Costo real</h3>
          <p>{foodCost ? `$${foodCost.realCost.toFixed(2)}` : '—'}</p>
        </article>
        <article>
          <h3>Variación</h3>
          <p>{foodCost ? `$${foodCost.varianceCost.toFixed(2)}` : '—'}</p>
        </article>
        <article>
          <h3>Food Cost %</h3>
          <p>{foodCost ? `${foodCost.foodCostPercent.toFixed(1)}%` : '—'}</p>
        </article>
        <article>
          <h3>Food Waste %</h3>
          <p>{foodCost ? `${foodCost.foodWastePercent.toFixed(1)}%` : '—'}</p>
        </article>
      </div>
      {loading && <p style={{ marginTop: '16px' }}>Cargando métricas de Food Cost...</p>}
    </section>
  )
}