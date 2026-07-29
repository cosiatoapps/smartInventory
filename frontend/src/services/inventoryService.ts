// src/services/inventoryService.ts
import { fetchApi } from './api/httpClient'
import type {
  InventoryItem,
  Metrics,
  Summary,
  Recipe,
  RecipeIngredient,
  WasteLog,
  AdminItem,
  FoodCostMetrics,
  ProductionMetrics,
} from '../types'

// URLs base para la arquitectura de microservicios
const INVENTORY_URL = import.meta.env.VITE_INVENTORY_API_URL || 'http://127.0.0.1:5210/api'
const PRODUCTION_URL = import.meta.env.VITE_PRODUCTION_API_URL || 'http://127.0.0.1:5229/api'
const FOODCOST_URL = import.meta.env.VITE_FOODCOST_API_URL || 'http://127.0.0.1:5205/api'

export const inventoryService = {
  // --- Inventory.Api (Puerto 5210) ---
  getInventory: () => fetchApi<InventoryItem[]>(`${INVENTORY_URL}/inventory`),
  getMetrics: () => fetchApi<Metrics>(`${INVENTORY_URL}/metrics`),
  getSummary: () => fetchApi<Summary>(`${INVENTORY_URL}/summary`),

  // --- Production.Api (Puerto 5211) ---
  getRecipes: () => fetchApi<Recipe[]>(`${PRODUCTION_URL}/recipes`),
  getProductionMetrics: () => fetchApi<ProductionMetrics>(`${PRODUCTION_URL}/production/metrics`),

  // --- FoodCost.Api (Puerto 5212) ---
  getWaste: () => fetchApi<WasteLog[]>(`${FOODCOST_URL}/waste`),
  getFoodCostMetrics: () => fetchApi<FoodCostMetrics>(`${FOODCOST_URL}/foodcost/metrics`),

  // --- Administración / MDM -> Inventory.Api (Puerto 5210) ---
  getAdminItems: (endpoint: string) =>
    fetchApi<AdminItem[]>(`${INVENTORY_URL}/admin/${endpoint}`),

  saveAdminItem: (endpoint: string, id: number | null, payload: Record<string, unknown>) => {
    if (id) {
      return fetchApi(`${INVENTORY_URL}/admin/${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    }
    return fetchApi(`${INVENTORY_URL}/admin/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  deleteAdminItem: (endpoint: string, id: number) =>
    fetchApi(`${INVENTORY_URL}/admin/${endpoint}/${id}`, {
      method: 'DELETE',
    }),
  
  // POST: Registro de producción y cálculo de rendimiento
  createProductionOrder: (payload: {
    siteId: number
    recipeId: number
    rawMaterialUsedQty: number
    usefulOutputQty: number
  }) =>
    fetchApi(`${PRODUCTION_URL}/production/orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  saveRecipeFull: (payload: {
    name: string
    posPluCode: string
    yieldQuantity: number
    standardYieldPct: number
    estimatedCost: number
    items: RecipeIngredient[]
  }) =>
    fetchApi(`${PRODUCTION_URL}/recipes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  updateRecipeFull: (
    id: number,
    payload: {
      recipeId?: number
      name: string
      posPluCode: string
      yieldQuantity: number
      standardYieldPct: number
      estimatedCost: number
      items: RecipeIngredient[]
    }
  ) =>
    fetchApi(`${PRODUCTION_URL}/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
}