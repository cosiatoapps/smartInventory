export type UnitOfMeasure = {
  unitOfMeasureId: number
  code: string
  name: string
}

export type RecipeItemDto = {
  recipeItemId: number
  productId: number
  productName: string
  quantity: number
  unitOfMeasure: string
  expectedWastePercent: number
  unitCost: number
}

export type RecipeDto = {
  recipeId: number
  name: string
  posPluCode: string
  yieldQuantity: number
  standardYieldPercent: number
  estimatedCost: number
  items: RecipeItemDto[]
}

export type TheoreticalConsumptionResult = {
  productId: number
  productName: string
  theoreticalQty: number
  actualQty: number
  varianceQty: number
  variancePercent: number
  requiresAlert: boolean
}

export type ProductionLogPayload = {
  siteId: number
  recipeId: number
  rawMaterialUsedQty: number
  usefulOutputQty: number
}