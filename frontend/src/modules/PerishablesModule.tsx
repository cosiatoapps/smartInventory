import React from 'react'
import type { InventoryItem } from '../types'

interface Props {
  inventory: InventoryItem[]
  loading: boolean
}

export const PerishablesModule: React.FC<Props> = ({ inventory, loading }) => {
  const topExpiring = inventory
    .filter((item) => item.expiryDate)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
    .slice(0, 6)

  return (
    <section className="module-panel">
      <div className="module-cards">
        <article>
          <h3>Perecederos en riesgo</h3>
          <p>{topExpiring.length}</p>
        </article>
        <article>
          <h3>Estrategia de Salida</h3>
          <p>Rotación FEFO Activa</p>
        </article>
      </div>

      <h3 style={{ marginTop: '28px', marginBottom: '16px' }}>Vencimientos Próximos (Top Críticos)</h3>
      {loading ? (
        <p>Cargando perecederos...</p>
      ) : (
        <div className="info-grid">
          {topExpiring.map((item) => (
            <article key={item.inventoryId}>
              <h3>{item.product}</h3>
              <p>SKU: {item.sku} | Lote: {item.lot}</p>
              <p style={{ color: '#d97706', fontWeight: 'bold', marginTop: '8px' }}>
                Vence: {item.expiryDate || 'Sin fecha'}
              </p>
              <small>{item.warehouse} — Ubicación: {item.location}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}