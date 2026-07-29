import React from 'react'
import type { Summary } from '../types'

interface Props {
  summary: Summary | null
  loading: boolean
}

export const MdmModule: React.FC<Props> = ({ summary, loading }) => {
  return (
    <section className="module-panel">
      <div className="module-cards">
        <article>
          <h3>SKUs en catálogo</h3>
          <p>{summary ? summary.productCount : '—'}</p>
        </article>
        <article>
          <h3>Ubicaciones</h3>
          <p>{summary ? summary.locationCount : '—'}</p>
        </article>
        <article>
          <h3>Almacenes</h3>
          <p>{summary ? summary.warehouseCount : '—'}</p>
        </article>
        <article>
          <h3>Calidad de datos</h3>
          <p>94%</p>
        </article>
      </div>

      <div style={{ marginTop: '24px', padding: '20px', background: '#ffffff', borderRadius: '16px' }}>
        <h3>Catálogo Maestro Corporativo (MDM)</h3>
        <p>Estandarización de SKUs, Categorías Corporativas y Factores de Conversión de Unidades para toda la cadena hotelera y parques.</p>
        {loading && <p>Cargando datos maestros...</p>}
      </div>
    </section>
  )
}