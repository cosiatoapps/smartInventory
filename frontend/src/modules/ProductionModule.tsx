import React from 'react'
import type { ProductionMetrics } from '../types'

interface Props {
  production: ProductionMetrics | null
  loading: boolean
}

export const ProductionModule: React.FC<Props> = ({ production, loading }) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('es-CO').format(num)

  return (
    <section className="module-panel">
      <div className="module-cards">
        <article>
          <h3>Órdenes activas</h3>
          <p>{production ? production.orderCount : '—'}</p>
        </article>
        <article>
          <h3>Producción total</h3>
          <p>{production ? `${formatNumber(production.totalProduction)} unds` : '—'}</p>
        </article>
        <article>
          <h3>Rendimiento (Yield)</h3>
          <p>{production ? `${production.averageYield.toFixed(1)}%` : '—'}</p>
        </article>
        <article>
          <h3>Merma de producción</h3>
          <p>{production ? `${production.wastePercent.toFixed(1)}%` : '—'}</p>
        </article>
      </div>

      <div className="info-grid" style={{ marginTop: '24px' }}>
        <article>
          <h3>Órdenes de Producción Registradas</h3>
          <p>
            {production
              ? `${production.orderCount} órdenes planificadas con un total de ${formatNumber(production.totalProduction)} unidades.`
              : 'Cargando datos de producción...'}
          </p>
        </article>
        <article>
          <h3>Rendimiento de Planta</h3>
          <p>
            {production
              ? `El nivel de desperdicio estimado en planta es de ${production.wastePercent.toFixed(1)}% sobre el volumen total.`
              : 'Cargando métricas de planta...'}
          </p>
        </article>
      </div>
      {loading && <p style={{ marginTop: '16px' }}>Cargando datos de producción...</p>}
    </section>
  )
}