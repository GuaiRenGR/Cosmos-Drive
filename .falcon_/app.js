import fs from 'fs';
import http from 'http';
import { start, status, ensureConfig as ensureConfig$1 } from 'cosmos_drive';
import globalModule from 'global';

function _collectFalconEventIds(name, callback)
{
  const evtList = $falcon.eventMap[name];
  if (evtList) {
    if (callback) {
      const index = evtList.findIndex(item => item.callback === callback || item.id === callback);
      if (index !== -1) {
        return [evtList[index].id]
      }
    } else {
      return evtList.map((item) => item.id)
    }
  }
  return []
}

class PageRes extends $falcon.Page {
  constructor() {
    super();
    this.falconOnTokens = [];  // [[token, name], ...]
    this.timeoutTokens = new Set();  // [token, ...]
    this.intervalTokens = new Set();  // [token, ...]
  }

  on(name, callback) {
    const token = $falcon.on(name, callback);
    this.falconOnTokens.push([token, name]);
    return token
  }

  off(name, callback) {
    const falconOnTokens2 = [];
    let idsWillRemoved = _collectFalconEventIds(name, callback);
    idsWillRemoved = new Set(idsWillRemoved);
    for (let [token, name] of this.falconOnTokens) {
      if (idsWillRemoved.has(token)) {
        continue
      }
      falconOnTokens2.push([token, name]);
    }
    this.falconOnTokens = falconOnTokens2;

    $falcon.off(name, callback);
  }
  trigger(name, options) {
    $falcon.trigger(name, options);
  }
  setTimeout(func, ms) {
    const token = setTimeout(() => {
      this.timeoutTokens.delete(token);
      func();
    }, ms);
    this.timeoutTokens.add(token);
    return token
  }
  setInterval(func, ms) {
    const token = setInterval(func, ms);
    this.intervalTokens.add(token);
    return token
  }
  clearTimeout(token) {
    this.timeoutTokens.delete(token);
    clearTimeout(token);
  }
  clearInterval(token) {
    this.intervalTokens.delete(token);
    clearInterval(token);
  }
  release() {
    for (let [token, name] of this.falconOnTokens) {
      $falcon.off(name, token);
    }
    this.falconOnTokens.length = 0;
    for (let token of this.timeoutTokens) {
      clearTimeout(token);
    }
    this.timeoutTokens.clear();
    for (let token of this.intervalTokens) {
      clearInterval(token);
    }
    this.intervalTokens.clear();
  }
}

class BasePage extends PageRes {
  /**
   * 构造函数,页面生命周期内只执行一次
   */
  constructor() {
    super();
  }

  // some Util
  async sleep(ms) {
    return new Promise((resolve) => {
      this.setTimeout(() => {
        resolve();
      }, ms);
    })
  }


  /**
   * 页面生命周期:首次启动
   * @param Object options 页面启动参数
   */
  onLoad(options) {
    super.onLoad(options);
    this.options = options;
  }

  /**
   * 页面生命周期:页面重新进入
   * 其他应用或者系统通过$falcon.navTo()方法重新启动页面.可以通过这个回调拿到新启动的参数
   * @param Object options 重新启动参数
   */
  onNewOptions(options) {
    super.onNewOptions(options);
    this.options = options;
  }

  /**
   * 页面生命周期:页面进入前台
   */
  onShow() {
    super.onShow();

    //onshow以后组件才创建,可以调用组件的方法
    if (this.$root.onShow) {
      this.$root.onShow();
    }
  }

  /**
   * 页面生命周期:页面进入后台
   */
  onHide() {
    super.onHide();
    if (this.$root.onHide) {
      this.$root.onHide();
    }
  }

  /**
   * 页面生命周期:页面卸载
   */
  onUnload() {
    try {
      super.onUnload();
      if (this.$root.onUnload) {
        this.$root.onUnload();
      }
    } finally {
      if (this.release) {
        // to call PageRes release method
        this.release();
      }
    }
  }

  beforeVueInstantiate(Vue) {
    try {
      Vue.prototype.$workspace = globalThis.$workspace;
      Vue.prototype.$appid = globalThis.$appid;
    } catch (err) {
      console.log(err);
    }
  }
}

class App extends $falcon.App {
  /**
   * 构造函数,应用生命周期内只构造一次
   */
  constructor() {
    super();
  }

  /**
   * 应用生命周期:应用启动. 初始化完成时回调,全局只触发一次.
   * @param {Object} options 启动参数
   */
  onLaunch(options) {
    super.onLaunch(options);
    // 屏幕分辨率适配机制:
    // 当 viewPort 设置750时, 所有元素尺寸可按照设计稿为 750px 宽度标准编写,
    // 最后系统会动态计算屏幕实际尺寸并显示.
    this.setViewPort(1020);

    // 设置页面基类,应用全局的$falcon.Page将被替换成此处指定的BasePage.
    // 继承自$falcon.Page的页面将继承自改基类.
    // 如页面未指定js,直接指向.vue文件,页面创建时会默认创建该类的实例
    $falcon.useDefaultBasePageClass(BasePage);
  }

  /**
   * 应用生命周期,应用启动或应用从后台切换到前台时触发
   */
  onShow() {
    super.onShow();
  }

  /**
   * 应用生命周期:应用退出前或者应用从前台切换到后台时触发
   */
  onHide() {
    super.onHide();
  }

  /**
   * 应用生命周期:应用销毁前触发
   */
  onDestroy() {
    super.onDestroy();
  }
}

try {
  globalThis['window'] = {
    requestAnimationFrame,
    cancelAnimationFrame
  };
} catch (err) {
  console.log(err);
}

try {
  globalThis['process'] = {
    env: {
      NODE_ENV: 'production'
    }
  };
} catch (err) {
  console.log(err);
}

var App$1 = App;

const BASE = 'http://127.0.0.1:18765';
function isNativeAvailable() { return typeof start === 'function' && typeof status === 'function' }
function ensureConfig() {
  if (!isNativeAvailable()) throw new Error('cosmos_drive JSAPI 未安装')
  if (typeof ensureConfig$1 !== 'function') throw new Error('cosmos_drive JSAPI 版本不支持配置初始化')
  return ensureConfig$1() === true
}
let startPromise = null;
async function ensureStarted() {
  if (!isNativeAvailable()) throw new Error('cosmos_drive JSAPI 未安装')
  if (!startPromise) startPromise = (async () => {
    ensureConfig();
    await start();
    let lastError;
    for (let attempt = 0; attempt < 8; attempt++) {
      try { await http.request({ url: BASE + '/health', method: 'GET', timeout: 1000 }); return }
      catch (error) {
        lastError = error;
        if (attempt < 7) await new Promise(resolve => setTimeout(resolve, 120));
      }
    }
    throw lastError || new Error('核心启动后未响应')
  })();
  try { await startPromise; } catch (error) { startPromise = null; throw error }
}
async function request(config, operation, remotePath, localPath, destination) {
  await ensureStarted();
  const response = await http.request({ url: BASE + '/request', method: 'POST', headers: { 'Content-Type': 'application/json' }, data: JSON.stringify({ config, operation, remotePath: remotePath || '/', localPath: localPath || '', destination: destination || '' }), timeout: 30000 });
  const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
  if (!body || body.ok === false) throw new Error((body && body.error) || 'remote operation failed')
  return body.data
}
async function saveConfig(config) {
  await ensureStarted();
  const response = await http.request({ url: BASE + '/profiles', method: 'POST', headers: { 'Content-Type': 'application/json' }, data: JSON.stringify(config), timeout: 10000 });
  const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
  if (!body || body.ok === false) throw new Error((body && body.error) || 'save failed')
  return body.data
}

async function listProfiles() {
  await ensureStarted();
  const response = await http.request({ url: BASE + '/profiles', method: 'GET', timeout: 10000 });
  const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
  if (!body || body.ok === false) throw new Error((body && body.error) || '读取连接配置失败')
  return body.data || []
}

const STORAGE_KEY = 'cosmos-drive.state';
const storageModule = import('storage').catch(() => null);
const memoryStore = Object.create(null);

async function getBackend() {
  const loaded = await storageModule;
  return loaded && (loaded.default || loaded)
}

async function loadUiState() {
  let raw = null;
  try {
    const backend = await getBackend();
    if (backend && typeof backend.getStorage === 'function') {
      raw = await backend.getStorage(STORAGE_KEY);
    } else {
      raw = memoryStore[STORAGE_KEY] || null;
    }
  } catch (error) {
    raw = memoryStore[STORAGE_KEY] || null;
  }
  if (typeof raw !== 'string' || raw.length === 0) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

async function saveUiState(state) {
  const raw = JSON.stringify(state);
  try {
    const backend = await getBackend();
    if (backend && typeof backend.setStorage === 'function') {
      await backend.setStorage(STORAGE_KEY, raw);
    } else {
      memoryStore[STORAGE_KEY] = raw;
    }
    return true
  } catch (error) {
    memoryStore[STORAGE_KEY] = raw;
    return false
  }
}

let managerPromise = null;
let manager = null;
let bound = false;
let active = null;

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
  const nested = value.jsonData !== undefined ? value.jsonData : value.data !== undefined ? value.data : value.result;
  if (nested !== undefined && nested !== value) return Object.assign({}, value, normalizeResult(nested))
  return value
}

function bindFinished(instance) {
  if (!instance || bound || !instance.textEditFinished || typeof instance.textEditFinished.on !== 'function') return
  instance.textEditFinished.on(finished);
  bound = true;
}

function finished(uuid, value) {
  let eventUuid = normalizeUuid(uuid);
  let eventValue = value;
  if (value === undefined && uuid && typeof uuid === 'object') {
    eventValue = uuid;
    eventUuid = normalizeUuid(uuid.uuid || uuid.id || uuid.sessionId);
  }
  if (!active || !eventUuid || eventUuid !== active.uuid) return
  const session = active;
  const result = normalizeResult(eventValue);
  const confirmed = result && (result.editConfirmed === true || result.confirmed === true || result.confirm === true);
  active = null;
  try { if (manager && session.uuid) manager.closeTextEdit(session.uuid); } catch (error) {}
  if (confirmed && session.onFinished) session.onFinished(normalizeText(result), result);
}

async function getManager() {
  if (manager) {
    bindFinished(manager);
    return manager
  }
  if (!managerPromise) {
    managerPromise = Promise.resolve().then(() => {
      const loaded = globalModule;
      const Global = loaded && (loaded.Global || (loaded.default && loaded.default.Global) || loaded.default || loaded);
      if (typeof Global !== 'function') return null
      try { manager = new Global(); } catch (error) { return null }
      bindFinished(manager);
      return manager
    }).catch(() => null);
  }
  return managerPromise
}

async function initInputMethod() {
  const inputManager = await getManager();
  return !!(inputManager && typeof inputManager.startTextEdit === 'function' && bound)
}

async function startTextEdit(config, onFinished) {
  const inputManager = await getManager();
  if (!inputManager || typeof inputManager.startTextEdit !== 'function' || !bound) return ''
  closeTextEdit();
  let uuid;
  try { uuid = normalizeUuid(inputManager.startTextEdit(JSON.stringify(config))); } catch (error) { return '' }
  if (!uuid) return ''
  active = { uuid, onFinished };
  return uuid
}

function closeTextEdit() {
  if (!active) return
  const uuid = active.uuid;
  active = null;
  try { if (manager && typeof manager.closeTextEdit === 'function') manager.closeTextEdit(uuid); } catch (error) {}
}

function releaseInputMethod() {
  closeTextEdit();
  if (bound && manager && manager.textEditFinished && typeof manager.textEditFinished.off === 'function') {
    manager.textEditFinished.off(finished);
    bound = false;
  }
}

//

const DEFAULT_UI_STATE = { view: 'files', activeConnectionId: '', sortAsc: true, wifiOnly: true };
const LOCAL_ROOT = '/userdisk/Favorite';
const DOWNLOAD_ROOT = '/userdisk/Favorite/cosmos/drive/downloads';

var script = {
  name: 'index',
  data() {
    return {
      view: DEFAULT_UI_STATE.view,
      pageTitle: '文件浏览',
      activeConnectionId: DEFAULT_UI_STATE.activeConnectionId,
      currentPath: '/',
      query: '',
      sortAsc: DEFAULT_UI_STATE.sortAsc,
      connectionMenu: false,
      drawerOpen: false,
      localBrowserOpen: false,
      localRoot: LOCAL_ROOT,
      localPath: LOCAL_ROOT,
      localFiles: [],
      localLoading: false,
      selectedLocalFile: null,
      showAbout: false,
      fileMenu: null,
      toast: '',
      wifiOnly: DEFAULT_UI_STATE.wifiOnly,
      nativeAvailable: false,
      inputMethodAvailable: false,
      inputMethodReady: false,
      inputField: '',
      form: { type: 'WebDAV', name: '', host: '', user: '', password: '' },
      connections: [],
      files: [],
      transfers: []
    }
  },
  async created() {
    this.nativeAvailable = isNativeAvailable();
    await this.restoreUiState();
    if (this.nativeAvailable) {
      try { ensureConfig(); } catch (e) { this.showToast(e.message || '初始化配置文件失败'); }
      await this.loadProfiles();
    }
  },
  async mounted() {
    this.inputMethodAvailable = await initInputMethod();
    this.inputMethodReady = true;
  },
  beforeDestroy() {
    closeTextEdit();
    releaseInputMethod();
  },
  computed: {
    activeConnection() {
      return this.connections.find(item => item.id === this.activeConnectionId) || { name: '未连接', type: '', host: '', online: false, used: '-', capacity: '-' }
    },
    filteredFiles() {
      const q = this.query.trim().toLowerCase();
      return this.files.filter(file => !q || file.name.toLowerCase().indexOf(q) !== -1).sort((a, b) => a.folder !== b.folder ? (a.folder ? -1 : 1) : (this.sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))
    },
    transferCount() { return this.transfers.length }
  },
  methods: {
    async restoreUiState() {
      const state = await loadUiState();
      if (!state) {
        await saveUiState(DEFAULT_UI_STATE);
        return
      }
      if (typeof state.view === 'string') this.view = state.view;
      if (typeof state.activeConnectionId === 'string') this.activeConnectionId = state.activeConnectionId;
      if (typeof state.sortAsc === 'boolean') this.sortAsc = state.sortAsc;
      if (typeof state.wifiOnly === 'boolean') this.wifiOnly = state.wifiOnly;
      this.pageTitle = this.view === 'files' ? '文件浏览' : this.view === 'transfers' ? '传输队列' : '设备设置';
    },
    async persistUiState() {
      await saveUiState({ view: this.view, activeConnectionId: this.activeConnectionId, sortAsc: this.sortAsc, wifiOnly: this.wifiOnly });
    },
    async loadProfiles() {
      try {
        const preferred = this.activeConnectionId;
        const profiles = await listProfiles();
        this.connections = profiles.map((item, index) => ({ ...item, id: item.name || String(index), online: false, used: '-', capacity: '-' }));
        if (this.connections.length) {
          this.activeConnectionId = this.connections.some(item => item.id === preferred) ? preferred : this.connections[0].id;
          await this.persistUiState();
          await this.loadFiles();
        } else {
          this.activeConnectionId = '';
          await this.persistUiState();
        }
      } catch (e) { this.showToast(e.message || '读取连接配置失败'); }
    },
    async loadFiles() {
      if (!this.connections.length) return
      try {
        const config = this.activeConnection.name ? '@' + this.activeConnection.name : this.activeConnection;
        const items = await request(config, 'list', this.currentPath, '');
        this.files = (items || []).map(item => ({ name: item.name, rawName: item.rawName || item.name, folder: !!item.folder, kind: item.folder ? 'folder' : 'text', size: item.size ? String(item.size) : '', date: item.modTime || '' }));
      } catch (e) { this.showToast(e.message || '连接失败'); }
    },
    async setView(view) { this.view = view; this.pageTitle = view === 'files' ? '文件浏览' : view === 'transfers' ? '传输队列' : '设备设置'; await this.persistUiState(); },
    async selectConnection(id) { this.activeConnectionId = id; this.connectionMenu = false; this.currentPath = '/'; await this.persistUiState(); await this.loadFiles(); },
    toggleConnectionMenu() { this.connectionMenu = !this.connectionMenu; },
    refreshFiles() { this.loadFiles(); },
    async toggleSort() { this.sortAsc = !this.sortAsc; await this.persistUiState(); },
    goUp() {
      if (this.currentPath === '/') return
      const parts = this.currentPath.split('/').filter(Boolean);
      parts.pop();
      this.currentPath = parts.length ? '/' + parts.join('/') : '/';
      this.loadFiles();
    },
    openFile(file) { if (file.folder) { this.currentPath = (this.currentPath === '/' ? '' : this.currentPath) + '/' + (file.rawName || file.name); this.loadFiles(); } },
    openFileMenu(file) { this.fileMenu = file; },
    async downloadFile() {
      const file = this.fileMenu;
      this.fileMenu = null;
      if (!file || file.folder) return this.showToast('文件夹暂不支持下载')
      try {
        if (!(await fs.exists(DOWNLOAD_ROOT))) await fs.mkdir(DOWNLOAD_ROOT);
        const localName = this.localFileName(file.name);
        if (!localName) return this.showToast('文件名无效')
        await request(this.activeConfig(), 'download', this.remoteFilePath(file.rawName || file.name), DOWNLOAD_ROOT + '/' + localName);
        this.showToast('已下载到 ' + DOWNLOAD_ROOT);
      } catch (e) { this.showToast(e.message || '下载失败'); }
    },
    renameFile() { this.fileMenu = null; this.showToast('重命名需要本地输入'); },
    deleteFile() { this.fileMenu = null; this.showToast('删除请通过核心接口'); },
    async openLocalBrowser() {
      this.localBrowserOpen = true;
      await this.loadLocalFiles();
    },
    closeLocalBrowser() { this.localBrowserOpen = false; },
    localJoin(base, name) { return (base === '/' ? '' : base.replace(/\/$/, '')) + '/' + name },
    async loadLocalFiles() {
      this.localLoading = true;
      try {
        const entries = await fs.readdir(this.localPath, { withFileTypes: true });
        this.localFiles = entries.map(entry => ({ name: entry.name, folder: entry.isDirectory(), path: this.localJoin(this.localPath, entry.name) })).sort((a, b) => a.folder !== b.folder ? (a.folder ? -1 : 1) : a.name.localeCompare(b.name));
      } catch (e) {
        this.localFiles = [];
        this.showToast(e.message || '读取本地目录失败');
      } finally { this.localLoading = false; }
    },
    async openLocalEntry(entry) {
      if (entry.folder) {
        this.localPath = entry.path;
        await this.loadLocalFiles();
        return
      }
      this.selectedLocalFile = entry;
      this.closeLocalBrowser();
    },
    async goLocalUp() {
      if (this.localPath === this.localRoot) return
      const parts = this.localPath.split('/').filter(Boolean);
      parts.pop();
      this.localPath = '/' + parts.join('/');
      if (!this.localPath) this.localPath = this.localRoot;
      await this.loadLocalFiles();
    },
    activeConfig() { return this.activeConnection.name ? '@' + this.activeConnection.name : this.activeConnection },
    remoteFilePath(name) { return (this.currentPath === '/' ? '' : this.currentPath) + '/' + name },
    localFileName(name) { return String(name || '').replace(/[\\/]/g, '_').replace(/^\.+$/, '_') },
    async startUpload() {
      const local = this.selectedLocalFile;
      if (!local) return this.openLocalBrowser()
      try {
        await request(this.activeConfig(), 'upload', this.remoteFilePath(local.name), local.path);
        this.selectedLocalFile = null;
        await this.loadFiles();
        this.showToast('上传完成');
      } catch (e) { this.showToast(e.message || '上传失败'); }
    },
    openConnectionDrawer() { this.connectionMenu = false; this.drawerOpen = true; },
    closeConnectionDrawer() { this.drawerOpen = false; this.inputField = ''; closeTextEdit(); },
    async focusInput(field) {
      if (!this.inputMethodReady || !this.inputMethodAvailable) return
      this.inputField = field;
      const current = this.form[field] || '';
      const uuid = await startTextEdit({ text: current, placeholder: field === 'name' ? '连接名称' : field === 'host' ? '服务器地址' : field === 'user' ? '用户名' : '密码', maxlength: field === 'host' ? 192 : 96, inputType: field === 'password' ? 'password' : 'text', autofocus: true, showCursor: true, multiLinesEditVisible: false, enterButtonText: '完成' }, (text) => {
        if (this.inputField === field) this.form[field] = text;
      });
      if (!uuid) this.inputMethodAvailable = false;
    },
    onInput(field, event) {
      let value = event;
      if (value && typeof value === 'object') {
        if (typeof value.value === 'string') value = value.value;
        else if (value.target && typeof value.target.value === 'string') value = value.target.value;
        else if (value.target && value.target.attr && typeof value.target.attr.value === 'string') value = value.target.attr.value;
      }
      if (typeof value === 'string') this.form[field] = value;
    },
    async saveConnection() {
      if (!this.form.name || !this.form.host) return this.showToast('请填写名称和服务器地址')
      try {
        const savedName = this.form.name;
        await saveConfig({ ...this.form, basePath: '/', tls: this.form.type === 'WebDAV' && /^https:\/\//.test(this.form.host) });
        this.activeConnectionId = savedName;
        this.closeConnectionDrawer();
        this.form = { type: 'WebDAV', name: '', host: '', user: '', password: '' };
        await this.loadProfiles();
        this.showToast('连接已保存');
      } catch (e) { this.showToast(e.message || '保存失败'); }
    },
    showToast(message) { this.toast = message; this.$page.setTimeout(() => { this.toast = ''; }, 1800); },
    fileIcon(kind) { return { text: 'T', archive: 'Z', pdf: 'P', code: '{' }[kind] || '·' },
    noop() {}
  }
};

var style_0 = { "_": {
  "text": {
    "fontSize": "16px",
    "color": "#34495e"
  },
  "wrapper": {
    "justifyContent": "center",
    "alignItems": "center"
  },
  "btn": {
    "marginTop": "10px",
    "marginRight": "10px",
    "marginBottom": "10px",
    "marginLeft": "10px",
    "paddingTop": 0,
    "paddingRight": "20px",
    "paddingBottom": 0,
    "paddingLeft": "20px",
    "fontSize": "24px",
    "color": "#727272",
    "borderRadius": "6px",
    "boxShadow:active": "0px 0px 5px #646566"
  },
  "screen": {
    "position": "fixed",
    "left": 0,
    "top": 0,
    "width": "100vw",
    "height": "100vh",
    "flexDirection": "row",
    "backgroundColor": "#080a0c",
    "color": "#e3e3e3",
    "overflow": "hidden"
  },
  "rail": {
    "width": "39vh",
    "minWidth": "39vh",
    "height": "100vh",
    "overflow": "hidden",
    "paddingTop": "7vh",
    "paddingLeft": "5vh",
    "paddingRight": "12vh",
    "paddingBottom": "7vh",
    "backgroundColor": "#080a0c",
    "alignItems": "center",
    "justifyContent": "space-between"
  },
  "brand-mark": {
    "width": "16vh",
    "height": "16vh",
    "borderRadius": "5vh",
    "backgroundColor": "#004a77",
    "alignItems": "center",
    "justifyContent": "center",
    "marginBottom": "3vh"
  },
  "brand-glyph": {
    "fontSize": "12vh",
    "color": "#c2e7ff",
    "fontWeight": "bold"
  },
  "rail-button": {
    "position": "relative",
    "width": "20vh",
    "height": "20vh",
    "borderRadius": "7vh",
    "alignItems": "center",
    "justifyContent": "center",
    "marginBottom": 0,
    "opacity:active": 0.6,
    "backgroundColor": "#1a1b1f"
  },
  "rail-active": {
    "backgroundColor": "#004a77"
  },
  "rail-icon": {
    "fontSize": "12vh",
    "color": "#b8bbb9"
  },
  "rail-icon-active": {
    "color": "#004a77"
  },
  "rail-label": {
    "fontSize": "7vh",
    "color": "#b8bbb9"
  },
  "rail-label-active": {
    "color": "#e3e3e3"
  },
  "rail-badge": {
    "position": "absolute",
    "right": "-2vh",
    "top": "-2vh",
    "fontSize": "7vh",
    "color": "#c2e7ff",
    "backgroundColor": "#004a77",
    "borderRadius": "4vh",
    "paddingLeft": "2vh",
    "paddingRight": "2vh"
  },
  "rail-spacer": {
    "flex": 1
  },
  "workspace": {
    "flex": 1,
    "height": "96vh",
    "overflow": "hidden",
    "paddingTop": "2vh",
    "paddingRight": "3vh",
    "paddingBottom": "2vh",
    "paddingLeft": "3vh",
    "backgroundColor": "#080a0c"
  },
  "topbar": {
    "height": "18vh",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "eyebrow": {
    "fontSize": "7vh",
    "color": "#b8bbb9"
  },
  "page-title": {
    "fontSize": "10vh",
    "color": "#e3e3e3",
    "fontWeight": "bold"
  },
  "top-actions": {
    "marginLeft": "auto",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "connection-pill": {
    "height": "16vh",
    "minWidth": "65vh",
    "paddingLeft": "4vh",
    "paddingRight": "4vh",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "borderColor": "#8e918f",
    "borderRadius": "6vh",
    "backgroundColor": "#1a1b1f",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "status-dot": {
    "width": "4vh",
    "height": "4vh",
    "borderRadius": "2vh",
    "backgroundColor": "#b8bbb9",
    "marginRight": "3vh"
  },
  "online": {
    "backgroundColor": "#004a77"
  },
  "offline": {
    "backgroundColor": "#b8bbb9"
  },
  "connection-name": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "connection-type": {
    "fontSize": "8vh",
    "color": "#b8bbb9",
    "marginLeft": "3vh"
  },
  "chevron": {
    "fontSize": "10vh",
    "color": "#b8bbb9",
    "marginLeft": "auto"
  },
  "icon-action": {
    "width": "18vh",
    "height": "18vh",
    "marginLeft": "3vh",
    "borderRadius": "6vh",
    "backgroundColor": "#1a1b1f",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "borderColor": "#8e918f",
    "alignItems": "center",
    "justifyContent": "center",
    "opacity:active:active": 0.6
  },
  "icon-action-text": {
    "fontSize": "12vh",
    "color": "#c2e7ff"
  },
  "files-view": {
    "flex": 1,
    "height": 0,
    "overflow": "hidden"
  },
  "content-grid": {
    "flex": 1,
    "height": 0,
    "overflow": "hidden",
    "flexDirection": "row"
  },
  "connections-panel": {
    "width": "88vh",
    "minWidth": "88vh",
    "height": "100%",
    "backgroundColor": "#1a1b1f",
    "borderRadius": "6vh",
    "paddingTop": "4vh",
    "paddingRight": "4vh",
    "paddingBottom": "4vh",
    "paddingLeft": "4vh",
    "marginRight": "4vh"
  },
  "panel-head": {
    "height": "12vh",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "panel-title": {
    "fontSize": "10vh",
    "color": "#e3e3e3",
    "fontWeight": "bold"
  },
  "panel-count": {
    "fontSize": "8vh",
    "color": "#b8bbb9",
    "marginLeft": "3vh"
  },
  "connection-scroller": {
    "flex": 1,
    "height": 0
  },
  "connection-row": {
    "height": "18vh",
    "borderRadius": "5vh",
    "paddingLeft": "3vh",
    "paddingRight": "3vh",
    "flexDirection": "row",
    "alignItems": "center",
    "marginBottom": "2vh",
    "opacity:active:active:active": 0.6
  },
  "connection-selected": {
    "backgroundColor": "#24252a"
  },
  "connection-icon": {
    "width": "13vh",
    "height": "13vh",
    "borderRadius": "4vh",
    "alignItems": "center",
    "justifyContent": "center",
    "backgroundColor": "#2d4b49",
    "marginRight": "3vh"
  },
  "ftp": {
    "backgroundColor": "#4b3d2b"
  },
  "connection-icon-text": {
    "fontSize": "9vh",
    "color": "#c2e7ff",
    "fontWeight": "bold"
  },
  "ftp-text": {
    "color": "#c2e7ff"
  },
  "connection-meta": {
    "flex": 1
  },
  "row-name": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "row-sub": {
    "fontSize": "8vh",
    "color": "#b8bbb9"
  },
  "row-status": {
    "fontSize": "8vh",
    "color": "#b8bbb9"
  },
  "online-text": {
    "color": "#c2e7ff"
  },
  "new-connection": {
    "height": "12vh",
    "borderTopWidth": "1px",
    "borderTopStyle": "solid",
    "borderTopColor": "#8e918f",
    "flexDirection": "row",
    "alignItems": "center",
    "color": "#004a77",
    "fontSize": "8vh",
    "opacity:active:active:active:active": 0.6
  },
  "new-plus": {
    "fontSize": "12vh",
    "marginRight": "2vh",
    "color": "#c2e7ff"
  },
  "file-panel": {
    "flex": 1,
    "height": "100%"
  },
  "pathbar": {
    "height": "12vh",
    "flexDirection": "row",
    "alignItems": "center",
    "borderBottomWidth": "1px",
    "borderBottomStyle": "solid",
    "borderBottomColor": "#8e918f"
  },
  "path-back": {
    "width": "14vh",
    "height": "14vh",
    "borderRadius": "5vh",
    "backgroundColor": "#1a1b1f",
    "alignItems": "center",
    "justifyContent": "center",
    "marginRight": "3vh"
  },
  "path-back-text": {
    "fontSize": "10vh",
    "color": "#b8bbb9"
  },
  "path-root": {
    "fontSize": "7vh",
    "color": "#b8bbb9"
  },
  "path-sep": {
    "fontSize": "7vh",
    "color": "#b8bbb9",
    "marginLeft": "2vh",
    "marginRight": "2vh"
  },
  "path-current": {
    "fontSize": "9vh",
    "color": "#b8bbb9"
  },
  "path-spacer": {
    "flex": 1
  },
  "search-box": {
    "width": "55vh",
    "height": "13vh",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "borderColor": "#8e918f",
    "borderRadius": "5vh",
    "backgroundColor": "#1a1b1f",
    "flexDirection": "row",
    "alignItems": "center",
    "paddingLeft": "3vh",
    "paddingRight": "3vh"
  },
  "search-icon": {
    "fontSize": "10vh",
    "color": "#b8bbb9",
    "marginRight": "2vh"
  },
  "search-input": {
    "flex": 1,
    "fontSize": "8vh",
    "color": "#e3e3e3",
    "backgroundColor": "rgba(0,0,0,0)",
    "borderWidth": 0
  },
  "sort-control": {
    "width": "18vh",
    "height": "13vh",
    "marginLeft": "3vh",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "borderColor": "#8e918f",
    "borderRadius": "5vh",
    "alignItems": "center",
    "justifyContent": "center",
    "color": "#b8bbb9",
    "fontSize": "7vh"
  },
  "file-toolbar": {
    "minHeight": 0,
    "height": "auto",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "toolbar-spacer": {
    "flex": 1
  },
  "toolbar-action": {
    "height": "14vh",
    "paddingLeft": "4vh",
    "paddingRight": "4vh",
    "borderRadius": "5vh",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "center",
    "color": "#b8bbb9",
    "fontSize": "9vh",
    "marginLeft": "3vh",
    "opacity:active:active:active:active:active": 0.6
  },
  "toolbar-primary": {
    "backgroundColor": "#004a77",
    "color": "#c2e7ff"
  },
  "upload-icon": {
    "fontSize": "12vh",
    "marginRight": "2vh",
    "color": "#c2e7ff"
  },
  "file-header": {
    "height": "10vh",
    "paddingLeft": "4vh",
    "paddingRight": "4vh",
    "flexDirection": "row",
    "alignItems": "center",
    "borderBottomWidth": "1px",
    "borderBottomStyle": "solid",
    "borderBottomColor": "#8e918f"
  },
  "file-header-text": {
    "fontSize": "7vh",
    "color": "#b8bbb9"
  },
  "file-col-name": {
    "flex": 1
  },
  "file-col-size": {
    "width": "32vh"
  },
  "file-col-date": {
    "width": "48vh"
  },
  "file-scroller": {
    "height": 0,
    "flex": 1,
    "paddingRight": "3vh"
  },
  "file-row": {
    "height": "18vh",
    "paddingLeft": "4vh",
    "paddingRight": "4vh",
    "flexDirection": "row",
    "alignItems": "center",
    "borderBottomWidth": "1px",
    "borderBottomStyle": "solid",
    "borderBottomColor": "#8e918f",
    "opacity:active:active:active:active:active:active:active:active:active:active": 0.6
  },
  "parent-row": {
    "color": "#b8bbb9"
  },
  "file-icon": {
    "width": "13vh",
    "height": "13vh",
    "borderRadius": "4vh",
    "marginRight": "3vh",
    "alignItems": "center",
    "justifyContent": "center",
    "textAlign": "center",
    "fontSize": "9vh",
    "color": "#b8bbb9",
    "backgroundColor": "#283430"
  },
  "folder": {
    "color": "#c2e7ff",
    "backgroundColor": "#403526"
  },
  "text-kind": {
    "color": "#004a77"
  },
  "archive-kind": {
    "color": "#d3a9ed"
  },
  "pdf-kind": {
    "color": "#f19090"
  },
  "code-kind": {
    "color": "#b6c5ff"
  },
  "file-name-wrap": {
    "flex": 1,
    "flexDirection": "row",
    "alignItems": "center"
  },
  "file-name": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "file-tag": {
    "marginLeft": "3vh",
    "paddingLeft": "2vh",
    "paddingRight": "2vh",
    "borderRadius": "3vh",
    "color": "#004a77",
    "backgroundColor": "#23413d",
    "fontSize": "6vh"
  },
  "file-size": {
    "width": "32vh",
    "color": "#b8bbb9",
    "fontSize": "9vh"
  },
  "file-date": {
    "width": "48vh",
    "color": "#b8bbb9",
    "fontSize": "8vh"
  },
  "more-action": {
    "width": "14vh",
    "height": "14vh",
    "alignItems": "center",
    "justifyContent": "center"
  },
  "more-text": {
    "fontSize": "10vh",
    "color": "#b8bbb9"
  },
  "empty-state": {
    "height": "30vh",
    "alignItems": "center",
    "justifyContent": "center"
  },
  "empty-icon": {
    "fontSize": "10vh",
    "color": "#8e918f"
  },
  "empty-state-text": {
    "fontSize": "12vh",
    "color": "#b8bbb9"
  },
  "statusbar": {
    "height": "8vh",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "sync-state": {
    "flexDirection": "row",
    "alignItems": "center",
    "fontSize": "7vh",
    "color": "#b8bbb9"
  },
  "sync-dot": {
    "marginRight": "2vh"
  },
  "status-time": {
    "fontSize": "7vh",
    "color": "#b8bbb9",
    "marginLeft": "4vh"
  },
  "storage-text": {
    "fontSize": "7vh",
    "color": "#b8bbb9",
    "marginLeft": "auto"
  },
  "connection-menu": {
    "position": "absolute",
    "top": "25vh",
    "right": "8vh",
    "width": "90vh",
    "backgroundColor": "#24252a",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "borderColor": "#8e918f",
    "borderRadius": "6vh",
    "paddingTop": "4vh",
    "paddingRight": "4vh",
    "paddingBottom": "4vh",
    "paddingLeft": "4vh",
    "zIndex": 10
  },
  "menu-title": {
    "fontSize": "9vh",
    "color": "#b8bbb9"
  },
  "menu-row": {
    "height": "16vh",
    "flexDirection": "row",
    "alignItems": "center",
    "fontSize": "9vh",
    "color": "#e3e3e3",
    "opacity:active:active:active:active:active:active:active:active:active": 0.6
  },
  "menu-dot": {
    "marginRight": "3vh"
  },
  "menu-type": {
    "fontSize": "7vh",
    "color": "#b8bbb9",
    "marginLeft": "auto"
  },
  "drawer-overlay": {
    "position": "absolute",
    "left": 0,
    "top": 0,
    "width": "100vw",
    "height": "100vh",
    "backgroundColor": "rgba(0,0,0,0.52)",
    "zIndex": 20,
    "alignItems": "flex-end",
    "justifyContent": "flex-end"
  },
  "drawer": {
    "width": "145vh",
    "height": "100vh",
    "backgroundColor": "#1a1b1f",
    "paddingTop": 0,
    "paddingRight": 0,
    "paddingBottom": 0,
    "paddingLeft": 0,
    "overflow": "hidden"
  },
  "drawer-head": {
    "height": "15vh",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "drawer-title": {
    "fontSize": "10vh",
    "color": "#e3e3e3",
    "fontWeight": "bold"
  },
  "drawer-close": {
    "fontSize": "12vh",
    "color": "#e3e3e3",
    "marginLeft": "auto"
  },
  "protocol-tabs": {
    "height": "14vh",
    "flexDirection": "row"
  },
  "protocol-tab": {
    "flex": 1,
    "alignItems": "center",
    "justifyContent": "center",
    "borderBottomWidth": "2px",
    "borderBottomStyle": "solid",
    "borderBottomColor": "#8e918f",
    "color": "#b8bbb9",
    "fontSize": "10vh",
    "opacity:active:active:active:active:active:active:active:active": 0.6
  },
  "protocol-active": {
    "color": "#004a77",
    "borderColor": "#004a77"
  },
  "field-label": {
    "fontSize": "7vh",
    "color": "#e3e3e3",
    "marginTop": "2vh"
  },
  "field-input": {
    "height": "14vh",
    "paddingLeft": "3vh",
    "paddingRight": "3vh",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "borderColor": "#8e918f",
    "borderRadius": "5vh",
    "backgroundColor": "#080a0c",
    "color": "#e3e3e3",
    "fontSize": "9vh"
  },
  "field-row": {
    "flexDirection": "row"
  },
  "field-half": {
    "flex": 1
  },
  "second-field": {
    "marginLeft": "4vh"
  },
  "drawer-actions": {
    "height": "16vh",
    "flexDirection": "row",
    "justifyContent": "flex-end",
    "alignItems": "flex-end"
  },
  "cancel-action": {
    "height": "14vh",
    "paddingLeft": "5vh",
    "paddingRight": "5vh",
    "borderRadius": "5vh",
    "alignItems": "center",
    "justifyContent": "center",
    "fontSize": "10vh",
    "color": "#b8bbb9",
    "marginRight": "3vh",
    "opacity:active:active:active:active:active:active:active": 0.6
  },
  "save-action": {
    "height": "14vh",
    "paddingLeft": "5vh",
    "paddingRight": "5vh",
    "borderRadius": "5vh",
    "alignItems": "center",
    "justifyContent": "center",
    "fontSize": "10vh",
    "backgroundColor": "#004a77",
    "color": "#c2e7ff",
    "opacity:active:active:active:active:active:active": 0.6
  },
  "file-menu": {
    "position": "absolute",
    "right": "8vh",
    "bottom": "10vh",
    "width": "90vh",
    "backgroundColor": "#24252a",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "borderColor": "#8e918f",
    "borderRadius": "6vh",
    "paddingTop": "3vh",
    "paddingRight": "3vh",
    "paddingBottom": "3vh",
    "paddingLeft": "3vh",
    "zIndex": 12
  },
  "menu-file-name": {
    "fontSize": "8vh",
    "color": "#b8bbb9"
  },
  "menu-action": {
    "height": "15vh",
    "alignItems": "center"
  },
  "menu-action-text": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "danger-text": {
    "color": "#ffd6db"
  },
  "toast": {
    "position": "absolute",
    "bottom": "5vh",
    "left": "40vw",
    "paddingTop": "4vh",
    "paddingRight": "4vh",
    "paddingBottom": "4vh",
    "paddingLeft": "4vh",
    "borderRadius": "5vh",
    "backgroundColor": "#24252a",
    "zIndex": 30
  },
  "toast-text": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "about-dialog": {
    "position": "absolute",
    "left": 0,
    "top": 0,
    "width": "100vw",
    "height": "100vh",
    "backgroundColor": "rgba(0,0,0,0.5)",
    "alignItems": "center",
    "justifyContent": "center",
    "zIndex": 25
  },
  "about-card": {
    "width": "130vh",
    "paddingTop": "6vh",
    "paddingRight": "6vh",
    "paddingBottom": "6vh",
    "paddingLeft": "6vh",
    "borderRadius": "8vh",
    "backgroundColor": "#1a1b1f",
    "alignItems": "center"
  },
  "about-title": {
    "fontSize": "10vh",
    "color": "#004a77",
    "fontWeight": "bold"
  },
  "about-copy": {
    "fontSize": "8vh",
    "color": "#e3e3e3"
  },
  "about-spec": {
    "alignItems": "center",
    "marginTop": "4vh",
    "marginBottom": "4vh"
  },
  "about-spec-line": {
    "fontSize": "8vh",
    "color": "#b8bbb9",
    "textAlign": "center"
  },
  "save-text": {
    "fontSize": "9vh",
    "color": "#c2e7ff"
  },
  "simple-view": {
    "flex": 1,
    "height": "72vh"
  },
  "simple-header": {
    "height": "16vh",
    "flexDirection": "row",
    "alignItems": "center",
    "borderBottomWidth": "1px",
    "borderBottomStyle": "solid",
    "borderBottomColor": "#8e918f"
  },
  "section-title": {
    "fontSize": "10vh",
    "color": "#e3e3e3",
    "fontWeight": "bold"
  },
  "section-note": {
    "fontSize": "8vh",
    "color": "#b8bbb9",
    "marginLeft": "4vh"
  },
  "transfer-card": {
    "height": "20vh",
    "borderRadius": "6vh",
    "backgroundColor": "#1a1b1f",
    "marginTop": "3vh",
    "paddingTop": "4vh",
    "paddingRight": "4vh",
    "paddingBottom": "4vh",
    "paddingLeft": "4vh",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "setting-row": {
    "height": "22vh",
    "borderRadius": "6vh",
    "backgroundColor": "#1a1b1f",
    "marginTop": "3vh",
    "paddingTop": "4vh",
    "paddingRight": "4vh",
    "paddingBottom": "4vh",
    "paddingLeft": "4vh",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between"
  },
  "transfer-icon": {
    "fontSize": "12vh",
    "color": "#004a77",
    "marginRight": "4vh"
  },
  "transfer-info": {
    "flex": 1
  },
  "transfer-name": {
    "fontSize": "10vh",
    "color": "#e3e3e3"
  },
  "setting-name": {
    "fontSize": "10vh",
    "color": "#e3e3e3"
  },
  "transfer-detail": {
    "fontSize": "8vh",
    "color": "#b8bbb9"
  },
  "setting-desc": {
    "fontSize": "8vh",
    "color": "#b8bbb9"
  },
  "transfer-progress": {
    "fontSize": "10vh",
    "color": "#004a77"
  },
  "settings-view": {
    "width": "250vh"
  },
  "toggle": {
    "width": "32vh",
    "height": "18vh",
    "borderRadius": "6vh",
    "backgroundColor": "#8e918f",
    "paddingTop": "1vh",
    "paddingRight": "1vh",
    "paddingBottom": "1vh",
    "paddingLeft": "1vh",
    "justifyContent": "center"
  },
  "toggle-on": {
    "backgroundColor": "#35645d"
  },
  "toggle-thumb": {
    "width": "16vh",
    "height": "16vh",
    "borderRadius": "100vh",
    "backgroundColor": "#b8bbb9",
    "alignSelf": "flex-start"
  },
  "toggle-thumb-on": {
    "backgroundColor": "#004a77",
    "alignSelf": "flex-end"
  },
  "rail-image": {
    "width": "12vh",
    "height": "12vh"
  },
  "new-connection-text": {
    "fontSize": "8vh",
    "color": "#c2e7ff"
  },
  "path-scroller": {
    "flex": 1,
    "height": "10vh"
  },
  "toolbar-label": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "upload-label": {
    "fontSize": "9vh",
    "color": "#c2e7ff"
  },
  "file-card": {
    "minHeight": "20vh",
    "backgroundColor": "#1a1b1f",
    "borderRadius": "6vh",
    "paddingTop": "2vh",
    "paddingRight": "5vh",
    "paddingBottom": "2vh",
    "paddingLeft": "5vh",
    "marginBottom": "2vh",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "file-card-icon": {
    "width": "12vh",
    "height": "12vh",
    "marginRight": "4vh"
  },
  "file-card-content": {
    "flex": 1
  },
  "file-meta": {
    "fontSize": "8vh",
    "color": "#b8bbb9",
    "marginTop": "1vh"
  },
  "menu-name": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "drawer-scroller": {
    "height": "100vh",
    "paddingTop": "5vh",
    "paddingRight": "5vh",
    "paddingBottom": "8vh",
    "paddingLeft": "5vh"
  },
  "protocol-text": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "cancel-text": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "selected-local": {
    "flex": 1,
    "height": "12vh",
    "marginLeft": "3vh",
    "overflow": "hidden"
  },
  "selected-local-text": {
    "fontSize": "8vh",
    "color": "#c2e7ff"
  },
  "local-overlay": {
    "position": "absolute",
    "left": 0,
    "top": 0,
    "width": "100vw",
    "height": "100vh",
    "backgroundColor": "rgba(0,0,0,0.56)",
    "zIndex": 22,
    "alignItems": "center",
    "justifyContent": "center"
  },
  "local-browser": {
    "width": "145vh",
    "height": "88vh",
    "backgroundColor": "#1a1b1f",
    "borderRadius": "6vh",
    "paddingTop": "4vh",
    "paddingRight": "4vh",
    "paddingBottom": "4vh",
    "paddingLeft": "4vh"
  },
  "local-head": {
    "height": "15vh",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "local-head-back": {
    "width": "13vh",
    "height": "13vh",
    "borderRadius": "5vh",
    "backgroundColor": "#24252a",
    "alignItems": "center",
    "justifyContent": "center",
    "marginRight": "3vh"
  },
  "local-back-text": {
    "fontSize": "12vh",
    "color": "#e3e3e3"
  },
  "local-head-copy": {
    "flex": 1,
    "height": "15vh"
  },
  "local-title": {
    "fontSize": "10vh",
    "color": "#e3e3e3",
    "fontWeight": "bold"
  },
  "local-path-scroller": {
    "height": "6vh"
  },
  "local-path": {
    "fontSize": "7vh",
    "color": "#b8bbb9"
  },
  "local-close": {
    "width": "13vh",
    "height": "13vh",
    "alignItems": "center",
    "justifyContent": "center"
  },
  "local-close-text": {
    "fontSize": "12vh",
    "color": "#b8bbb9"
  },
  "local-scroller": {
    "flex": 1,
    "height": 0
  },
  "local-row": {
    "height": "15vh",
    "borderRadius": "4vh",
    "flexDirection": "row",
    "alignItems": "center",
    "paddingLeft": "3vh",
    "paddingRight": "3vh",
    "marginBottom": "1vh"
  },
  "local-selected": {
    "backgroundColor": "#24252a"
  },
  "local-parent": {
    "backgroundColor": "#24252a"
  },
  "local-icon": {
    "width": "10vh",
    "height": "10vh",
    "marginRight": "3vh"
  },
  "local-copy": {
    "flex": 1
  },
  "local-name": {
    "fontSize": "9vh",
    "color": "#e3e3e3"
  },
  "local-meta": {
    "fontSize": "7vh",
    "color": "#b8bbb9",
    "marginTop": "1vh"
  },
  "local-empty": {
    "height": "20vh",
    "alignItems": "center",
    "justifyContent": "center"
  },
  "local-empty-text": {
    "fontSize": "9vh",
    "color": "#b8bbb9"
  }
} };

const img$5 = "data:image/png;base64,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";
  var __$_require_assets_nav_files_png_base64__ = img$5;

const img$4 = "data:image/png;base64,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";
  var __$_require_assets_nav_transfers_png_base64__ = img$4;

const img$3 = "data:image/png;base64,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";
  var __$_require_assets_nav_settings_png_base64__ = img$3;

const img$2 = "data:image/png;base64,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";
  var __$_require_assets_nav_info_png_base64__ = img$2;

const img$1 = "data:image/png;base64,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";
  var __$_require_assets_folder_icon_png_base64__ = img$1;

const img = "data:image/png;base64,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";
  var __$_require_assets_file_icon_png_base64__ = img;

var render = function (){
var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: ["screen"]
  }, [_c('div', {
    staticClass: ["rail"]
  }, [_c('div', {
    staticClass: ["rail-button"],
    class: _vm.view === 'files' ? 'rail-active' : '',
    on: {
      "click": function($event) {
        return _vm.setView('files')
      }
    }
  }, [_c('image', {
    staticClass: ["rail-image"],
    attrs: {
      "src": __$_require_assets_nav_files_png_base64__
    }
  })]), _c('div', {
    staticClass: ["rail-button"],
    class: _vm.view === 'transfers' ? 'rail-active' : '',
    on: {
      "click": function($event) {
        return _vm.setView('transfers')
      }
    }
  }, [_c('image', {
    staticClass: ["rail-image"],
    attrs: {
      "src": __$_require_assets_nav_transfers_png_base64__
    }
  }), (_vm.transferCount) ? _c('text', {
    staticClass: ["rail-badge"]
  }, [_vm._v(_vm._s(_vm.transferCount))]) : _vm._e()]), _c('div', {
    staticClass: ["rail-button"],
    class: _vm.view === 'settings' ? 'rail-active' : '',
    on: {
      "click": function($event) {
        return _vm.setView('settings')
      }
    }
  }, [_c('image', {
    staticClass: ["rail-image"],
    attrs: {
      "src": __$_require_assets_nav_settings_png_base64__
    }
  })]), _c('div', {
    staticClass: ["rail-button"],
    on: {
      "click": function($event) {
        _vm.showAbout = true;
      }
    }
  }, [_c('image', {
    staticClass: ["rail-image"],
    attrs: {
      "src": __$_require_assets_nav_info_png_base64__
    }
  })])]), _c('div', {
    staticClass: ["workspace"]
  }, [_c('div', {
    staticClass: ["topbar"]
  }, [_c('div', [_c('text', {
    staticClass: ["page-title"]
  }, [_vm._v(_vm._s(_vm.pageTitle))])]), _c('div', {
    staticClass: ["top-actions"]
  }, [_c('div', {
    staticClass: ["connection-pill"],
    on: {
      "click": _vm.toggleConnectionMenu
    }
  }, [_c('text', {
    staticClass: ["status-dot"],
    class: _vm.activeConnection.online ? 'online' : 'offline'
  }), _c('text', {
    staticClass: ["connection-name"]
  }, [_vm._v(_vm._s(_vm.activeConnection.name))]), _c('text', {
    staticClass: ["connection-type"]
  }, [_vm._v(_vm._s(_vm.activeConnection.type))]), _c('text', {
    staticClass: ["chevron"]
  }, [_vm._v("⌄")])]), _c('div', {
    staticClass: ["icon-action"],
    on: {
      "click": _vm.refreshFiles
    }
  }, [_c('text', {
    staticClass: ["icon-action-text"]
  }, [_vm._v("↻")])]), _c('div', {
    staticClass: ["icon-action"],
    on: {
      "click": _vm.openLocalBrowser
    }
  }, [_c('text', {
    staticClass: ["icon-action-text"]
  }, [_vm._v("📁")])]), _c('div', {
    staticClass: ["icon-action"],
    on: {
      "click": _vm.openConnectionDrawer
    }
  }, [_c('text', {
    staticClass: ["icon-action-text"]
  }, [_vm._v("＋")])])])]), (_vm.view === 'files') ? _c('div', {
    staticClass: ["files-view"]
  }, [_c('div', {
    staticClass: ["content-grid"]
  }, [_c('div', {
    staticClass: ["connections-panel"]
  }, [_c('div', {
    staticClass: ["panel-head"]
  }, [_c('text', {
    staticClass: ["panel-title"]
  }, [_vm._v("连接")]), _c('text', {
    staticClass: ["panel-count"]
  }, [_vm._v(_vm._s(_vm.connections.length))])]), _c('scroller', {
    staticClass: ["connection-scroller"],
    attrs: {
      "scrollDirection": "vertical",
      "showScrollbar": "false"
    }
  }, _vm._l((_vm.connections), function(connection) {
    return _c('div', {
      key: connection.id,
      staticClass: ["connection-row"],
      class: connection.id === _vm.activeConnectionId ? 'connection-selected' : '',
      on: {
        "click": function($event) {
          return _vm.selectConnection(connection.id)
        }
      }
    }, [_c('div', {
      staticClass: ["connection-icon"],
      class: connection.type === 'FTP' ? 'ftp' : ''
    }, [_c('text', {
      staticClass: ["connection-icon-text"],
      class: connection.type === 'FTP' ? 'ftp-text' : ''
    }, [_vm._v(_vm._s(connection.type === 'WebDAV' ? 'W' : 'F'))])]), _c('div', {
      staticClass: ["connection-meta"]
    }, [_c('text', {
      staticClass: ["row-name"]
    }, [_vm._v(_vm._s(connection.name))]), _c('text', {
      staticClass: ["row-sub"]
    }, [_vm._v(_vm._s(connection.host))])]), _c('text', {
      staticClass: ["row-status"],
      class: connection.online ? 'online-text' : ''
    }, [_vm._v(_vm._s(connection.online ? '已连接' : '离线'))])])
  }), 0), _c('div', {
    staticClass: ["new-connection"],
    on: {
      "click": _vm.openConnectionDrawer
    }
  }, [_c('text', {
    staticClass: ["new-plus"]
  }, [_vm._v("＋")]), _c('text', {
    staticClass: ["new-connection-text"]
  }, [_vm._v("添加连接")])])]), _c('div', {
    staticClass: ["file-panel"]
  }, [_c('div', {
    staticClass: ["pathbar"]
  }, [_c('div', {
    staticClass: ["path-back"],
    on: {
      "click": _vm.goUp
    }
  }, [_c('text', {
    staticClass: ["path-back-text"]
  }, [_vm._v("‹")])]), _c('scroller', {
    staticClass: ["path-scroller"],
    attrs: {
      "scrollDirection": "horizontal",
      "showScrollbar": "false"
    }
  }, [_c('text', {
    staticClass: ["path-current"]
  }, [_vm._v(_vm._s(_vm.activeConnection.host || '未连接') + _vm._s(_vm.currentPath))])])]), _c('div', {
    staticClass: ["file-toolbar"]
  }, [_c('div', {
    staticClass: ["toolbar-spacer"]
  }), (_vm.selectedLocalFile) ? _c('scroller', {
    staticClass: ["selected-local"],
    attrs: {
      "scrollDirection": "horizontal",
      "showScrollbar": "false"
    }
  }, [_c('text', {
    staticClass: ["selected-local-text"]
  }, [_vm._v(_vm._s(_vm.selectedLocalFile.name))])]) : _vm._e(), _c('div', {
    staticClass: ["toolbar-action"],
    on: {
      "click": _vm.openLocalBrowser
    }
  }, [_c('text', {
    staticClass: ["toolbar-label"]
  }, [_vm._v("本地文件")])]), (_vm.selectedLocalFile) ? _c('div', {
    staticClass: ["toolbar-action", "toolbar-primary"],
    on: {
      "click": _vm.startUpload
    }
  }, [_c('text', {
    staticClass: ["upload-icon"]
  }, [_vm._v("↑")]), _c('text', {
    staticClass: ["upload-label"]
  }, [_vm._v("上传")])]) : _vm._e()]), _c('scroller', {
    staticClass: ["file-scroller"],
    attrs: {
      "scrollDirection": "vertical",
      "showScrollbar": "false",
      "overScroll": "50px",
      "overFling": "50px"
    }
  }, [(_vm.currentPath !== '/') ? _c('div', {
    staticClass: ["file-card"],
    on: {
      "click": _vm.goUp
    }
  }, [_c('image', {
    staticClass: ["file-card-icon"],
    attrs: {
      "src": __$_require_assets_folder_icon_png_base64__
    }
  }), _c('text', {
    staticClass: ["file-name"]
  }, [_vm._v("返回上级目录")])]) : _vm._e(), _vm._l((_vm.filteredFiles), function(file) {
    return _c('div', {
      key: file.name,
      staticClass: ["file-card"],
      on: {
        "click": function($event) {
          return _vm.openFile(file)
        }
      }
    }, [_c('image', {
      staticClass: ["file-card-icon"],
      attrs: {
        "src": file.folder ? __$_require_assets_folder_icon_png_base64__ : __$_require_assets_file_icon_png_base64__
      }
    }), _c('div', {
      staticClass: ["file-card-content"]
    }, [_c('text', {
      staticClass: ["file-name"]
    }, [_vm._v(_vm._s(file.name))]), _c('text', {
      staticClass: ["file-meta"]
    }, [_vm._v(_vm._s(file.folder ? '文件夹' : file.size) + " " + _vm._s(file.date))])]), _c('div', {
      staticClass: ["more-action"],
      on: {
        "click": function($event) {
          $event.stopPropagation();
          return _vm.openFileMenu(file)
        }
      }
    }, [_c('text', {
      staticClass: ["more-text"]
    }, [_vm._v("•••")])])])
  }), (_vm.filteredFiles.length === 0) ? _c('div', {
    staticClass: ["empty-state"]
  }, [_c('text', {
    staticClass: ["empty-state-text"]
  }, [_vm._v("此目录为空")])]) : _vm._e()], 2)])])]) : _vm._e(), (_vm.view === 'transfers') ? _c('div', {
    staticClass: ["simple-view"]
  }, [_c('div', {
    staticClass: ["simple-header"]
  }, [_c('text', {
    staticClass: ["section-title"]
  }, [_vm._v("传输队列")]), _c('text', {
    staticClass: ["section-note"]
  }, [_vm._v(_vm._s(_vm.transferCount) + " 个任务")])]), _vm._l((_vm.transfers), function(transfer) {
    return _c('div', {
      key: transfer.id,
      staticClass: ["transfer-card"]
    }, [_c('text', {
      staticClass: ["transfer-icon"]
    }, [_vm._v(_vm._s(transfer.direction === 'up' ? '↑' : '↓'))]), _c('div', {
      staticClass: ["transfer-info"]
    }, [_c('text', {
      staticClass: ["transfer-name"]
    }, [_vm._v(_vm._s(transfer.name))]), _c('text', {
      staticClass: ["transfer-detail"]
    }, [_vm._v(_vm._s(transfer.detail))])]), _c('text', {
      staticClass: ["transfer-progress"]
    }, [_vm._v(_vm._s(transfer.progress))])])
  })], 2) : _vm._e(), (_vm.view === 'settings') ? _c('div', {
    staticClass: ["simple-view", "settings-view"]
  }, [_vm._m(0), _c('div', {
    staticClass: ["setting-row"]
  }, [_vm._m(1), _c('div', {
    staticClass: ["toggle"],
    class: _vm.wifiOnly ? 'toggle-on' : '',
    on: {
      "click": function($event) {
        _vm.wifiOnly = !_vm.wifiOnly;
      }
    }
  }, [_c('div', {
    staticClass: ["toggle-thumb"],
    class: _vm.wifiOnly ? 'toggle-thumb-on' : ''
  })])]), _vm._m(2)]) : _vm._e()]), (_vm.connectionMenu) ? _c('div', {
    staticClass: ["connection-menu"]
  }, [_c('text', {
    staticClass: ["menu-title"]
  }, [_vm._v("切换连接")]), _vm._l((_vm.connections), function(connection) {
    return _c('div', {
      key: connection.id,
      staticClass: ["menu-row"],
      on: {
        "click": function($event) {
          return _vm.selectConnection(connection.id)
        }
      }
    }, [_c('text', {
      staticClass: ["status-dot", "menu-dot"],
      class: connection.online ? 'online' : 'offline'
    }), _c('text', {
      staticClass: ["menu-name"]
    }, [_vm._v(_vm._s(connection.name))]), _c('text', {
      staticClass: ["menu-type"]
    }, [_vm._v(_vm._s(connection.type))])])
  })], 2) : _vm._e(), (_vm.drawerOpen) ? _c('div', {
    staticClass: ["drawer-overlay"],
    on: {
      "click": _vm.closeConnectionDrawer
    }
  }, [_c('div', {
    staticClass: ["drawer"],
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.noop($event)
      }
    }
  }, [_c('scroller', {
    staticClass: ["drawer-scroller"],
    attrs: {
      "scrollDirection": "vertical",
      "showScrollbar": "true"
    }
  }, [_c('div', {
    staticClass: ["drawer-head"]
  }, [_c('text', {
    staticClass: ["drawer-title"]
  }, [_vm._v("添加远程连接")]), _c('text', {
    staticClass: ["drawer-close"],
    on: {
      "click": _vm.closeConnectionDrawer
    }
  }, [_vm._v("×")])]), _c('div', {
    staticClass: ["protocol-tabs"]
  }, [_c('div', {
    staticClass: ["protocol-tab"],
    class: _vm.form.type === 'WebDAV' ? 'protocol-active' : '',
    on: {
      "click": function($event) {
        _vm.form.type = 'WebDAV';
      }
    }
  }, [_c('text', {
    staticClass: ["protocol-text"]
  }, [_vm._v("WebDAV")])]), _c('div', {
    staticClass: ["protocol-tab"],
    class: _vm.form.type === 'FTP' ? 'protocol-active' : '',
    on: {
      "click": function($event) {
        _vm.form.type = 'FTP';
      }
    }
  }, [_c('text', {
    staticClass: ["protocol-text"]
  }, [_vm._v("FTP")])])]), _c('text', {
    staticClass: ["field-label"]
  }, [_vm._v("名称")]), _c('input', {
    staticClass: ["field-input"],
    attrs: {
      "value": _vm.form.name,
      "placeholder": "例如：家庭 NAS",
      "softInputEnable": !_vm.inputMethodReady || !_vm.inputMethodAvailable
    },
    on: {
      "focus": function($event) {
        return _vm.focusInput('name')
      },
      "input": function($event) {
        return _vm.onInput('name', $event)
      }
    }
  }), _c('text', {
    staticClass: ["field-label"]
  }, [_vm._v("服务器地址")]), _c('input', {
    staticClass: ["field-input"],
    attrs: {
      "value": _vm.form.host,
      "placeholder": "192.168.1.10:5005",
      "softInputEnable": !_vm.inputMethodReady || !_vm.inputMethodAvailable
    },
    on: {
      "focus": function($event) {
        return _vm.focusInput('host')
      },
      "input": function($event) {
        return _vm.onInput('host', $event)
      }
    }
  }), _c('div', {
    staticClass: ["field-row"]
  }, [_c('div', {
    staticClass: ["field-half"]
  }, [_c('text', {
    staticClass: ["field-label"]
  }, [_vm._v("用户名")]), _c('input', {
    staticClass: ["field-input"],
    attrs: {
      "value": _vm.form.user,
      "placeholder": "可选",
      "softInputEnable": !_vm.inputMethodReady || !_vm.inputMethodAvailable
    },
    on: {
      "focus": function($event) {
        return _vm.focusInput('user')
      },
      "input": function($event) {
        return _vm.onInput('user', $event)
      }
    }
  })]), _c('div', {
    staticClass: ["field-half", "second-field"]
  }, [_c('text', {
    staticClass: ["field-label"]
  }, [_vm._v("密码")]), _c('input', {
    staticClass: ["field-input"],
    attrs: {
      "type": "password",
      "value": _vm.form.password,
      "placeholder": "可选",
      "softInputEnable": !_vm.inputMethodReady || !_vm.inputMethodAvailable
    },
    on: {
      "focus": function($event) {
        return _vm.focusInput('password')
      },
      "input": function($event) {
        return _vm.onInput('password', $event)
      }
    }
  })])]), _c('div', {
    staticClass: ["drawer-actions"]
  }, [_c('div', {
    staticClass: ["cancel-action"],
    on: {
      "click": _vm.closeConnectionDrawer
    }
  }, [_c('text', {
    staticClass: ["cancel-text"]
  }, [_vm._v("取消")])]), _c('div', {
    staticClass: ["save-action"],
    on: {
      "click": _vm.saveConnection
    }
  }, [_c('text', {
    staticClass: ["save-text"]
  }, [_vm._v("保存连接")])])])])])]) : _vm._e(), (_vm.localBrowserOpen) ? _c('div', {
    staticClass: ["local-overlay"],
    on: {
      "click": _vm.closeLocalBrowser
    }
  }, [_c('div', {
    staticClass: ["local-browser"],
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.noop($event)
      }
    }
  }, [_c('div', {
    staticClass: ["local-head"]
  }, [_c('div', {
    staticClass: ["local-head-back"],
    on: {
      "click": _vm.goLocalUp
    }
  }, [_c('text', {
    staticClass: ["local-back-text"]
  }, [_vm._v("‹")])]), _c('div', {
    staticClass: ["local-head-copy"]
  }, [_c('text', {
    staticClass: ["local-title"]
  }, [_vm._v("选择本地文件")]), _c('scroller', {
    staticClass: ["local-path-scroller"],
    attrs: {
      "scrollDirection": "horizontal",
      "showScrollbar": "false"
    }
  }, [_c('text', {
    staticClass: ["local-path"]
  }, [_vm._v(_vm._s(_vm.localPath))])])]), _c('div', {
    staticClass: ["local-close"],
    on: {
      "click": _vm.closeLocalBrowser
    }
  }, [_c('text', {
    staticClass: ["local-close-text"]
  }, [_vm._v("×")])])]), _c('scroller', {
    staticClass: ["local-scroller"],
    attrs: {
      "scrollDirection": "vertical",
      "showScrollbar": "false",
      "overScroll": "50px",
      "overFling": "50px"
    }
  }, [(_vm.localPath !== _vm.localRoot) ? _c('div', {
    staticClass: ["local-row", "local-parent"],
    on: {
      "click": _vm.goLocalUp
    }
  }, [_c('image', {
    staticClass: ["local-icon"],
    attrs: {
      "src": __$_require_assets_folder_icon_png_base64__
    }
  }), _c('text', {
    staticClass: ["local-name"]
  }, [_vm._v("返回上级目录")])]) : _vm._e(), _vm._l((_vm.localFiles), function(entry) {
    return _c('div', {
      key: entry.path,
      staticClass: ["local-row"],
      class: entry.path === (_vm.selectedLocalFile && _vm.selectedLocalFile.path) ? 'local-selected' : '',
      on: {
        "click": function($event) {
          return _vm.openLocalEntry(entry)
        }
      }
    }, [_c('image', {
      staticClass: ["local-icon"],
      attrs: {
        "src": entry.folder ? __$_require_assets_folder_icon_png_base64__ : __$_require_assets_file_icon_png_base64__
      }
    }), _c('div', {
      staticClass: ["local-copy"]
    }, [_c('text', {
      staticClass: ["local-name"]
    }, [_vm._v(_vm._s(entry.name))]), _c('text', {
      staticClass: ["local-meta"]
    }, [_vm._v(_vm._s(entry.folder ? '文件夹' : '文件'))])])])
  }), (_vm.localFiles.length === 0) ? _c('div', {
    staticClass: ["local-empty"]
  }, [_c('text', {
    staticClass: ["local-empty-text"]
  }, [_vm._v(_vm._s(_vm.localLoading ? '正在读取…' : '此目录为空'))])]) : _vm._e()], 2)])]) : _vm._e(), (_vm.fileMenu) ? _c('div', {
    staticClass: ["file-menu"]
  }, [_c('text', {
    staticClass: ["menu-file-name"]
  }, [_vm._v(_vm._s(_vm.fileMenu.name))]), _c('div', {
    staticClass: ["menu-action"],
    on: {
      "click": _vm.downloadFile
    }
  }, [_c('text', {
    staticClass: ["menu-action-text"]
  }, [_vm._v("↓ 下载到本机")])]), _c('div', {
    staticClass: ["menu-action"],
    on: {
      "click": _vm.renameFile
    }
  }, [_c('text', {
    staticClass: ["menu-action-text"]
  }, [_vm._v("✎ 重命名")])]), _c('div', {
    staticClass: ["menu-action", "danger"],
    on: {
      "click": _vm.deleteFile
    }
  }, [_c('text', {
    staticClass: ["menu-action-text", "danger-text"]
  }, [_vm._v("⌫ 删除")])])]) : _vm._e(), (_vm.toast) ? _c('div', {
    staticClass: ["toast"]
  }, [_c('text', {
    staticClass: ["toast-text"]
  }, [_vm._v(_vm._s(_vm.toast))])]) : _vm._e(), (_vm.showAbout) ? _c('div', {
    staticClass: ["about-dialog"],
    on: {
      "click": function($event) {
        _vm.showAbout = false;
      }
    }
  }, [_c('div', {
    staticClass: ["about-card"],
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.noop($event)
      }
    }
  }, [_c('text', {
    staticClass: ["about-title"]
  }, [_vm._v("Cosmos Drive")]), _c('text', {
    staticClass: ["about-copy"]
  }, [_vm._v("远程文件管理器 · WebDAV / FTP")]), _vm._m(3), _c('div', {
    staticClass: ["save-action"],
    on: {
      "click": function($event) {
        _vm.showAbout = false;
      }
    }
  }, [_c('text', {
    staticClass: ["save-text"]
  }, [_vm._v("知道了")])])])]) : _vm._e()])
};

var staticRenderFns=[function (){
var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: ["simple-header"]
  }, [_c('text', {
    staticClass: ["section-title"]
  }, [_vm._v("设备设置")]), _c('text', {
    staticClass: ["section-note"]
  }, [_vm._v("轻量模式")])])
},function (){
var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('text', {
    staticClass: ["setting-name"]
  }, [_vm._v("仅 Wi-Fi 传输")]), _c('text', {
    staticClass: ["setting-desc"]
  }, [_vm._v("移动网络下暂停同步")])])
},function (){
var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: ["setting-row"]
  }, [_c('div', [_c('text', {
    staticClass: ["setting-name"]
  }, [_vm._v("低内存模式")]), _c('text', {
    staticClass: ["setting-desc"]
  }, [_vm._v("限制并发连接，适合 30MB 可用内存")])]), _c('div', {
    staticClass: ["toggle", "toggle-on"]
  }, [_c('div', {
    staticClass: ["toggle-thumb", "toggle-thumb-on"]
  })])])
},function (){
var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: ["about-spec"]
  }, [_c('text', {
    staticClass: ["about-spec-line"]
  }, [_vm._v("为 1020×240 词典笔设计")]), _c('text', {
    staticClass: ["about-spec-line"]
  }, [_vm._v("低内存、少请求、快速浏览")])])
}];
render._withStripped = true;
  
const __file = 'src/pages/index/index.vue';
const _scopeId = 'data-v-58bc789a';

const _exports = script;

_exports.render = render;
_exports.staticRenderFns = staticRenderFns;
_exports._compiled = true;
_exports._scopeId = _scopeId;
_exports.themes = {};
_exports.style = Object.assign({}, style_0['_']);
_exports.__file = __file;

var _index = _exports;

App$1.meta = {
  "pages": {
    "index": "pages/index/index.vue"
  },
  "options": {
    "style": {
      "lessPaths": [
        "styles"
      ]
    }
  }
};
App$1.meta.name = 'Cosmos云存储';
App$1.meta.version = '1.0.0';
App$1.meta.isSingleJsBundle = false;
$falcon.__AppClazz = App$1;
$falcon.__loadModuleDefault = async function (fileName) {
  if(App$1.__pages && App$1.__pages[fileName]){
    return App$1.__pages[fileName];
  } else {
    try{
      const pagePath = './' + fileName + '.js';
      let mod = await import(pagePath);
      return mod.default;
    } catch(e){
      console.log(e.message, e.stack);
    }
  }
};
App$1.__pages = {};
App$1.__pages['index'] = _index;
