const STORAGE_KEY = 'cosmos-drive.state'
const storageModule = import('storage').catch(() => null)
const memoryStore = Object.create(null)

async function getBackend() {
  const loaded = await storageModule
  return loaded && (loaded.default || loaded)
}

export async function loadUiState() {
  let raw = null
  try {
    const backend = await getBackend()
    if (backend && typeof backend.getStorage === 'function') {
      raw = await backend.getStorage(STORAGE_KEY)
    } else {
      raw = memoryStore[STORAGE_KEY] || null
    }
  } catch (error) {
    raw = memoryStore[STORAGE_KEY] || null
  }
  if (typeof raw !== 'string' || raw.length === 0) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

export async function saveUiState(state) {
  const raw = JSON.stringify(state)
  try {
    const backend = await getBackend()
    if (backend && typeof backend.setStorage === 'function') {
      await backend.setStorage(STORAGE_KEY, raw)
    } else {
      memoryStore[STORAGE_KEY] = raw
    }
    return true
  } catch (error) {
    memoryStore[STORAGE_KEY] = raw
    return false
  }
}
