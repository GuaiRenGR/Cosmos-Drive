<template>
  <div class="page">
    <text class="title">{{ msg }}</text>
    <!-- 图片资源放 assets/，引用：
         :src="require('../../assets/img/logo.png?base64')"  // 内联 base64 快
         :src="require('../../assets/img/logo.png')"         // 路径引用
         :src="require('http://x/logo.png?download')"        // 编译期下载到包
         ⚠️ image 必须同时设 width+height+src 否则不渲染 -->
    <div class="btn" @click="toggle">
      <text>{{ open ? 'ON' : 'OFF' }}</text>
    </div>
    <div class="row">
      <text class="label">内存:</text>
      <text class="value">{{ mem }}</text>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageIndex",
  props: [],
  data() {
    return {
      msg: "hello falcon",
      open: false,
      mem: "—",
      timerId: 0,
      linkToken: 0,
    };
  },
  created() {
    this.linkToken = this.$page.on("LINK_CHANGE", this.onLink);
  },
  mounted() {
    this.startTimer();
  },
  computed: {
    hours() {
      return this.msg.length;
    },
  },
  watch: {
    open(nv) {
      // 子→父事件：父级 @result="cb"
      this.$emit("result", nv);
    },
  },
  methods: {
    onShow() {
      this.startTimer();
    },
    onHide() {
      this.stopTimer();
    },
    onUnload() {
      this.stopTimer();
    },
    toggle() {
      this.open = !this.open;
    },
    startTimer() {
      if (!this.timerId) this.timerId = this.$page.setInterval(this.tick, 1000);
    },
    stopTimer() {
      if (this.timerId) this.$page.clearInterval(this.timerId);
      this.timerId = 0;
    },
    onLink(e) {
      // e.type / e.timestamp / e.data
      console.log(e.type, e.data);
    },
    tick() {
      // MVVM 变更会自动刷 UI
      this.msg = "tick " + Date.now();
    },
  },
  beforeDestroy() {
    this.stopTimer();
    if (this.linkToken) this.$page.off("LINK_CHANGE", this.linkToken);
    this.linkToken = 0;
  },
};
</script>

<style lang="less" scoped>
@import "base.less";

.page {
  align-items: center;
  justify-content: center;
  background-color: @background-color;
}

.title {
  font-size: 40px;
  color: @text-color;
  lines: 1;
  text-overflow: ellipsis;
}

.btn {
  flex-direction: row;
  padding: 20px;
  border-radius: @radius-medium;
  background-color: @primary;
}

.btn:active {
  opacity: 0.6;
}

.row {
  flex-direction: row;
  margin-top: 16px;
}

.label {
  font-size: 28px;
  color: @text-color;
  margin-right: 8px;
}

.value {
  font-size: 28px;
  color: @primary;
}
</style>
