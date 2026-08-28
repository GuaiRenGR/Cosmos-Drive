<template>
  <div class="screen">
    <div class="rail">
      <div class="rail-button rail-active" @click="goBack"><image class="rail-image" :src="require('../../assets/nav-files.png?base64')" /></div>
    </div>
    <div class="workspace">
      <div class="topbar"><div class="back-action" @click="goBack"><text class="back-text">返回</text></div><div><text class="page-title">本地文件</text></div><div class="top-actions"><div class="local-path-pill"><scroller class="local-path-inner" scroll-direction="horizontal" show-scrollbar="false"><text class="local-path-text">{{ localPath }}</text></scroller></div></div></div>
      <scroller class="local-scroller" scroll-direction="vertical" show-scrollbar="false" over-scroll="50px" over-fling="50px">
        <div v-if="localPath !== localRoot" class="local-row local-parent" @click="goLocalUp"><image class="local-icon" :src="require('../../assets/folder-icon.png?base64')" /><text class="local-name">返回上级目录</text></div>
        <div v-for="entry in localFiles" :key="entry.path" class="local-row" @click="openLocalEntry(entry)"><image class="local-icon" :src="entry.folder ? require('../../assets/folder-icon.png?base64') : require('../../assets/file-icon.png?base64')" /><div class="local-copy"><text class="local-name">{{ entry.name }}</text><text class="local-meta">{{ entry.folder ? '文件夹' : '文件' }}</text></div></div>
        <div v-if="localFiles.length === 0" class="local-empty"><text class="local-empty-text">{{ localLoading ? '读取中' : '此目录为空' }}</text></div>
      </scroller>
    </div>
    <div v-if="toast" class="toast"><text class="toast-text">{{ toast }}</text></div>
  </div>
</template>

<script>
import fs from 'fs'
import { setSelectedLocalFile } from '../../utils/local-selection.js'

const LOCAL_ROOT = '/userdisk/Favorite'

export default {
  name: 'local',
  data() {
    return { localRoot: LOCAL_ROOT, localPath: LOCAL_ROOT, localFiles: [], localLoading: false, toast: '' }
  },
  async created() { await this.loadLocalFiles() },
  methods: {
    localJoin(base, name) { return (base === '/' ? '' : base.replace(/\/$/, '')) + '/' + name },
    async loadLocalFiles() {
      this.localLoading = true
      try {
        const entries = await fs.readdir(this.localPath, { withFileTypes: true })
        this.localFiles = entries.map(entry => ({ name: entry.name, folder: entry.isDirectory(), path: this.localJoin(this.localPath, entry.name) })).sort((a, b) => a.folder !== b.folder ? (a.folder ? -1 : 1) : a.name.localeCompare(b.name))
      } catch (e) { this.localFiles = []; this.showToast(e.message || '读取目录失败') }
      finally { this.localLoading = false }
    },
    async openLocalEntry(entry) {
      if (entry.folder) { this.localPath = entry.path; await this.loadLocalFiles(); return }
      setSelectedLocalFile(entry)
      this.$page.finish()
    },
    async goLocalUp() {
      if (this.localPath === this.localRoot) return
      const parts = this.localPath.split('/').filter(Boolean)
      parts.pop()
      this.localPath = '/' + parts.join('/')
      if (!this.localPath || this.localPath.indexOf(this.localRoot) !== 0) this.localPath = this.localRoot
      await this.loadLocalFiles()
    },
    goBack() { this.$page.finish() },
    showToast(message) { this.toast = message; this.$page.setTimeout(() => { this.toast = '' }, 1800) }
  }
}
</script>

<style lang="less" scoped>
@import "../../styles/base.less";
@primary:#004a77; @on-primary:#c2e7ff; @surface:#080a0c; @surface2:#1a1b1f; @surface3:#24252a; @text:#e3e3e3; @muted:#b8bbb9; @line:#8e918f;
.screen{position:fixed;left:0;top:0;width:100vw;height:100vh;flex-direction:row;background-color:@surface;color:@text;overflow:hidden}
.rail{width:39vh;min-width:39vh;height:100vh;padding-top:7vh;padding-right:12vh;padding-bottom:7vh;padding-left:5vh;background-color:@surface;align-items:center}
.rail-button{width:20vh;height:20vh;border-radius:7vh;background-color:@surface2;align-items:center;justify-content:center}
.rail-active{background-color:@primary}.rail-image{width:12vh;height:12vh}
.workspace{flex:1;height:96vh;overflow:hidden;padding-top:2vh;padding-right:3vh;padding-bottom:2vh;padding-left:3vh}
.topbar{height:18vh;flex-direction:row;align-items:center}.page-title{font-size:11vh;color:@text;font-weight:bold}.top-actions{margin-left:auto;flex-direction:row;align-items:center}
.back-action{height:14vh;min-width:24vh;padding-left:3vh;padding-right:3vh;margin-right:4vh;border-radius:5vh;background-color:@primary;align-items:center;justify-content:center}.back-text{font-size:8vh;color:@on-primary}
.local-path-pill{height:14vh;min-width:80vh;padding-left:4vh;padding-right:4vh;border-width:1px;border-style:solid;border-color:@line;border-radius:6vh;background-color:@surface2;align-items:center}.local-path-inner{flex:1;height:10vh}.local-path-text{font-size:8vh;color:@muted}
.local-scroller{flex:1;height:0;padding-right:3vh}.local-row{height:22vh;border-radius:6vh;background-color:@surface2;flex-direction:row;align-items:center;padding-left:5vh;padding-right:5vh;margin-bottom:2vh}.local-parent{background-color:@surface3}.local-icon{width:14vh;height:14vh;margin-right:5vh}.local-copy{flex:1}.local-name{font-size:10vh;color:@text}.local-meta{font-size:7vh;color:@muted;margin-top:1vh}.local-empty{height:24vh;align-items:center;justify-content:center}.local-empty-text{font-size:9vh;color:@muted}.toast{position:absolute;left:50vh;right:50vh;bottom:6vh;padding:3vh;background-color:@surface3;border-radius:5vh;border-width:1px;border-style:solid;border-color:@line;align-items:center;justify-content:center}.toast-text{font-size:9vh;color:@text}
.rail-button:active,.back-action:active,.local-row:active{opacity:.6}
</style>
