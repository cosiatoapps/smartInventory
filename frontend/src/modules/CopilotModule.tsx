import React, { useState } from 'react'
import type { InventoryItem } from '../types'

interface Props {
  inventory: InventoryItem[]
}

export const CopilotModule: React.FC<Props> = ({ inventory }) => {
  const [query, setQuery] = useState('')
  const topExpiring = inventory
    .filter((item) => item.expiryDate)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
    .slice(0, 3)

  return (
    <section className="module-panel">
      <div className="copilot-grid">
        <article>
          <h3>¿Por qué aumentó el desperdicio?</h3>
          <p>El desperdicio aumentó 18% por sobreproducción en desayuno buffet y vencimientos de lácteos.</p>
        </article>
        <article>
          <h3>Productos con mayor riesgo de vencimiento</h3>
          <p>{topExpiring.map((item) => item.product).join(', ') || 'No hay datos críticos'}</p>
        </article>
      </div>

      <div style={{ marginTop: '28px', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
        <h3>Consultar al Copilot Operacional</h3>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <input
            type="text"
            placeholder="Ej: ¿Cuáles son las bodegas con mayor diferencia este mes?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
          />
          <button
            type="button"
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#0067b1',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Preguntar
          </button>
        </div>
      </div>
    </section>
  )
}