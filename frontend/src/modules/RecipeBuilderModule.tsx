import React, { useState } from 'react'
import type { AdminItem, RecipeIngredient } from '../types'

interface Props {
  products: AdminItem[]
  onSaveRecipe: (payload: {
    name: string
    posPluCode: string
    yieldQuantity: number
    standardYieldPct: number
    estimatedCost: number
    items: RecipeIngredient[]
  }) => Promise<void>
}

export const RecipeBuilderModule: React.FC<Props> = ({ products, onSaveRecipe }) => {
  const [name, setName] = useState('')
  const [posPluCode, setPosPluCode] = useState('')
  const [yieldQuantity, setYieldQuantity] = useState(1)
  const [standardYieldPct, setStandardYieldPct] = useState(100)
  
  // Lista de ingredientes agregados a la receta
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])

  // Formulario temporal para un ingrediente
  const [selectedProductId, setSelectedProductId] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(0)
  const [wastePct, setWastePct] = useState<number>(0)
  const [unitOfMeasureId, setUnitOfMeasureId] = useState<number>(1) // 1 = Kg / Lt por defecto
  const [saving, setSaving] = useState(false)

  const handleAddIngredient = () => {
    if (!selectedProductId || quantity <= 0) return

    const product = products.find((p) => (p.id ?? p.productId) === selectedProductId)
    
    // Garantizamos que productName sea siempre un string
    const resolvedName = product?.description 
        ? String(product.description) 
        : product?.name 
        ? String(product.name) 
        : `Producto ${selectedProductId}`

    const newIngredient: RecipeIngredient = {
        productId: selectedProductId,
        productName: resolvedName,
        quantity: quantity,
        unitOfMeasureId: unitOfMeasureId,
        expectedWastePct: wastePct,
    }

    setIngredients([...ingredients, newIngredient])
    setSelectedProductId(0)
    setQuantity(0)
    setWastePct(0)
    }

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || ingredients.length === 0) {
      alert('Por favor ingrese el nombre de la receta y al menos un ingrediente.')
      return
    }

    setSaving(true)
    try {
      await onSaveRecipe({
        name,
        posPluCode,
        yieldQuantity,
        standardYieldPct,
        estimatedCost: 0, // Se calcula dinámicamente o por sistema
        items: ingredients,
      })
      
      // Limpiar formulario
      setName('')
      setPosPluCode('')
      setYieldQuantity(1)
      setStandardYieldPct(100)
      setIngredients([])
      alert('Ficha Técnica / Receta guardada exitosamente.')
    } catch (err) {
      console.error(err)
      alert('Error guardando la receta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2>Construcción de Ficha Técnica (Receta)</h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Configure los insumos, mermas esperadas y parámetros para el control de producción.
      </p>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Nombre Receta / Preparación</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Salsa Boloñesa 5Kg"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Código POS / PLU</label>
            <input
              type="text"
              value={posPluCode}
              onChange={(e) => setPosPluCode(e.target.value)}
              placeholder="Ej: PLU-102"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Porciones / Rendimiento Esperado</label>
            <input
              type="number"
              value={yieldQuantity}
              onChange={(e) => setYieldQuantity(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              min="1"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>% Rendimiento Estándar (Yield)</label>
            <input
              type="number"
              value={standardYieldPct}
              onChange={(e) => setStandardYieldPct(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              step="0.1"
            />
          </div>
        </div>

        {/* Sección para agregar insumos */}
        <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', marginBottom: '24px', background: '#f8fafc' }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Agregar Insumo / Materia Prima</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.85rem' }}>Seleccionar Producto</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value={0}>-- Seleccione un insumo --</option>
                {products.map((p) => {
                  const pId = p.id ?? p.productId ?? 0
                  return (
                    <option key={pId} value={pId}>
                      {p.sku ? `[${p.sku}] ` : ''}{p.description || p.name}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem' }}>Cantidad Consumo</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="0.00"
                step="0.0001"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem' }}>Unidad Medida</label>
              <select
                value={unitOfMeasureId}
                onChange={(e) => setUnitOfMeasureId(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value={1}>Kilogramos (Kg)</option>
                <option value={2}>Gramos (Gr)</option>
                <option value={3}>Litros (Lt)</option>
                <option value={4}>Mililitros (Ml)</option>
                <option value={5}>Unidades (Und)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem' }}>% Merma Esperada</label>
              <input
                type="number"
                value={wastePct}
                onChange={(e) => setWastePct(Number(e.target.value))}
                placeholder="0%"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              + Añadir
            </button>
          </div>
        </div>

        {/* Tabla de Insumos Agregados */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Insumo</th>
              <th style={{ padding: '10px' }}>Cantidad</th>
              <th style={{ padding: '10px' }}>% Merma Teórica</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                  No ha añadido ningún insumo a esta receta.
                </td>
              </tr>
            ) : (
              ingredients.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}>{item.productName}</td>
                  <td style={{ padding: '10px' }}>{item.quantity}</td>
                  <td style={{ padding: '10px' }}>{item.expectedWastePct}%</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button
          type="submit"
          disabled={saving}
          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
        >
          {saving ? 'Guardando Ficha Técnica...' : 'Guardar Ficha Técnica'}
        </button>
      </form>
    </div>
  )
}