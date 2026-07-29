import React, { useState } from 'react'
import type { Recipe, RecipeIngredient, AdminItem } from '../types'

interface Props {
  recipes: Recipe[]
  products?: AdminItem[]
  loading?: boolean
  onSaveRecipe?: (payload: {
    recipeId: number
    name: string
    posPluCode: string
    yieldQuantity: number
    standardYieldPct: number
    estimatedCost: number
    items: RecipeIngredient[]
  }) => Promise<void>
}

export const RecipesModule: React.FC<Props> = ({ recipes, products = [], loading, onSaveRecipe }) => {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [items, setItems] = useState<RecipeIngredient[]>([])
  
  // Campos de cabecera de la receta
  const [recipeName, setRecipeName] = useState('')
  const [posPluCode, setPosPluCode] = useState('')
  const [yieldQuantity, setYieldQuantity] = useState(1)
  const [standardYieldPct, setStandardYieldPct] = useState(100)

  // Campos para agregar nuevo insumo
  const [selectedProductId, setSelectedProductId] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(0)
  const [wastePct, setWastePct] = useState<number>(0)
  const [uomId, setUomId] = useState<number>(1)
  const [saving, setSaving] = useState(false)

  const handleOpenEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setRecipeName(recipe.name)
    setPosPluCode(recipe.posPluCode || '')
    setYieldQuantity(recipe.yieldQuantity || 1)
    setStandardYieldPct(recipe.standardYieldPct ?? recipe.standardYieldPercent ?? 100)
    setItems(recipe.items || [])
  }

  // --- Handlers para edición dinámica en la tabla de ingredientes ---
  const handleItemQuantityChange = (index: number, newQty: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], quantity: newQty }
    setItems(updated)
  }

  const handleItemWasteChange = (index: number, newWaste: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], expectedWastePct: newWaste }
    setItems(updated)
  }

  const handleItemUomChange = (index: number, newUomId: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], unitOfMeasureId: newUomId }
    setItems(updated)
  }

  // --- Handler para añadir un nuevo ingrediente ---
  const handleAddIngredient = () => {
    if (!selectedProductId || quantity <= 0) return

    const product = products.find((p) => (p.id ?? p.productId) === selectedProductId)
    const newIngredient: RecipeIngredient = {
      productId: selectedProductId,
      productName: product?.description || product?.name || `Producto ${selectedProductId}`,
      quantity: quantity,
      unitOfMeasureId: uomId,
      expectedWastePct: wastePct,
    }

    setItems([...items, newIngredient])
    setSelectedProductId(0)
    setQuantity(0)
    setWastePct(0)
  }

  const handleRemoveIngredient = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!editingRecipe || !onSaveRecipe) return
    setSaving(true)

    try {
      await onSaveRecipe({
        recipeId: editingRecipe.recipeId,
        name: recipeName,
        posPluCode: posPluCode,
        yieldQuantity: yieldQuantity,
        standardYieldPct: standardYieldPct,
        estimatedCost: editingRecipe.estimatedCost || 0,
        items: items,
      })
      alert('Receta e ingredientes actualizados con éxito.')
      setEditingRecipe(null)
    } catch (err) {
      console.error(err)
      alert('Error guardando los cambios de la receta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="module-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h2>Fichas Técnicas y Recetas</h2>
        <p style={{ color: '#64748b' }}>
          Gestión integral de recetas, control de insumos y mermas teóricas.
        </p>
      </header>

      {loading ? (
        <p>Cargando recetas...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Nombre Receta</th>
              <th style={{ padding: '12px' }}>PLU / POS</th>
              <th style={{ padding: '12px' }}>Porciones</th>
              <th style={{ padding: '12px' }}>Yield Estándar</th>
              <th style={{ padding: '12px' }}>Ingredientes</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((r) => (
              <tr key={r.recipeId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{r.recipeId}</td>
                <td style={{ padding: '12px', fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '12px' }}>{r.posPluCode || 'N/A'}</td>
                <td style={{ padding: '12px' }}>{r.yieldQuantity || 1}</td>
                <td style={{ padding: '12px' }}>{(r.standardYieldPct ?? 100).toFixed(1)}%</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {r.items?.length || 0} Insumos
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenEdit(r)}
                    style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Ver / Editar Ingredientes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal / Panel de Edición de Ingredientes */}
      {editingRecipe && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ 
            background: '#fff', 
            padding: '28px', 
            borderRadius: '12px', 
            width: '90%',               // <-- Ancho relativo al 90% de la pantalla
            maxWidth: '1100px',         // <-- Ampliado a 1100px para ver todas las columnas y botones
            maxHeight: '90vh', 
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3>Editar Receta e Ingredientes: {editingRecipe.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre Receta</label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Código PLU</label>
                <input
                  type="text"
                  value={posPluCode}
                  onChange={(e) => setPosPluCode(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>% Yield Estándar</label>
                <input
                  type="number"
                  value={standardYieldPct}
                  onChange={(e) => setStandardYieldPct(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            {/* Panel de Agregar Insumo Nuevos */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>+ Agregar Nuevo Insumo</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.75rem' }}>Producto / Insumo</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value={0}>-- Seleccionar --</option>
                    {products.map((p) => {
                      const optionId = p.id ?? p.productId ?? 0
                      return (
                        <option key={optionId} value={optionId}>
                          {p.description || p.name || `Producto ${optionId}`}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem' }}>Cantidad</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    step="0.001"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem' }}>Unidad</label>
                  <select
                    value={uomId}
                    onChange={(e) => setUomId(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value={1}>Kg</option>
                    <option value={2}>Gr</option>
                    <option value={3}>Lt</option>
                    <option value={4}>Ml</option>
                    <option value={5}>Und</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem' }}>% Merma</label>
                  <input
                    type="number"
                    value={wastePct}
                    onChange={(e) => setWastePct(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Tabla de Ingredientes Editables */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left', fontSize: '0.8rem' }}>
                  <th style={{ padding: '8px' }}>Insumo</th>
                  <th style={{ padding: '8px', width: '130px' }}>Cantidad</th>
                  <th style={{ padding: '8px', width: '120px' }}>Unidad</th>
                  <th style={{ padding: '8px', width: '140px' }}>% Merma Esperada</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '100px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '12px', color: '#94a3b8' }}>
                      Esta receta no tiene ingredientes configurados.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px', fontWeight: 500 }}>
                        {item.productName || `Producto ID: ${item.productId}`}
                      </td>
                      
                      {/* Campo editable: Cantidad */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(idx, Number(e.target.value))}
                          step="0.001"
                          style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                      </td>

                      {/* Campo editable: Unidad de medida */}
                      <td style={{ padding: '8px' }}>
                        <select
                          value={item.unitOfMeasureId ?? 1}
                          onChange={(e) => handleItemUomChange(idx, Number(e.target.value))}
                          style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        >
                          <option value={1}>Kg</option>
                          <option value={2}>Gr</option>
                          <option value={3}>Lt</option>
                          <option value={4}>Ml</option>
                          <option value={5}>Und</option>
                        </select>
                      </td>

                      {/* Campo editable: % Merma Esperada */}
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          value={item.expectedWastePct ?? 0}
                          onChange={(e) => handleItemWasteChange(idx, Number(e.target.value))}
                          step="0.1"
                          style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                      </td>

                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleRemoveIngredient(idx)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setEditingRecipe(null)}
                style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}