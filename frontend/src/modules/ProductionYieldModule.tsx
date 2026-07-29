import React, { useState } from 'react'
import type { Recipe } from '../types'

interface Props {
  recipes: Recipe[] // <-- Cambiar RecipeDto[] por Recipe[] (o usar alias)
  onSaveProduction: (payload: { recipeId: number; rawQty: number; usefulQty: number }) => Promise<void>
}

export const ProductionYieldModule: React.FC<Props> = ({ recipes, onSaveProduction }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(recipes[0]?.recipeId || 0)
  const [rawQty, setRawQty] = useState<string>('')
  const [usefulQty, setUsefulQty] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const selectedRecipe = recipes.find((r) => r.recipeId === selectedRecipeId)

  // Cálculo de Rendimiento (Yield %) en tiempo real
  const rawNum = Number(rawQty) || 0
  const usefulNum = Number(usefulQty) || 0
  const currentYield = rawNum > 0 ? (usefulNum / rawNum) * 100 : 0
  const isYieldLow = selectedRecipe ? currentYield < (selectedRecipe.standardYieldPct ?? 100) - 5 : false
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecipeId || rawNum <= 0 || usefulNum <= 0) return

    setLoading(true)
    try {
      await onSaveProduction({
        recipeId: selectedRecipeId,
        rawQty: rawNum,
        usefulQty: usefulNum,
      })
      setFeedback('✅ Registro de producción y rendimiento guardado correctamente.')
      setRawQty('')
      setUsefulQty('')
    } catch (err) {
      setFeedback('❌ Error registrando la producción.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="module-panel">
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <h2 style={{ margin: '0 0 16px', color: '#0067b1' }}>Control de Producción y Rendimiento (Yield)</h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600 }}>
              Receta / Preparación
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              >
                {recipes.map((r) => (
                  <option key={r.recipeId} value={r.recipeId}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600 }}>
              Materia Prima Utilizada (Bruto)
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 10.0 (Kg)"
                value={rawQty}
                onChange={(e) => setRawQty(e.target.value)}
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600 }}>
              Producción Útil Obtención (Neto)
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 8.2 (Kg)"
                value={usefulQty}
                onChange={(e) => setUsefulQty(e.target.value)}
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
            </label>
          </div>

          {/* Indicador de Rendimiento en Tiempo Real */}
          {rawNum > 0 && usefulNum > 0 && (
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: isYieldLow ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${isYieldLow ? '#ef4444' : '#22c55e'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ color: isYieldLow ? '#b91c1c' : '#15803d' }}>
                  Rendimiento Calculado: {currentYield.toFixed(1)}%
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#475569' }}>
                  Objetivo Estándar: {selectedRecipe?.standardYieldPct ?? 100}%
                </p>
              </div>
              {isYieldLow && (
                <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 700 }}>
                  ⚠ Merma excesiva detectada
                </span>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#0067b1',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              width: 'max-content',
            }}
          >
            {loading ? 'Guardando...' : 'Registrar Rendimiento'}
          </button>

          {feedback && <p style={{ fontWeight: 600, color: '#334155' }}>{feedback}</p>}
        </form>
      </div>
    </section>
  )
}