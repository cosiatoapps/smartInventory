  const API_GATEWAY_URL =
  (import.meta as unknown as { env?: { VITE_API_GATEWAY_URL?: string } }).env?.VITE_API_GATEWAY_URL ||
  'http://127.0.0.1:5210/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const isAbsoluteUrl = /^https?:\/\//i.test(endpoint)

  const url = isAbsoluteUrl
    ? endpoint
    : `${API_GATEWAY_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const headers = new Headers(options?.headers)
  if (!headers.has('Content-Type') && options?.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(response.status, errorText || `HTTP Error ${response.status}`)
  }

  // 1. Check for 204 No Content or empty Content-Length header
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T
  }

  // 2. Safely inspect text body before parsing JSON
  const text = await response.text()
  if (!text || text.trim().length === 0) {
    return {} as T
  }

  return JSON.parse(text) as T
}