import React, { useEffect, useState } from 'react'
import { DataTable } from '../components/DataTable'
import type { AdminItem, AdminResource } from '../types'

type AdminField = {
  key: string
  label: string
  type: 'text' | 'number'
  fkResource?: AdminResource // Indica si el campo es llave foránea
}

type AdminResourceConfig = {
  endpoint: string
  fields: AdminField[]
  columns: { key: string; label: string; fkResource?: AdminResource }[]
}

const adminResourceConfig: Record<AdminResource, AdminResourceConfig> = {
  Subsidiarias: {
    endpoint: 'subsidiaries',
    fields: [
      { key: 'companyId', label: 'Empresa', type: 'number' },
      { key: 'name', label: 'Nombre', type: 'text' },
    ],
    columns: [
      { key: 'subsidiaryId', label: 'ID' },
      { key: 'companyId', label: 'Empresa' },
      { key: 'name', label: 'Nombre' },
    ],
  },
  Sedes: {
    endpoint: 'sites',
    fields: [
      { key: 'subsidiaryId', label: 'Subsidiaria', type: 'number', fkResource: 'Subsidiarias' },
      { key: 'name', label: 'Nombre', type: 'text' },
      { key: 'type', label: 'Tipo', type: 'text' },
    ],
    columns: [
      { key: 'siteId', label: 'ID' },
      { key: 'subsidiaryId', label: 'Subsidiaria', fkResource: 'Subsidiarias' },
      { key: 'name', label: 'Nombre' },
      { key: 'type', label: 'Tipo' },
    ],
  },
  Bodegas: {
    endpoint: 'warehouses',
    fields: [
      { key: 'siteId', label: 'Sede', type: 'number', fkResource: 'Sedes' },
      { key: 'name', label: 'Nombre', type: 'text' },
    ],
    columns: [
      { key: 'warehouseId', label: 'ID' },
      { key: 'siteId', label: 'Sede', fkResource: 'Sedes' },
      { key: 'name', label: 'Nombre' },
    ],
  },
  Ubicaciones: {
    endpoint: 'locations',
    fields: [
      { key: 'warehouseId', label: 'Bodega', type: 'number', fkResource: 'Bodegas' },
      { key: 'code', label: 'Código', type: 'text' },
    ],
    columns: [
      { key: 'locationId', label: 'ID' },
      { key: 'warehouseId', label: 'Bodega', fkResource: 'Bodegas' },
      { key: 'code', label: 'Código' },
    ],
  },
  Categorías: {
    endpoint: 'categories',
    fields: [{ key: 'name', label: 'Nombre', type: 'text' }],
    columns: [
      { key: 'categoryId', label: 'ID' },
      { key: 'name', label: 'Nombre' },
    ],
  },
  Productos: {
    endpoint: 'products',
    fields: [
      { key: 'sku', label: 'SKU', type: 'text' },
      { key: 'description', label: 'Descripción', type: 'text' },
      { key: 'categoryId', label: 'Categoría', type: 'number', fkResource: 'Categorías' },
    ],
    columns: [
      { key: 'productId', label: 'ID' },
      { key: 'sku', label: 'SKU' },
      { key: 'description', label: 'Descripción' },
      { key: 'categoryId', label: 'Categoría', fkResource: 'Categorías' },
    ],
  },
}

const createEmptyForm = (resource: AdminResource) =>
  Object.fromEntries(
    adminResourceConfig[resource].fields.map((field) => [field.key, ''])
  ) as Record<string, string>

interface Props {
  selectedResource: AdminResource
  onSelectResource: (res: AdminResource) => void
  items: AdminItem[]
  loading: boolean
  lookupData: Record<AdminResource, AdminItem[]> // Mapeo global de items para resolver FKs
  onSave: (resource: AdminResource, id: number | null, payload: Record<string, unknown>) => Promise<void>
  onDelete: (resource: AdminResource, id: number) => Promise<void>
}

export const AdminModule: React.FC<Props> = ({
  selectedResource,
  items,
  loading,
  lookupData,
  onSave,
  onDelete,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formState, setFormState] = useState<Record<string, string>>(() => createEmptyForm(selectedResource))
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)

  const config = adminResourceConfig[selectedResource]

  useEffect(() => {
    setSelectedId(null)
    setStatusMsg(null)
    setFormState(createEmptyForm(selectedResource))
    setIsFormVisible(false)
  }, [selectedResource])

  const resetForm = () => {
    setSelectedId(null)
    setStatusMsg(null)
    setFormState(createEmptyForm(selectedResource))
  }

  const handleFieldChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const handleEdit = (item: AdminItem) => {
    const idKey = config.columns[0].key
    const idValue = Number(item[idKey])
    setSelectedId(idValue)

    const updatedForm = Object.fromEntries(
      config.fields.map((f) => [
        f.key,
        item[f.key] !== undefined && item[f.key] !== null ? String(item[f.key]) : '',
      ])
    )
    setFormState(updatedForm as Record<string, string>)
    setStatusMsg(`Editando ${selectedResource} #${idValue}`)
    setIsFormVisible(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatusMsg(null)

    try {
      const payload = Object.fromEntries(
        config.fields.map((f) => [
          f.key,
          f.type === 'number' ? Number(formState[f.key] || 0) : formState[f.key] || '',
        ])
      )

      await onSave(selectedResource, selectedId, payload)
      setStatusMsg(selectedId ? 'Registro actualizado correctamente' : 'Registro creado correctamente')
      resetForm()
      setIsFormVisible(false)
    } catch (err) {
      console.error('Error guardando en AdminModule:', err)
      setStatusMsg('Ocurrió un error al guardar el registro.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('¿Deseas eliminar este registro?')) return

    setSubmitting(true)
    setStatusMsg(null)
    try {
      await onDelete(selectedResource, id)
      setStatusMsg('Registro eliminado correctamente')
      if (selectedId === id) resetForm()
    } catch (err) {
      console.error('Error eliminando en AdminModule:', err)
      setStatusMsg('No se pudo eliminar el registro.')
    } finally {
      setSubmitting(false)
    }
  }

  // Helper para resolver el nombre de la FK
  const resolveFkValue = (fkResource: AdminResource, fkId: any) => {
    if (!fkId) return '—'
    const list = lookupData[fkResource] || []
    const match = list.find((x) => {
      const idKey = Object.keys(x)[0] // Usar primera llave como ID
      return String(x[idKey]) === String(fkId)
    })
    return match ? (match.name || match.description || match.code || fkId) : fkId
  }

  return (
    <section className="module-panel admin-module">
      <div className="admin-management">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            background: '#ffffff',
            padding: '16px 24px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Gestión de {selectedResource}</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Administración centralizada para la entidad {selectedResource}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isFormVisible && !selectedId) {
                setIsFormVisible(false)
              } else {
                resetForm()
                setIsFormVisible(true)
              }
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              background: isFormVisible && !selectedId ? '#64748b' : '#0067b1',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isFormVisible && !selectedId ? '✕ Cancelar' : `➕ Crear ${selectedResource}`}
          </button>
        </div>

        {/* Formulario con selectores de Llave Foránea */}
        {isFormVisible && (
          <div
            className="admin-form-card"
            style={{
              marginBottom: '24px',
              background: '#ffffff',
              padding: '24px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              border: '2px solid #0067b1',
            }}
          >
            <h3 style={{ margin: '0 0 16px', color: '#0067b1' }}>
              {selectedId ? `Editar ${selectedResource} (#${selectedId})` : `Nuevo Registro de ${selectedResource}`}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {config.fields.map((field) => {
                  if (field.fkResource) {
                    const fkOptions = lookupData[field.fkResource] || []
                    return (
                      <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600 }}>
                        {field.label}
                        <select
                          value={formState[field.key] ?? ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          required
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                          }}
                        >
                          <option value="">-- Seleccionar {field.label} --</option>
                          {fkOptions.map((opt) => {
                            const optIdKey = Object.keys(opt)[0]
                            const optId = opt[optIdKey]
                            const optName = opt.name || opt.description || opt.code || optId
                            return (
                              <option key={String(optId)} value={String(optId)}>
                                {optName}
                              </option>
                            )
                          })}
                        </select>
                      </label>
                    )
                  }

                  return (
                    <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600 }}>
                      {field.label}
                      <input
                        type={field.type}
                        value={formState[field.key] ?? ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        required
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                        }}
                      />
                    </label>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0067b1',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Guardando...' : selectedId ? 'Guardar Cambios' : 'Crear Registro'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setIsFormVisible(false)
                  }}
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>

              {statusMsg && <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#0067b1' }}>{statusMsg}</p>}
            </form>
          </div>
        )}

        {/* Tabla con nombres resueltos para las FK */}
        <div className="admin-table-card">
          <DataTable
            data={items}
            loading={loading}
            columns={[
              ...config.columns.map((col) => ({
                key: col.key,
                label: col.label,
                render: (item: AdminItem) => {
                  const rawVal = item[col.key]
                  if (col.fkResource) {
                    return resolveFkValue(col.fkResource, rawVal)
                  }
                  return rawVal ?? '—'
                },
              })),
              {
                key: 'actions',
                label: 'Acciones',
                render: (item: AdminItem) => {
                  const idKey = config.columns[0].key
                  const itemId = Number(item[idKey])
                  return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #0067b1',
                          background: '#eef4fb',
                          color: '#0067b1',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(itemId)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #ef4444',
                          background: '#fef2f2',
                          color: '#ef4444',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  )
                },
              },
            ]}
          />
        </div>
      </div>
    </section>
  )
}