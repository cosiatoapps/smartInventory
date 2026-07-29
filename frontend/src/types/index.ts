export type InventoryItem = {
  inventoryId: number
  sku: string
  product: string
  category: string
  location: string
  warehouse: string
  quantity: number
  lot: string
  expiryDate: string | null
}

export type Metrics = {
  totalQuantity: number
  activeProducts: number
  expiringSoon: number
  recipeCount: number
  productionOrders: number
  wasteCount: number
}

export type Summary = {
  productCount: number
  locationCount: number
  warehouseCount: number
}

export type WasteLog = {
  wasteLogId: number
  category: string
  description: string
  quantity: number
  cost: number
}

export type FoodCostMetrics = {
  theoreticalCost: number
  realCost: number
  varianceCost: number
  foodCostPercent: number
  foodWastePercent: number
}

export type ProductionMetrics = {
  orderCount: number
  recipeCount: number
  totalProduction: number
  averageYield: number
  wastePercent: number
}

export type AgentStatus = {
  name: string
  url: string
  status: 'success' | 'error' | 'pending'
}

export interface RecipeIngredient {
  recipeItemId?: number
  productId: number
  productName?: string | number 
  quantity: number
  unitOfMeasureId?: number
  unitCode?: string
  expectedWastePct?: number
}

export interface Recipe {
  recipeId: number
  name: string
  description?: string
  cost?: number
  estimatedCost?: number 
  posPluCode?: string
  yieldQuantity?: number
  standardYieldPct?: number
  standardYieldPercent?: number
  items?: RecipeIngredient[]
}

// Para asegurar compatibilidad con ProductionYieldModule:
export type RecipeDto = Recipe

export interface ProductionOrderPayload {
  siteId: number
  recipeId: number
  rawMaterialUsedQty: number
  usefulOutputQty: number
}

export type AdminResource = 'Subsidiarias' | 'Sedes' | 'Bodegas' | 'Ubicaciones' | 'Categorías' | 'Productos'
export type AdminItem = Record<string, string | number | null>