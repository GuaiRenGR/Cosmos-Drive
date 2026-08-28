// 把原生 storage jsapi 包成单例类，便于在页面里复用。
// 真机：const s = Storage.getInstance();
import storage from "storage";

export class Storage {
  static _ins = null;
  static getInstance() {
    if (!Storage._ins) Storage._ins = new Storage();
    return Storage._ins;
  }

  // app KV，失败 throw（用 try/catch）
  async get(key) { return await storage.getStorage(key); }
  async set(key, val) { return await storage.setStorage(key, val); }   // 0 成功
  async keys() { return await storage.getStorageKeys(); }
  async remove(key) { return await storage.removeStorage(key); }       // 0
  async clear() { return await storage.clearStorage(); }              // 0
}

export default Storage;