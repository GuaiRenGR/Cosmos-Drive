<template>
  <div class="screen">
    <div class="rail">
      <div class="rail-button" @click="goBack"><image class="rail-image" :src="require('../../assets/nav-info.png?base64')" /></div>
    </div>
    <div class="workspace">
      <div class="topbar"><div class="back-action" @click="goBack"><text class="back-text">返回</text></div><text class="page-title">关于</text></div>
      <scroller class="about-scroller" scroll-direction="vertical" show-scrollbar="false" over-scroll="50px" over-fling="50px">
        <div class="about-card">
          <text class="about-title">Cosmos Drive</text>
          <text class="about-copy">远程文件管理器</text>
          <text class="about-copy">支持 WebDAV 和 FTP 文件传输</text>
          <div class="about-divider"></div>
          <div class="about-row"><text class="about-label">运行环境</text><text class="about-value">词典笔 Linux ARMv7</text></div>
          <div class="about-row"><text class="about-label">配置文件</text><text class="about-value">用户盘 Cosmos Drive 目录</text></div>
          <div class="about-row"><text class="about-label">下载目录</text><text class="about-value">用户盘 downloads 目录</text></div>
          <div class="about-divider"></div>
          <text class="about-note">文件操作由本地核心服务执行</text>
          <text class="about-note">连接信息只保存在词典笔本地</text>
          <div class="back-action about-back" @click="goBack"><text class="back-text">返回文件</text></div>
        </div>
      </scroller>
    </div>
  </div>
</template>

<script>
export default {
  name: 'about',
  methods: {
    goBack() { this.$page.finish() }
  }
}
</script>

<style lang="less" scoped>
@import "../../styles/base.less";
@primary:#004a77; @on-primary:#c2e7ff; @surface:#080a0c; @surface2:#1a1b1f; @surface3:#24252a; @text:#e3e3e3; @muted:#b8bbb9; @line:#8e918f;
.screen{position:fixed;left:0;top:0;width:100vw;height:100vh;flex-direction:row;background-color:@surface;overflow:hidden}
.rail{width:39vh;min-width:39vh;height:100vh;padding-top:7vh;padding-right:12vh;padding-bottom:7vh;padding-left:5vh;background-color:@surface;align-items:center}
.rail-button{width:20vh;height:20vh;border-radius:7vh;background-color:@surface2;align-items:center;justify-content:center}
.rail-active{background-color:@primary}.rail-image{width:12vh;height:12vh}
.workspace{flex:1;height:96vh;overflow:hidden;padding-top:2vh;padding-right:3vh;padding-bottom:2vh;padding-left:3vh}
.topbar{height:18vh;flex-direction:row;align-items:center}.page-title{font-size:11vh;color:@text;font-weight:bold}.top-actions{margin-left:auto;flex-direction:row;align-items:center}
.back-action{height:16vh;min-width:24vh;padding-left:4vh;padding-right:4vh;margin-right:4vh;border-radius:6vh;background-color:@primary;align-items:center;justify-content:center}.back-text{font-size:8vh;color:@on-primary}
.about-scroller{flex:1;height:0;padding-right:3vh}.about-card{background-color:@surface2;border-radius:6vh;padding-top:8vh;padding-right:10vh;padding-bottom:8vh;padding-left:10vh;align-items:flex-start}.about-title{font-size:14vh;color:@on-primary;font-weight:bold}.about-copy{font-size:10vh;color:@text;margin-top:3vh}.about-divider{height:1px;width:100%;background-color:@line;margin-top:6vh;margin-bottom:4vh}.about-row{width:100%;min-height:14vh;flex-direction:row;align-items:center}.about-label{width:35vh;font-size:9vh;color:@muted}.about-value{flex:1;font-size:9vh;color:@text}.about-note{font-size:8vh;color:@muted;margin-top:2vh}.about-back{margin-top:7vh;align-self:flex-end}
.rail-button:active,.back-action:active{opacity:.6}
</style>
