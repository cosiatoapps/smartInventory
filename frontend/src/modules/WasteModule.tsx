// src/modules/WasteModule.tsx
import React from 'react'
import { DataTable } from '../components/DataTable'
import type { WasteLog } from '../types'

interface Props {
  waste: WasteLog[]
  loading: boolean
}

export const WasteModule: React.FC<Props> = ({ waste, loading }) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('es-CO').format(num)

  const columns = [
    { key: 'wasteLogId', label: 'ID' },
    { key: 'category', label: 'Categoría' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'quantity',
      label: 'Cantidad',
      render: (item: WasteLog) => formatNumber(item.quantity),
    },
    {
      key: 'cost',
      label: 'Costo Afectado',
      render: (item: WasteLog) => `$${item.cost.toFixed(2)}`,
    },
  ]

  return (
    <section className="module-panel">
      <div className="module-cards">
        <article>
          <h3>Eventos reportados</h3>
          <p>{waste.length}</p>
        </article>
        <article>
          <h3>Costo acumulado</h3>
          <p>${waste.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}</p>
        </article>
      </div>

      <div style={{ marginTop: '24px' }}>
        <DataTable data={waste} columns={columns} loading={loading} />
      </div>
    </section>
  )
}