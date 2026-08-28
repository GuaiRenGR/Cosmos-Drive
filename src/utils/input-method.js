import globalModule from 'global'

let managerPromise = null
let manager = null
let bound = false
let active = null

function normalizeUuid(value) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') return String(value.uuid || value.id || value.sessionId || '')
  return ''
}

function normalizeText(value) {
  if (value && typeof value === 'object') {
    if (typeof value.value === 'string') return value.value
    if (typeof value.text === 'string') return value.text
  }
  return typeof value === 'string' ? value : ''
}

function normalizeResult(value) {
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch (error) { return { text: value, editConfirmed: true } }
  }
  if (!value || typeof value !== 'object') return {}
  const nested = value.jsonData !== undefined ? value.jsonData : value.data !== undefined ? value.data : value.result
  if (nested !== undefined && nested !== value) return Object.assign({}, value, normalizeResult(nested))
  return value
}

function bindFinished(instance) {
  if (!instance || bound || !instance.textEditFinished || typeof instance.textEditFinished.on !== 'function') return
  instance.textEditFinished.on(finished)
  bound = true
}

function finished(uuid, value) {
  let eventUuid = normalizeUuid(uuid)
  let eventValue = value
  if (value === undefined && uuid && typeof uuid === 'object') {
    eventValue = uuid
    eventUuid = normalizeUuid(uuid.uuid || uuid.id || uuid.sessionId)
  }
  if (!active || !eventUuid || eventUuid !== active.uuid) return
  const session = active
  const result = normalizeResult(eventValue)
  const confirmed = result && (result.editConfirmed === true || result.confirmed === true || result.confirm === true)
  active = null
  try { if (manager && session.uuid) manager.closeTextEdit(session.uuid) } catch (error) {}
  if (confirmed && session.onFinished) session.onFinished(normalizeText(result), result)
}

async function getManager() {
  if (manager) {
    bindFinished(manager)
    return manager
  }
  if (!managerPromise) {
    managerPromise = Promise.resolve().then(() => {
      const loaded = globalModule
      const Global = loaded && (loaded.Global || (loaded.default && loaded.default.Global) || loaded.default || loaded)
      if (typeof Global !== 'function') return null
      try { manager = new Global() } catch (error) { return null }
      bindFinished(manager)
      return manager
    }).catch(() => null)
  }
  return managerPromise
}

export async function initInputMethod() {
  const inputManager = await getManager()
  return !!(inputManager && typeof inputManager.startTextEdit === 'function' && bound)
}

export async function startTextEdit(config, onFinished) {
  const inputManager = await getManager()
  if (!inputManager || typeof inputManager.startTextEdit !== 'function' || !bound) return ''
  closeTextEdit()
  let uuid
  try { uuid = normalizeUuid(inputManager.startTextEdit(JSON.stringify(config))) } catch (error) { return '' }
  if (!uuid) return ''
  active = { uuid, onFinished }
  return uuid
}

export function closeTextEdit() {
  if (!active) return
  const uuid = active.uuid
  active = null
  try { if (manager && typeof manager.closeTextEdit === 'function') manager.closeTextEdit(uuid) } catch (error) {}
}

export function releaseInputMethod() {
  closeTextEdit()
  if (bound && manager && manager.textEditFinished && typeof manager.textEditFinished.off === 'function') {
    manager.textEditFinished.off(finished)
    bound = false
  }
}
