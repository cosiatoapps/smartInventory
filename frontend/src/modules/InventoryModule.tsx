import React from 'react'
import { DataTable } from '../components/DataTable'
import type { InventoryItem } from '../types'

interface Props {
  inventory: InventoryItem[]
  loading: boolean
}

export const InventoryModule: React.FC<Props> = ({ inventory, loading }) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('es-CO').format(num)

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'product', label: 'Producto' },
    { key: 'category', label: 'Categoría' },
    { key: 'location', label: 'Ubicación' },
    { key: 'warehouse', label: 'Warehouse' },
    {
      key: 'quantity',
      label: 'Cantidad',
      render: (item: InventoryItem) => formatNumber(item.quantity),
    },
    { key: 'lot', label: 'Lote' },
    {
      key: 'expiryDate',
      label: 'Vencimiento',
      render: (item: InventoryItem) => item.expiryDate ?? 'N/A',
    },
  ]

  return (
    <section className="inventory-panel">
      <div className="inventory-header">
        <div>
          <h2>Inventario activo</h2>
          <p>Inventarios digitales con visibilidad de lotes, almacenes y vencimientos.</p>
        </div>
        <div>{loading ? 'Cargando...' : `${inventory.length} registros totales`}</div>
      </div>

      <DataTable data={inventory} columns={columns} loading={loading} />
    </section>
  )
}