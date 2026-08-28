<template>
  <div class="screen">
    <div class="rail">
      <div class="rail-button" :class="view === 'files' ? 'rail-active' : ''" @click="setView('files')"><image class="rail-image" :src="require('../../assets/nav-files.png?base64')" /></div>
      <div class="rail-button" :class="view === 'transfers' ? 'rail-active' : ''" @click="setView('transfers')"><image class="rail-image" :src="require('../../assets/nav-transfers.png?base64')" /><text v-if="transferCount" class="rail-badge">{{ transferCount }}</text></div>
      <div class="rail-button" @click="openAbout"><image class="rail-image" :src="require('../../assets/nav-info.png?base64')" /></div>
    </div>
    <div class="workspace">
      <div class="topbar"><div><text class="page-title">{{ pageTitle }}</text></div><div class="top-actions"><div class="connection-pill" @click="toggleConnectionMenu"><text class="status-dot" :class="activeConnection.online ? 'online' : 'offline'"></text><text class="connection-name">{{ activeConnection.name }}</text><text class="connection-type">{{ activeConnection.type }}</text><text class="chevron">连接</text></div><div class="icon-action" @click="refreshFiles"><text class="icon-action-text">刷新</text></div><div v-if="!externalRequest" class="icon-action" @click="openLocalBrowser"><text class="icon-action-text">本地</text></div><div v-if="view === 'files' && !externalRequest" class="icon-action folder-top-action" @click="openFolderDialog"><text class="icon-action-text">新建文件夹</text></div><div v-if="externalRequest && externalRequest.action === 'select-file' && externalSelectedFile" class="icon-action picker-file-action" @click="confirmExternalFile"><text class="icon-action-text">确认</text></div><div v-if="externalRequest && externalRequest.action === 'select-folder'" class="icon-action picker-folder-action" @click="selectCurrentFolder"><text class="icon-action-text">选择此文件夹</text></div><div v-if="externalRequest" class="icon-action picker-cancel-action" @click="cancelExternalRequest"><text class="icon-action-text">{{ externalBusy ? '下载中' : '取消' }}</text></div></div></div>
      <div v-if="view === 'files'" class="files-view">
        <div class="content-grid">
          <div class="connections-panel"><div class="panel-head"><text class="panel-title">连接</text><text class="panel-count">{{ connections.length }}</text></div><scroller class="connection-scroller" scroll-direction="vertical" show-scrollbar="false"><div v-for="connection in connections" :key="connection.id" class="connection-row" :class="connection.id === activeConnectionId ? 'connection-selected' : ''" @click="selectConnection(connection.id)"><div class="connection-icon" :class="connection.type === 'FTP' ? 'ftp' : ''"><text class="connection-icon-text" :class="connection.type === 'FTP' ? 'ftp-text' : ''">{{ connection.type === 'WebDAV' ? 'W' : 'F' }}</text></div><div class="connection-meta"><text class="row-name">{{ connection.name }}</text><text class="row-sub">{{ connection.host }}</text></div><text class="row-status" :class="connection.online ? 'online-text' : ''">{{ connection.online ? '已连接' : '离线' }}</text></div></scroller><div class="new-connection" @click="openConnectionDrawer"><text class="new-connection-text">添加连接</text></div></div>
          <div class="file-panel">
            <div class="pathbar"><div class="path-back" @click="goUp"><text class="path-back-text">返回</text></div><scroller class="path-scroller" scroll-direction="horizontal" show-scrollbar="false"><text class="path-current">{{ activeConnection.host || '未连接' }}{{ currentPath }}</text></scroller></div>
            <div v-if="selectedLocalFile" class="file-toolbar"><div class="toolbar-spacer"></div><scroller class="selected-local" scroll-direction="horizontal" show-scrollbar="false"><text class="selected-local-text">{{ selectedLocalFile.name }}</text></scroller><div class="toolbar-action toolbar-primary" @click="startUpload"><text class="upload-label">上传</text></div></div>
            <scroller class="file-scroller" scroll-direction="vertical" show-scrollbar="false" over-scroll="50px" over-fling="50px">
              <div v-if="currentPath !== '/'" class="file-card" @click="goUp"><image class="file-card-icon" :src="require('../../assets/folder-icon.png?base64')" /><text class="file-name">返回上级目录</text></div>
              <div v-for="file in filteredFiles" :key="file.name" class="file-card" :class="externalSelectedFile && externalSelectedFile.name === file.name ? 'external-file-selected' : ''"><div class="file-card-main" @click="openFile(file)"><image class="file-card-icon" :src="file.folder ? require('../../assets/folder-icon.png?base64') : require('../../assets/file-icon.png?base64')" /><div class="file-card-content"><text class="file-name" :class="externalSelectedFile && externalSelectedFile.name === file.name ? 'external-file-name' : ''">{{ file.name }}</text><text class="file-meta" :class="externalSelectedFile && externalSelectedFile.name === file.name ? 'external-file-meta' : ''">{{ file.folder ? '文件夹' : file.size }} {{ file.date }}</text></div></div><div v-if="!externalRequest" class="more-action" @click="openFileMenu(file)"><text class="more-text">更多</text></div></div>
              <div v-if="filteredFiles.length === 0" class="empty-state"><text class="empty-state-text">此目录为空</text></div>
            </scroller>
          </div>
        </div>
      </div>
      <div v-if="view === 'transfers'" class="simple-view"><div class="simple-header"><text class="section-title">传输管理</text><text class="section-note">{{ transferCount }} 个记录</text></div><scroller class="transfer-scroller" scroll-direction="vertical" show-scrollbar="false" over-scroll="50px" over-fling="50px"><div class="transfer-card" v-for="transfer in transfers" :key="transfer.id"><text class="transfer-icon">{{ transfer.direction === 'up' ? '上传' : '下载' }}</text><div class="transfer-info"><text class="transfer-name">{{ transfer.name }}</text><text class="transfer-detail">{{ transfer.detail }}</text></div><text class="transfer-status" :class="transfer.statusClass">{{ transfer.status }}</text></div><div v-if="transfers.length === 0" class="transfer-empty"><text class="transfer-empty-text">暂无传输记录</text></div></scroller></div>
    </div>
    <div v-if="connectionMenu" class="connection-menu"><text class="menu-title">切换连接</text><div v-for="connection in connections" :key="connection.id" class="menu-row" @click="selectConnection(connection.id)"><text class="status-dot menu-dot" :class="connection.online ? 'online' : 'offline'"></text><text class="menu-name">{{ connection.name }}</text><text class="menu-type">{{ connection.type }}</text></div></div>
    <div v-if="drawerOpen" class="drawer-overlay" @click="closeConnectionDrawer">
        <div class="drawer" @click.stop="noop">
          <scroller class="drawer-scroller" scroll-direction="vertical" show-scrollbar="true">
          <div class="drawer-head"><text class="drawer-title">添加远程连接</text><text class="drawer-close" @click="closeConnectionDrawer">关闭</text></div>
          <div class="protocol-tabs"><div class="protocol-tab" :class="form.type === 'WebDAV' ? 'protocol-active' : ''" @click="form.type = 'WebDAV'"><text class="protocol-text" :class="form.type === 'WebDAV' ? 'protocol-text-active' : ''">WebDAV</text></div><div class="protocol-tab" :class="form.type === 'FTP' ? 'protocol-active' : ''" @click="form.type = 'FTP'"><text class="protocol-text" :class="form.type === 'FTP' ? 'protocol-text-active' : ''">FTP</text></div></div>
          <text class="field-label">名称</text><input class="field-input" :value="form.name" placeholder="例如：家庭 NAS" :softInputEnable="!inputMethodReady || !inputMethodAvailable" @focus="focusInput('name')" @input="onInput('name', $event)" />
          <text class="field-label">服务器地址</text><input class="field-input" :value="form.host" placeholder="192.168.1.10:5005" :softInputEnable="!inputMethodReady || !inputMethodAvailable" @focus="focusInput('host')" @input="onInput('host', $event)" />
          <div class="field-row"><div class="field-half"><text class="field-label">用户名</text><input class="field-input" :value="form.user" placeholder="可选" :softInputEnable="!inputMethodReady || !inputMethodAvailable" @focus="focusInput('user')" @input="onInput('user', $event)" /></div><div class="field-half second-field"><text class="field-label">密码</text><input class="field-input" type="password" :value="form.password" placeholder="可选" :softInputEnable="!inputMethodReady || !inputMethodAvailable" @focus="focusInput('password')" @input="onInput('password', $event)" /></div></div>
          <div class="drawer-actions"><div class="cancel-action" @click="closeConnectionDrawer"><text class="cancel-text">取消</text></div><div class="save-action" @click="saveConnection"><text class="save-text">保存连接</text></div></div>
        </scroller>
      </div>
    </div>
    <div v-if="folderDialogOpen" class="folder-overlay" @click="closeFolderDialog"><div class="folder-dialog" @click.stop="noop"><div class="folder-dialog-title"><text class="folder-title">新建文件夹</text><text class="folder-close" @click="closeFolderDialog">关闭</text></div><text class="folder-label">文件夹名称</text><input class="folder-input" :value="folderName" placeholder="请输入名称" :softInputEnable="!inputMethodReady || !inputMethodAvailable" @focus="focusFolderInput" @input="onFolderInput($event)" /><div class="folder-actions"><div class="cancel-action" @click="closeFolderDialog"><text class="cancel-text">取消</text></div><div class="save-action" @click="saveFolder"><text class="save-text">创建</text></div></div></div></div>
    <div v-if="fileMenu" class="file-menu-overlay" @click="closeFileMenu"></div><div v-if="fileMenu" class="file-menu"><text class="menu-file-name">{{ fileMenu.name }}</text><div class="menu-action" @click="downloadFile"><text class="menu-action-text">下载到本机</text></div><div class="menu-action" @click="renameFile"><text class="menu-action-text">重命名</text></div><div class="menu-action danger" @click="deleteFile"><text class="menu-action-text danger-text">删除</text></div><div class="menu-action" @click="closeFileMenu"><text class="menu-action-text">取消</text></div></div><div v-if="toast" class="toast"><text class="toast-text">{{ toast }}</text></div>
  </div>
</template>

<script>
import fs from 'fs'
import { request, saveConfig, listProfiles, isNativeAvailable, ensureConfig } from '../../utils/drive-api.js'
import { loadUiState, saveUiState } from '../../utils/profile-storage.js'
import { initInputMethod, startTextEdit, closeTextEdit, releaseInputMethod } from '../../utils/input-method.js'
import { takeSelectedLocalFile } from '../../utils/local-selection.js'

const DEFAULT_UI_STATE = { view: 'files', activeConnectionId: '', sortAsc: true, transfers: [] }
const DOWNLOAD_ROOT = '/userdisk/Favorite/cosmos/drive/downloads'
const EXTERNAL_DOWNLOAD_ROOT = '/tmp/cosmos-drive-select'

export default {
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
      folderDialogOpen: false,
      folderName: '',
      externalRequest: null,
      externalHandledRequestId: '',
      externalBusy: false,
      externalSelectedFile: null,
      selectedLocalFile: null,
      fileMenu: null,
      toast: '',
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
    this.nativeAvailable = isNativeAvailable()
    await this.restoreUiState()
    const launchOptions = this.currentLaunchOptions()
    if (launchOptions) this.handleExternalRequest(launchOptions)
    if (this.nativeAvailable) {
      try { ensureConfig() } catch (e) { this.showToast(e.message || '初始化配置文件失败') }
      await this.loadProfiles()
    }
  },
  async mounted() {
    this.inputMethodAvailable = await initInputMethod()
    this.inputMethodReady = true
  },
  onShow() {
    const selected = takeSelectedLocalFile()
    if (selected) this.selectedLocalFile = selected
    const options = this.currentLaunchOptions()
    if (options) this.handleExternalRequest(options)
  },
  onNewOptions(options) {
    this.handleExternalRequest(options)
  },
  beforeDestroy() {
    closeTextEdit()
    releaseInputMethod()
  },
  computed: {
    activeConnection() {
      return this.connections.find(item => item.id === this.activeConnectionId) || { name: '未连接', type: '', host: '', online: false, used: '-', capacity: '-' }
    },
    filteredFiles() {
      const q = this.query.trim().toLowerCase()
      return this.files.filter(file => !q || file.name.toLowerCase().indexOf(q) !== -1).sort((a, b) => a.folder !== b.folder ? (a.folder ? -1 : 1) : (this.sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))
    },
    transferCount() { return this.transfers.length }
  },
  methods: {
    async restoreUiState() {
      const state = await loadUiState()
      if (!state) {
        await saveUiState(DEFAULT_UI_STATE)
        return
      }
      if (state.view === 'transfers') this.view = 'transfers'
      else this.view = 'files'
      if (typeof state.activeConnectionId === 'string') this.activeConnectionId = state.activeConnectionId
      if (typeof state.sortAsc === 'boolean') this.sortAsc = state.sortAsc
      if (Array.isArray(state.transfers)) this.transfers = state.transfers.filter(item => item && item.id && item.name && item.status).map(item => ({ id: String(item.id), name: String(item.name), direction: item.direction === 'up' ? 'up' : 'down', status: String(item.status), detail: String(item.detail || ''), statusClass: String(item.statusClass || '') }))
      this.pageTitle = this.view === 'files' ? '文件浏览' : '传输管理'
    },
    async persistUiState() {
      await saveUiState({ view: this.view, activeConnectionId: this.activeConnectionId, sortAsc: this.sortAsc, transfers: this.transfers })
    },
    async loadProfiles() {
      try {
        const preferred = this.activeConnectionId
        const profiles = await listProfiles()
        this.connections = profiles.map((item, index) => ({ ...item, id: item.name || String(index), online: false, used: '-', capacity: '-' }))
        if (this.connections.length) {
          this.activeConnectionId = this.connections.some(item => item.id === preferred) ? preferred : this.connections[0].id
          await this.persistUiState()
          await this.loadFiles()
        } else {
          this.activeConnectionId = ''
          await this.persistUiState()
        }
      } catch (e) { this.showToast(e.message || '读取连接配置失败') }
    },
    async loadFiles() {
      if (!this.connections.length) return
      try {
        const config = this.activeConnection.name ? '@' + this.activeConnection.name : this.activeConnection
        const items = await request(config, 'list', this.currentPath, '')
        this.files = (items || []).map(item => ({ name: item.name, rawName: item.rawName || item.name, folder: !!item.folder, kind: item.folder ? 'folder' : 'text', size: item.size ? String(item.size) : '', date: item.modTime || '' }))
      } catch (e) {
        const message = e.message || '连接失败'
        this.showToast(message)
        if (this.externalRequest) this.finishExternalRequest({ cancelled: true, error: { code: 'remote-error', message } })
      }
    },
    async setView(view) { this.view = view === 'transfers' ? 'transfers' : 'files'; this.pageTitle = this.view === 'files' ? '文件浏览' : '传输管理'; await this.persistUiState() },
    async selectConnection(id) { this.activeConnectionId = id; this.connectionMenu = false; this.currentPath = '/'; await this.persistUiState(); await this.loadFiles() },
    toggleConnectionMenu() { this.connectionMenu = !this.connectionMenu },
    refreshFiles() { this.loadFiles() },
    async toggleSort() { this.sortAsc = !this.sortAsc; await this.persistUiState() },
    goUp() {
      if (this.currentPath === '/') return
      const parts = this.currentPath.split('/').filter(Boolean)
      parts.pop()
      this.currentPath = parts.length ? '/' + parts.join('/') : '/'
      this.loadFiles()
    },
    currentLaunchOptions() {
      const page = this.$page
      if (!page) return null
      if (page.newOptions && typeof page.newOptions === 'object' && Object.keys(page.newOptions).length) return page.newOptions
      if (page.loadOptions) return page.loadOptions
      return page.options || null
    },
    normalizeExternalRequest(raw) {
      let options = raw
      if (typeof options === 'string') {
        try { options = JSON.parse(options) } catch (e) { return null }
      }
      if (!options || typeof options !== 'object') return null
      const action = String(options.action || '').trim().toLowerCase()
      const requestId = String(options.requestId || '').trim()
      const returnUri = String(options.returnUri || '').trim()
      const downloadDir = String(options.downloadDir || '').trim().replace(/\/+$/, '') || EXTERNAL_DOWNLOAD_ROOT
      const downloadName = String(options.downloadName || '').trim()
      if ((action !== 'select-file' && action !== 'select-folder') || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(requestId) || !returnUri || returnUri.length <= 9 || returnUri.indexOf('falcon://') !== 0 || returnUri.length > 512 || /[\u0000-\u001f\u007f]/.test(requestId + returnUri + downloadDir + downloadName) || downloadDir.length > 480 || !/^\/(tmp|userdisk|userdata)(\/|$)/.test(downloadDir) || downloadDir.indexOf('..') !== -1 || (downloadName && (!/^[^\\/]+$/.test(downloadName) || downloadName === '.' || downloadName === '..' || downloadName.length > 240))) return null
      return { action, requestId, returnUri, downloadDir, downloadName }
    },
    handleExternalRequest(raw) {
      const request = this.normalizeExternalRequest(raw)
      if (!request || request.requestId === this.externalHandledRequestId) return
      this.externalHandledRequestId = request.requestId
      this.externalRequest = request
      this.externalBusy = false
      this.externalSelectedFile = null
      this.view = 'files'
      this.pageTitle = request.action === 'select-folder' ? '选择文件夹' : '选择文件'
      this.currentPath = '/'
      this.connectionMenu = false
      this.fileMenu = null
      this.selectedLocalFile = null
      this.loadFiles()
    },
    openFile(file) {
      if (file.folder) {
        this.currentPath = (this.currentPath === '/' ? '' : this.currentPath) + '/' + (file.rawName || file.name)
        this.loadFiles()
        return
      }
      if (this.externalRequest && this.externalRequest.action === 'select-file') this.externalSelectedFile = file
    },
    confirmExternalFile() {
      if (this.externalRequest && this.externalRequest.action === 'select-file' && this.externalSelectedFile) this.completeExternalSelection(this.externalSelectedFile, false)
    },
    openFileMenu(file) { this.fileMenu = file },
    closeFileMenu() { this.fileMenu = null },
    pathDisplayName(value) {
      const parts = String(value || '').split('/').filter(Boolean)
      const name = parts.length ? parts[parts.length - 1] : '/'
      try { return decodeURIComponent(name) } catch (e) { return name }
    },
    selectCurrentFolder() {
      if (this.externalRequest && this.externalRequest.action === 'select-folder') this.completeExternalSelection(null, true, this.currentPath)
    },
    async completeExternalSelection(file, folder, folderPath) {
      const external = this.externalRequest
      if (!external) return
      if (external.action === 'select-file' && folder) return
      const remotePath = folder ? (folderPath || '/') : this.remoteFilePath(file.rawName || file.name)
      const isFolder = !!folder
      const selected = {
        name: isFolder ? this.pathDisplayName(remotePath) : file.name,
        rawName: isFolder ? '' : (file.rawName || file.name),
        path: remotePath,
        folder: isFolder,
        size: isFolder ? 0 : (Number(file.size) || 0),
        modTime: isFolder ? '' : file.date,
        connection: { name: this.activeConnection.name, type: this.activeConnection.type, host: this.activeConnection.host }
      }
      if (isFolder) {
        this.finishExternalRequest({ cancelled: false, file: selected })
        return
      }
      if (this.externalBusy) return
      this.externalBusy = true
      this.pageTitle = '正在下载'
      const transfer = this.addTransfer(selected.name, 'down', external.downloadDir)
      try {
        const destinationDir = external.downloadDir + '/' + external.requestId
        await this.ensureDirectory(destinationDir)
        const localName = this.localFileName(external.downloadName || selected.name)
        if (!localName) throw new Error('文件名无效')
        const destination = await this.uniqueLocalPath(destinationDir, localName)
        await request(this.activeConfig(), 'download', remotePath, destination)
        this.updateTransfer(transfer, '已下载', destination)
        selected.localPath = destination
        selected.downloaded = true
        this.finishExternalRequest({ cancelled: false, file: selected })
      } catch (e) {
        const message = e.message || '下载失败'
        this.updateTransfer(transfer, '下载失败', message)
        this.finishExternalRequest({ cancelled: true, error: { code: 'download-failed', message } })
      } finally {
        this.externalBusy = false
      }
    },
    cancelExternalRequest() {
      if (!this.externalRequest || this.externalBusy) return
      this.finishExternalRequest({ cancelled: true, error: { code: 'cancelled', message: '用户取消选择' } })
    },
    finishExternalRequest(payload) {
      const external = this.externalRequest
      if (!external) return
      const response = { source: 'cosmos-drive', version: 1, requestId: external.requestId, action: external.action, cancelled: true }
      Object.assign(response, payload || {})
      this.externalRequest = null
      this.pageTitle = '文件浏览'
      closeTextEdit()
      try {
        $falcon.navTo(external.returnUri, response)
        this.$page.finish()
      } catch (e) {
        this.externalRequest = external
        this.showToast(e.message || '无法返回调用方')
      }
    },
    addTransfer(name, direction, detail) {
      const transfer = { id: String(Date.now()) + '-' + String(this.transfers.length), name: String(name || ''), direction: direction === 'up' ? 'up' : 'down', status: direction === 'up' ? '正在上传' : '正在下载', statusClass: 'transfer-running', detail: String(detail || '') }
      this.transfers.unshift(transfer)
      this.persistUiState()
      return transfer
    },
    updateTransfer(transfer, status, detail) {
      if (!transfer) return
      const current = this.transfers.find(item => item.id === transfer.id)
      if (!current) return
      current.status = status
      current.statusClass = status.indexOf('失败') >= 0 ? 'transfer-failed' : status.indexOf('正在') >= 0 ? 'transfer-running' : 'transfer-complete'
      if (detail) current.detail = detail
      this.persistUiState()
    },
    async downloadFile() {
      const file = this.fileMenu
      this.fileMenu = null
      if (!file || file.folder) return this.showToast('文件夹暂不支持下载')
      const localName = this.localFileName(file.name)
      if (!localName) return this.showToast('文件名无效')
      const destination = DOWNLOAD_ROOT + '/' + localName
      const transfer = this.addTransfer(file.name, 'down', destination)
      try {
        if (!(await fs.exists(DOWNLOAD_ROOT))) await fs.mkdir(DOWNLOAD_ROOT)
        await request(this.activeConfig(), 'download', this.remoteFilePath(file.rawName || file.name), destination)
        this.updateTransfer(transfer, '已下载')
        this.showToast('已下载到 ' + DOWNLOAD_ROOT)
      } catch (e) { this.updateTransfer(transfer, '下载失败', e.message || '下载失败'); this.showToast(e.message || '下载失败') }
    },
    renameFile() { this.fileMenu = null; this.showToast('重命名需要本地输入') },
    deleteFile() { this.fileMenu = null; this.showToast('删除请通过核心接口') },
    openLocalBrowser() { $falcon.navTo('local') },
    openAbout() { $falcon.navTo('about') },
    activeConfig() { return this.activeConnection.name ? '@' + this.activeConnection.name : this.activeConnection },
    remoteFilePath(name) { return (this.currentPath === '/' ? '' : this.currentPath) + '/' + name },
    localFileName(name) {
      const value = String(name || '').replace(/[\\/]/g, '_').replace(/[\u0000-\u001f\u007f]/g, '_').trim()
      if (!value || value === '.' || value === '..') return ''
      return value.slice(0, 240)
    },
    async ensureDirectory(directory) {
      const value = String(directory || '').replace(/\/+$/, '')
      if (!/^\/(tmp|userdisk|userdata)(\/|$)/.test(value) || value.indexOf('..') !== -1) throw new Error('下载目录无效')
      const parts = value.split('/').filter(Boolean)
      let current = ''
      for (const part of parts) {
        current += '/' + part
        if (!(await fs.exists(current))) await fs.mkdir(current)
      }
    },
    async uniqueLocalPath(directory, name) {
      let candidate = directory + '/' + name
      if (!(await fs.exists(candidate))) return candidate
      const dot = name.lastIndexOf('.')
      const stem = dot > 0 ? name.slice(0, dot) : name
      const ext = dot > 0 ? name.slice(dot) : ''
      for (let index = 1; index <= 999; index++) {
        candidate = directory + '/' + stem + '_' + index + ext
        if (!(await fs.exists(candidate))) return candidate
      }
      throw new Error('同名文件过多')
    },
    openFolderDialog() { if (!this.activeConnection.name) return this.showToast('请先选择连接'); this.folderName = ''; this.folderDialogOpen = true },
    closeFolderDialog() { this.folderDialogOpen = false; this.folderName = ''; closeTextEdit() },
    async focusFolderInput() {
      if (!this.inputMethodReady || !this.inputMethodAvailable) return
      this.inputField = 'folderName'
      const uuid = await startTextEdit({ text: this.folderName, placeholder: '文件夹名称', maxlength: 96, inputType: 'text', autofocus: true, showCursor: true, multiLinesEditVisible: false, enterButtonText: '完成' }, (text) => {
        if (this.inputField === 'folderName') this.folderName = text
      })
      if (!uuid) this.inputMethodAvailable = false
    },
    onFolderInput(event) {
      let value = event
      if (value && typeof value === 'object') {
        if (typeof value.value === 'string') value = value.value
        else if (value.target && typeof value.target.value === 'string') value = value.target.value
        else if (value.target && value.target.attr && typeof value.target.attr.value === 'string') value = value.target.attr.value
      }
      if (typeof value === 'string') this.folderName = value
    },
    async saveFolder() {
      const name = String(this.folderName || '').trim()
      if (!name) return this.showToast('请输入文件夹名称')
      if (name.indexOf('/') >= 0 || name.indexOf('\\') >= 0 || name.indexOf('..') >= 0) return this.showToast('文件夹名称无效')
      try {
        await request(this.activeConfig(), 'mkdir', this.remoteFilePath(name), '')
        this.closeFolderDialog()
        await this.loadFiles()
        this.showToast('文件夹已创建')
      } catch (e) { this.showToast(e.message || '创建文件夹失败') }
    },
    async startUpload() {
      const local = this.selectedLocalFile
      if (!local) return this.openLocalBrowser()
      const transfer = this.addTransfer(local.name, 'up', this.remoteFilePath(local.name))
      try {
        await request(this.activeConfig(), 'upload', this.remoteFilePath(local.name), local.path)
        this.selectedLocalFile = null
        this.updateTransfer(transfer, '已上传')
        await this.loadFiles()
        this.showToast('上传完成')
      } catch (e) { this.updateTransfer(transfer, '上传失败', e.message || '上传失败'); this.showToast(e.message || '上传失败') }
    },
    openConnectionDrawer() { this.connectionMenu = false; this.drawerOpen = true },
    closeConnectionDrawer() { this.drawerOpen = false; this.inputField = ''; closeTextEdit() },
    async focusInput(field) {
      if (!this.inputMethodReady || !this.inputMethodAvailable) return
      this.inputField = field
      const current = this.form[field] || ''
      const uuid = await startTextEdit({ text: current, placeholder: field === 'name' ? '连接名称' : field === 'host' ? '服务器地址' : field === 'user' ? '用户名' : '密码', maxlength: field === 'host' ? 192 : 96, inputType: field === 'password' ? 'password' : 'text', autofocus: true, showCursor: true, multiLinesEditVisible: false, enterButtonText: '完成' }, (text) => {
        if (this.inputField === field) this.form[field] = text
      })
      if (!uuid) this.inputMethodAvailable = false
    },
    onInput(field, event) {
      let value = event
      if (value && typeof value === 'object') {
        if (typeof value.value === 'string') value = value.value
        else if (value.target && typeof value.target.value === 'string') value = value.target.value
        else if (value.target && value.target.attr && typeof value.target.attr.value === 'string') value = value.target.attr.value
      }
      if (typeof value === 'string') this.form[field] = value
    },
    async saveConnection() {
      if (!this.form.name || !this.form.host) return this.showToast('请填写名称和服务器地址')
      try {
        const savedName = this.form.name
        await saveConfig({ ...this.form, basePath: '/', tls: this.form.type === 'WebDAV' && /^https:\/\//.test(this.form.host) })
        this.activeConnectionId = savedName
        this.closeConnectionDrawer()
        this.form = { type: 'WebDAV', name: '', host: '', user: '', password: '' }
        await this.loadProfiles()
        this.showToast('连接已保存')
      } catch (e) { this.showToast(e.message || '保存失败') }
    },
    showToast(message) { this.toast = message; this.$page.setTimeout(() => { this.toast = '' }, 1800) },
    fileIcon(kind) { return { text: '文本', archive: '压缩', pdf: '文档', code: '代码' }[kind] || '文件' },
    noop() {}
  }
}
</script>

<style lang="less" scoped>
@import "base.less";
@primary:#004a77; @on-primary:#c2e7ff; @surface:#080a0c; @surface2:#1a1b1f; @surface3:#24252a; @text:#e3e3e3; @muted:#b8bbb9; @line:#8e918f; @accent:#c2e7ff; @danger:#ffd6db;
.screen{position:fixed;left:0;top:0;width:100vw;height:100vh;flex-direction:row;background-color:@surface;color:@text;overflow:hidden}
.rail{width:34vh;min-width:34vh;height:100vh;overflow:hidden;padding-top:4vh;padding-left:3vh;padding-right:3vh;padding-bottom:3vh;background-color:#0b1211;align-items:center}
.brand-mark{width:16vh;height:16vh;border-radius:5vh;background-color:@primary;align-items:center;justify-content:center;margin-bottom:3vh}
.brand-glyph{font-size:12vh;color:@on-primary;font-weight:bold}
.rail-button{position:relative;width:28vh;height:18vh;border-radius:6vh;align-items:center;justify-content:center;margin-bottom:2vh}
.rail-active{background-color:@surface3}.rail-icon{font-size:12vh;color:@muted}.rail-icon-active{color:@primary}.rail-label{font-size:7vh;color:@muted}.rail-label-active{color:@text}.rail-badge{position:absolute;right:1vh;top:1vh;font-size:7vh;color:@on-primary;background-color:@accent;border-radius:4vh;padding-left:2vh;padding-right:2vh}.rail-spacer{flex:1}
.workspace{flex:1;height:96vh;overflow:hidden;padding-top:2vh;padding-right:3vh;padding-bottom:2vh;padding-left:3vh}
.topbar{height:18vh;flex-direction:row;align-items:center}.eyebrow{font-size:7vh;color:@muted}.page-title{font-size:12vh;color:@text;font-weight:bold}.top-actions{margin-left:auto;flex-direction:row;align-items:center}
.connection-pill{height:16vh;min-width:65vh;padding-left:4vh;padding-right:4vh;border-width:1px;border-style:solid;border-color:@line;border-radius:6vh;background-color:@surface2;flex-direction:row;align-items:center}.status-dot{width:4vh;height:4vh;border-radius:2vh;background-color:@muted;margin-right:3vh}.online{background-color:@primary}.offline{background-color:@muted}.connection-name{font-size:10vh;color:@text}.connection-type{font-size:7vh;color:@muted;margin-left:3vh}.chevron{font-size:10vh;color:@muted;margin-left:auto}
.icon-action{width:22vh;height:18vh;margin-left:3vh;border-radius:6vh;background-color:@surface2;border-width:1px;border-style:solid;border-color:@line;align-items:center;justify-content:center}.icon-action-text{font-size:7vh;color:@primary}
.files-view{flex:1;height:0;overflow:hidden}.content-grid{flex:1;height:0;overflow:hidden;flex-direction:row}.connections-panel{width:88vh;min-width:88vh;height:100%;background-color:@surface2;border-radius:6vh;padding:4vh;margin-right:4vh}.panel-head{height:12vh;flex-direction:row;align-items:center}.panel-title{font-size:12vh;color:@text;font-weight:bold}.panel-count{font-size:8vh;color:@muted;margin-left:3vh}.connection-scroller{flex:1;height:0}.connection-row{height:18vh;border-radius:5vh;padding-left:3vh;padding-right:3vh;flex-direction:row;align-items:center;margin-bottom:2vh}.connection-selected{background-color:@surface3}.connection-icon{width:13vh;height:13vh;border-radius:4vh;align-items:center;justify-content:center;background-color:#2d4b49;margin-right:3vh}.ftp{background-color:#4b3d2b}.connection-icon-text{font-size:9vh;color:@primary;font-weight:bold}.ftp-text{color:@accent}.connection-meta{flex:1}.row-name{font-size:9vh;color:@text}.row-sub{font-size:6vh;color:@muted}.row-status{font-size:6vh;color:@muted}.online-text{color:@primary}.new-connection{height:12vh;border-top-width:1px;border-top-style:solid;border-top-color:@line;flex-direction:row;align-items:center;color:@primary;font-size:8vh}.new-plus{font-size:12vh;margin-right:2vh}
.file-panel{flex:1;height:100%}.pathbar{height:14vh;flex-direction:row;align-items:center;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:@line}.path-back{width:14vh;height:14vh;border-radius:5vh;background-color:@surface2;align-items:center;justify-content:center;margin-right:3vh}.path-back-text{font-size:10vh;color:@muted}.path-root{font-size:7vh;color:@muted}.path-sep{font-size:7vh;color:@muted;margin-left:2vh;margin-right:2vh}.path-current{font-size:8vh;color:@text}.path-spacer{flex:1}.search-box{width:55vh;height:13vh;border-width:1px;border-style:solid;border-color:@line;border-radius:5vh;background-color:@surface2;flex-direction:row;align-items:center;padding-left:3vh;padding-right:3vh}.search-icon{font-size:10vh;color:@muted;margin-right:2vh}.search-input{flex:1;font-size:8vh;color:@text;background-color:transparent;border-width:0}.sort-control{width:18vh;height:13vh;margin-left:3vh;border-width:1px;border-style:solid;border-color:@line;border-radius:5vh;align-items:center;justify-content:center;color:@muted;font-size:7vh}
.file-toolbar{min-height:0;height:auto;flex-direction:row;align-items:center}.toolbar-spacer{flex:1}.toolbar-action{height:14vh;padding-left:4vh;padding-right:4vh;border-radius:5vh;flex-direction:row;align-items:center;justify-content:center;color:@muted;font-size:9vh;margin-left:3vh}.toolbar-primary{background-color:@primary;color:@on-primary}.upload-icon{font-size:12vh;margin-right:2vh}
.file-header{height:10vh;padding-left:4vh;padding-right:4vh;flex-direction:row;align-items:center;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:@line}.file-header-text{font-size:7vh;color:@muted}.file-col-name{flex:1}.file-col-size{width:32vh}.file-col-date{width:48vh}.file-scroller{height:22vh}.file-row{height:18vh;padding-left:4vh;padding-right:4vh;flex-direction:row;align-items:center;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:@line}.parent-row{color:@muted}.file-icon{width:13vh;height:13vh;border-radius:4vh;margin-right:3vh;align-items:center;justify-content:center;text-align:center;font-size:9vh;color:@muted;background-color:#283430}.folder{color:@accent;background-color:#403526}.text-kind{color:@primary}.archive-kind{color:#d3a9ed}.pdf-kind{color:#f19090}.code-kind{color:#b6c5ff}.file-name-wrap{flex:1;flex-direction:row;align-items:center}.file-name{font-size:12vh;color:@text}.file-tag{margin-left:3vh;padding-left:2vh;padding-right:2vh;border-radius:3vh;color:@primary;background-color:#23413d;font-size:6vh}.file-size{width:32vh;color:@muted;font-size:9vh}.file-date{width:48vh;color:@muted;font-size:8vh}.more-action{width:14vh;height:14vh;align-items:center;justify-content:center}.more-text{font-size:10vh;color:@muted}.empty-state{height:22vh;align-items:center;justify-content:center}.empty-icon{font-size:10vh;color:@line}.empty-state-text{font-size:10vh;color:@muted}
.statusbar{height:8vh;flex-direction:row;align-items:center}.sync-state{flex-direction:row;align-items:center;font-size:7vh;color:@muted}.sync-dot{margin-right:2vh}.status-time{font-size:7vh;color:@muted;margin-left:4vh}.storage-text{font-size:7vh;color:@muted;margin-left:auto}
.connection-menu{position:absolute;top:25vh;right:8vh;width:90vh;background-color:@surface3;border-width:1px;border-style:solid;border-color:@line;border-radius:6vh;padding:4vh;z-index:10}.menu-title{font-size:9vh;color:@muted}.menu-row{height:16vh;flex-direction:row;align-items:center;font-size:9vh;color:@text}.menu-dot{margin-right:3vh}.menu-type{font-size:7vh;color:@muted;margin-left:auto}
.drawer-overlay{position:absolute;left:0;top:0;width:100vw;height:100vh;background-color:rgba(0,0,0,.52);z-index:20;align-items:flex-end;justify-content:flex-end}.drawer{width:145vh;height:100vh;background-color:@surface2;padding:5vh}.drawer-head{height:15vh;flex-direction:row;align-items:center}.drawer-title{font-size:12vh;color:@text;font-weight:bold}.drawer-close{font-size:12vh;color:@muted;margin-left:auto}.protocol-tabs{height:14vh;flex-direction:row}.protocol-tab{flex:1;align-items:center;justify-content:center;border-bottom-width:2px;border-bottom-style:solid;border-bottom-color:@line;color:@muted;font-size:10vh}.protocol-active{color:@primary;border-color:@primary}.field-label{font-size:7vh;color:@muted;margin-top:2vh}.field-input{height:14vh;padding-left:3vh;padding-right:3vh;border-width:1px;border-style:solid;border-color:@line;border-radius:5vh;background-color:@surface;color:@text;font-size:10vh}.field-row{flex-direction:row}.field-half{flex:1}.second-field{margin-left:4vh}.drawer-actions{height:16vh;flex-direction:row;justify-content:flex-end;align-items:flex-end}.cancel-action{height:14vh;padding-left:5vh;padding-right:5vh;border-radius:5vh;align-items:center;justify-content:center;font-size:10vh;color:@muted;margin-right:3vh}.save-action{height:14vh;padding-left:5vh;padding-right:5vh;border-radius:5vh;align-items:center;justify-content:center;font-size:10vh;background-color:@primary;color:@on-primary}
.file-menu{position:absolute;right:8vh;bottom:10vh;width:90vh;background-color:@surface3;border-width:1px;border-style:solid;border-color:@line;border-radius:6vh;padding:3vh;z-index:12}.menu-file-name{font-size:8vh;color:@muted}.menu-action{height:15vh;align-items:center}.menu-action-text{font-size:9vh;color:@text}.danger-text{color:@danger}.toast{position:absolute;bottom:5vh;left:40vw;padding:4vh;border-radius:5vh;background-color:@surface3;z-index:30}.toast-text{font-size:9vh;color:@text}
.about-dialog{position:absolute;left:0;top:0;width:100vw;height:100vh;background-color:rgba(0,0,0,.5);align-items:center;justify-content:center;z-index:25}.about-card{width:130vh;padding:6vh;border-radius:8vh;background-color:@surface2;align-items:center}.about-title{font-size:12vh;color:@primary;font-weight:bold}.about-copy{font-size:9vh;color:@text}.about-spec{align-items:center;margin-top:4vh;margin-bottom:4vh}.about-spec-line{font-size:8vh;color:@muted;text-align:center}.save-text{font-size:10vh;color:@on-primary}
.simple-view{flex:1;height:72vh}.simple-header{height:16vh;flex-direction:row;align-items:center;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:@line}.section-title{font-size:12vh;color:@text;font-weight:bold}.section-note{font-size:8vh;color:@muted;margin-left:4vh}.transfer-card{height:20vh;border-radius:6vh;background-color:@surface2;margin-top:3vh;padding:4vh;flex-direction:row;align-items:center}.setting-row{height:22vh;border-radius:6vh;background-color:@surface2;margin-top:3vh;padding:4vh;flex-direction:row;align-items:center;justify-content:space-between}.transfer-icon{font-size:12vh;color:@primary;margin-right:4vh}.transfer-info{flex:1}.transfer-name{font-size:12vh;color:@text}.setting-name{font-size:12vh;color:@text}.transfer-detail{font-size:8vh;color:@muted}.setting-desc{font-size:8vh;color:@muted}.transfer-progress{font-size:10vh;color:@primary}.settings-view{width:250vh}.toggle{width:32vh;height:18vh;border-radius:6vh;background-color:@line;padding:1vh;justify-content:center}.toggle-on{background-color:#35645d}.toggle-thumb{width:16vh;height:16vh;border-radius:100vh;background-color:@muted;align-self:flex-start}.toggle-thumb-on{background-color:@primary;align-self:flex-end}
.rail-button:active,.icon-action:active,.connection-row:active,.new-connection:active,.toolbar-action:active,.save-action:active,.cancel-action:active,.protocol-tab:active,.menu-row:active,.file-row:active{opacity:.6}
.rail{width:39vh;min-width:39vh;height:100vh;padding-top:7vh;padding-right:12vh;padding-bottom:7vh;padding-left:5vh;justify-content:space-between;background-color:@surface}
.rail-button{width:20vh;height:20vh;margin-bottom:0;border-radius:7vh;background-color:@surface2;align-items:center;justify-content:center}
.rail-active{background-color:@primary}
.rail-image{width:12vh;height:12vh}
.rail-badge{right:-2vh;top:-2vh;font-size:7vh;color:@on-primary;background-color:@primary}
.workspace{background-color:@surface}
.eyebrow{color:@muted}.page-title{color:@text}.connection-name{color:@text}.connection-type{color:@muted}.chevron{color:@muted}
.connections-panel{background-color:@surface2}.panel-title{color:@text}.panel-count{color:@muted}.connection-selected{background-color:@surface3}.row-name{color:@text}.row-sub{color:@muted}.row-status{color:@muted}.new-connection-text{font-size:8vh;color:@on-primary}
.connection-icon-text{color:@on-primary}.online-text{color:@on-primary}.new-plus{color:@on-primary}.icon-action-text{color:@on-primary}
.file-panel{flex:1;height:0}.pathbar{height:12vh}.path-scroller{flex:1;height:10vh}.path-current{font-size:9vh;color:@muted}.file-toolbar{min-height:0;height:auto}.toolbar-label{font-size:9vh;color:@text}.upload-label{font-size:10vh;color:@on-primary}.toolbar-primary{background-color:@primary}.upload-icon{color:@on-primary}
.file-scroller{flex:1;height:0;padding-right:3vh}.file-card{min-height:30vh;background-color:@surface2;border-radius:6vh;padding-top:3vh;padding-right:7vh;padding-bottom:3vh;padding-left:7vh;margin-bottom:4vh;flex-direction:row;align-items:center}.file-card-icon{width:15vh;height:15vh;margin-right:6vh}.file-card-content{flex:1}.file-name{font-size:10vh;color:@text}.file-meta{font-size:7vh;color:@muted;margin-top:2vh}.more-text{font-size:10vh;color:@muted}.empty-state{height:30vh}.empty-state-text{font-size:12vh;color:@muted}
.menu-name{font-size:9vh;color:@text}.menu-title{color:@muted}.menu-type{color:@muted}
.drawer{width:145vh;height:100vh;padding:0;background-color:@surface2;overflow:hidden}.drawer-scroller{height:100vh;padding-top:5vh;padding-right:5vh;padding-bottom:8vh;padding-left:5vh}.drawer-title{color:@text}.drawer-close{color:@text}.protocol-text{font-size:10vh;color:@text}.field-label{color:@text}.field-input{color:@text;background-color:@surface}.cancel-text{font-size:10vh;color:@text}.save-text{font-size:10vh;color:@on-primary}.save-action{background-color:@primary}
.section-title{color:@text}.section-note{color:@muted}.transfer-name{color:@text}.setting-name{color:@text}.transfer-detail{color:@muted}.setting-desc{color:@muted}
.page-title{font-size:11vh}.panel-title{font-size:11vh}.path-current{font-size:9vh}.file-name{font-size:9vh}.drawer-title{font-size:11vh}.field-input{font-size:9vh}.section-title{font-size:11vh}.transfer-name{font-size:11vh}.setting-name{font-size:11vh}.about-title{font-size:11vh}.about-copy{font-size:8vh}.about-spec-line{font-size:7vh}.save-text{font-size:9vh}
.page-title{font-size:10vh}.connection-name{font-size:9vh}.connection-type{font-size:8vh}.panel-title{font-size:10vh}.panel-count{font-size:8vh}.row-name{font-size:9vh}.row-sub{font-size:8vh}.row-status{font-size:8vh}.path-current{font-size:9vh}.toolbar-label{font-size:9vh}.upload-label{font-size:9vh}.file-name{font-size:9vh}.file-meta{font-size:8vh}.drawer-title{font-size:10vh}.protocol-text{font-size:9vh}.field-input{font-size:9vh}.cancel-text{font-size:9vh}.save-text{font-size:9vh}.section-title{font-size:10vh}.section-note{font-size:8vh}.transfer-name{font-size:10vh}.setting-name{font-size:10vh}.about-title{font-size:10vh}.about-copy{font-size:8vh}.about-spec-line{font-size:8vh}
.files-view{flex:1;height:0}.content-grid{flex:1;height:0}.connections-panel{height:100%}.connection-scroller{flex:1;height:0}.file-panel{flex:1;height:100%}.file-scroller{flex:1;height:0}.file-card{min-height:20vh;padding-top:2vh;padding-right:5vh;padding-bottom:2vh;padding-left:5vh;margin-bottom:2vh}.file-card-icon{width:12vh;height:12vh;margin-right:4vh}.file-meta{margin-top:1vh}
.selected-local{flex:1;height:12vh;margin-left:3vh;overflow:hidden}.selected-local-text{font-size:8vh;color:@accent}.local-overlay{position:absolute;left:0;top:0;width:100vw;height:100vh;background-color:rgba(0,0,0,.56);z-index:22;align-items:center;justify-content:center}.local-browser{width:145vh;height:88vh;background-color:@surface2;border-radius:6vh;padding:4vh}.local-head{height:15vh;flex-direction:row;align-items:center}.local-head-back{width:13vh;height:13vh;border-radius:5vh;background-color:@surface3;align-items:center;justify-content:center;margin-right:3vh}.local-back-text{font-size:12vh;color:@text}.local-head-copy{flex:1;height:15vh}.local-title{font-size:10vh;color:@text;font-weight:bold}.local-path-scroller{height:6vh}.local-path{font-size:7vh;color:@muted}.local-close{width:13vh;height:13vh;align-items:center;justify-content:center}.local-close-text{font-size:12vh;color:@muted}.local-scroller{flex:1;height:0}.local-row{height:15vh;border-radius:4vh;flex-direction:row;align-items:center;padding-left:3vh;padding-right:3vh;margin-bottom:1vh}.local-selected{background-color:@surface3}.local-parent{background-color:@surface3}.local-icon{width:10vh;height:10vh;margin-right:3vh}.local-copy{flex:1}.local-name{font-size:9vh;color:@text}.local-meta{font-size:7vh;color:@muted;margin-top:1vh}.local-empty{height:20vh;align-items:center;justify-content:center}.local-empty-text{font-size:9vh;color:@muted}
/* Text labels replace icon glyphs so they render on the device font set. */
.icon-action{width:22vh}
.icon-action-text{font-size:7vh;color:@on-primary}
.chevron{font-size:8vh}
.path-back-text{font-size:7vh}
.file-card-main{flex:1;min-width:0;flex-direction:row;align-items:center}
.more-text{font-size:7vh}
.transfer-icon{font-size:7vh}
.drawer-close{font-size:7vh}
.file-menu-overlay{position:absolute;left:0;top:0;width:100vw;height:100vh;z-index:11}
.menu-action:active{opacity:.6}
.simple-view{height:0;overflow:hidden;flex-direction:column}
.transfer-scroller{flex:1;height:0;padding-right:2vh}
.transfer-status{min-width:28vh;text-align:right;font-size:8vh;color:@primary}
.transfer-running{color:@accent}.transfer-complete{color:@primary}.transfer-failed{color:@danger}
.transfer-empty{height:28vh;align-items:center;justify-content:center}.transfer-empty-text{font-size:9vh;color:@muted}
.folder-overlay{position:absolute;left:0;top:0;width:100vw;height:100vh;background-color:rgba(0,0,0,.56);z-index:24;align-items:center;justify-content:center}
.folder-dialog{width:112vh;background-color:@surface2;border-radius:6vh;padding:6vh}
.folder-dialog-title{height:14vh;flex-direction:row;align-items:center}.folder-title{font-size:11vh;color:@text;font-weight:bold}.folder-close{font-size:8vh;color:@muted;margin-left:auto}
.folder-label{font-size:8vh;color:@muted;margin-top:3vh}.folder-input{height:15vh;margin-top:2vh;padding-left:3vh;padding-right:3vh;border-width:1px;border-style:solid;border-color:@line;border-radius:5vh;background-color:@surface;color:@text;font-size:9vh}
.folder-actions{height:16vh;flex-direction:row;justify-content:flex-end;align-items:flex-end;margin-top:4vh}
.folder-top-action{width:40vh}
.protocol-tab{background-color:@surface3;border-width:1px;border-style:solid;border-color:@line;border-radius:4vh;margin-right:2vh}
.protocol-active{background-color:@primary;border-color:@primary}
.protocol-text-active{color:@on-primary}
.picker-file-action{width:20vh}
.external-file-selected{background-color:@primary}
.external-file-name{color:@on-primary}
.external-file-meta{color:@on-primary}
</style>
