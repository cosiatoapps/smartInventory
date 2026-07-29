import { fetchApi } from '../api/httpClient'
import { getPendingMutations, removeMutation } from './offlineStorage'

export async function syncOfflineData(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) return { synced: 0, failed: 0 }

  const mutations = await getPendingMutations()
  let synced = 0
  let failed = 0

  for (const item of mutations) {
    try {
      await fetchApi(item.endpoint, {
        method: item.method,
        body: JSON.stringify(item.payload)
      })
      await removeMutation(item.id)
      synced++
    } catch (error) {
      console.error(`Error sincronizando item ${item.id}:`, error)
      failed++
    }
  }

  return { synced, failed }
}