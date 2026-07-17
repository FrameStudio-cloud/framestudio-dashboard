const DB_NAME = 'FrameStudioSync'
const DB_VERSION = 1
const STORE_NAME = 'mutationQueue'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('table', 'table', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const SyncManager = {
  async queue(mutation) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.add({
        ...mutation,
        status: 'pending',
        createdAt: new Date().toISOString(),
        retries: 0,
      })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async getPending() {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('status')
      const range = IDBKeyRange.only('pending')
      const results = []
      index.openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      tx.onerror = () => reject(tx.error)
    })
  },

  async markComplete(id) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async incrementRetry(id) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const get = store.get(id)
      get.onsuccess = () => {
        const entry = get.result
        if (entry) {
          entry.retries = (entry.retries || 0) + 1
          if (entry.retries >= 10) entry.status = 'failed'
          store.put(entry)
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async getQueueSize() {
    const pending = await this.getPending()
    return pending.length
  },

  async clearAll() {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async getQueueByTable(table) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('table')
      const range = IDBKeyRange.only(table)
      const results = []
      index.openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      tx.onerror = () => reject(tx.error)
    })
  },
}

export async function drainSyncQueue() {
  if (!navigator.onLine) return { drained: 0, failed: 0 }

  const pending = await SyncManager.getPending()
  let drained = 0
  let failed = 0

  for (const item of pending) {
    try {
      const response = await fetch(item.url, {
        method: item.method || 'POST',
        headers: { 'Content-Type': 'application/json', ...item.headers },
        body: item.body ? JSON.stringify(item.body) : undefined,
      })
      if (response.ok) {
        await SyncManager.markComplete(item.id)
        drained++
      } else {
        await SyncManager.incrementRetry(item.id)
        failed++
      }
    } catch {
      await SyncManager.incrementRetry(item.id)
      failed++
      break
    }
  }

  return { drained, failed }
}
