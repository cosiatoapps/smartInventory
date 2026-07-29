import React, { useState } from 'react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No hay registros disponibles',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Cuentas de Paginación
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const currentData = data.slice(startIndex, endIndex)

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1) // Reiniciar a la primera página
  }

  return (
    <div className="data-table-container">
      {/* Selector de registros por página */}
      <div className="table-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Mostrar:</label>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Mostrando {totalItems > 0 ? startIndex + 1 : 0} - {endIndex} de {totalItems} registros
        </span>
      </div>

      {/* Tabla de datos */}
      <div className="table-panel">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>
                  Cargando información...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={item.id ?? item.inventoryId ?? item.recipeId ?? item.wasteLogId ?? index}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Navegación de Paginación */}
      {totalPages > 1 && (
        <div className="table-pagination" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#e2e8f0' : '#ffffff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Anterior
          </button>
          <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#e2e8f0' : '#ffffff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}