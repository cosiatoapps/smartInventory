export type PendingMutation = {
  id: string
  endpoint: string
  method: 'POST' | 'PUT' | 'DELETE'
  payload: unknown
  timestamp: number
}

const DB_NAME = 'SmartInventoryOfflineDB'
const DB_VERSION = 1

export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function enqueueMutation(mutation: Omit<PendingMutation, 'id' | 'timestamp'>): Promise<void> {
  const db = await openOfflineDB()
  const tx = db.transaction('sync_queue', 'readwrite')
  const store = tx.objectStore('sync_queue')
  
  const item: PendingMutation = {
    ...mutation,
    id: crypto.randomUUID(),
    timestamp: Date.now()
  }

  store.add(item)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  const db = await openOfflineDB()
  const tx = db.transaction('sync_queue', 'readonly')
  const store = tx.objectStore('sync_queue')
  const request = store.getAll()

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as PendingMutation[])
    request.onerror = () => reject(request.error)
  })
}

export async function removeMutation(id: string): Promise<void> {
  const db = await openOfflineDB()
  const tx = db.transaction('sync_queue', 'readwrite')
  const store = tx.objectStore('sync_queue')
  store.delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}