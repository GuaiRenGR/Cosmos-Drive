import http from 'http'
import { start as startCore, status as coreStatus, ensureConfig as ensureConfigCore } from 'cosmos_drive'
const BASE = 'http://127.0.0.1:18765'
export function isNativeAvailable() { return typeof startCore === 'function' && typeof coreStatus === 'function' }
export function ensureConfig() {
  if (!isNativeAvailable()) throw new Error('cosmos_drive JSAPI 未安装')
  if (typeof ensureConfigCore !== 'function') throw new Error('cosmos_drive JSAPI 版本不支持配置初始化')
  return ensureConfigCore() === true
}
let startPromise = null
async function ensureStarted() {
  if (!isNativeAvailable()) throw new Error('cosmos_drive JSAPI 未安装')
  if (!startPromise) startPromise = (async () => {
    ensureConfig()
    await startCore()
    let lastError
    for (let attempt = 0; attempt < 8; attempt++) {
      try { await http.request({ url: BASE + '/health', method: 'GET', timeout: 1000 }); return }
      catch (error) {
        lastError = error
        if (attempt < 7) await new Promise(resolve => setTimeout(resolve, 120))
      }
    }
    throw lastError || new Error('核心启动后未响应')
  })()
  try { await startPromise } catch (error) { startPromise = null; throw error }
}
export async function request(config, operation, remotePath, localPath, destination) {
  await ensureStarted()
  const response = await http.request({ url: BASE + '/request', method: 'POST', headers: { 'Content-Type': 'application/json' }, data: JSON.stringify({ config, operation, remotePath: remotePath || '/', localPath: localPath || '', destination: destination || '' }), timeout: 30000 })
  const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
  if (!body || body.ok === false) throw new Error((body && body.error) || 'remote operation failed')
  return body.data
}
export async function saveConfig(config) {
  await ensureStarted()
  const response = await http.request({ url: BASE + '/profiles', method: 'POST', headers: { 'Content-Type': 'application/json' }, data: JSON.stringify(config), timeout: 10000 })
  const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
  if (!body || body.ok === false) throw new Error((body && body.error) || 'save failed')
  return body.data
}

export async function listProfiles() {
  await ensureStarted()
  const response = await http.request({ url: BASE + '/profiles', method: 'GET', timeout: 10000 })
  const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
  if (!body || body.ok === false) throw new Error((body && body.error) || '读取连接配置失败')
  return body.data || []
}
