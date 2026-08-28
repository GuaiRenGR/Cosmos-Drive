# 有道词典笔 Falcon Runtime

本参考只描述在有道词典笔上反复验证有价值的 Falcon/QuickJS 模式。API 名称和签名仍以目标固件画像为准。

## App、Page 与 Vue 生命周期

保持 `app.js` 简单：

```js
import { BasePage } from './base-page.js'

class App extends $falcon.App {
  onLaunch(options) {
    super.onLaunch(options)
    this.setViewPort(DESIGN_WIDTH) // 从设备/项目 profile 取得
    $falcon.useDefaultBasePageClass(BasePage)
  }
  onShow() { super.onShow() }
  onHide() { super.onHide() }
  onDestroy() { super.onDestroy() }
}
export default App
```

让 BasePage 统一跟踪 `$falcon.on` token、timeout 和 interval，并在 `onUnload` 的 `finally` 中释放。根 Vue 页面使用以下 method 钩子：

```js
methods: {
  onShow() {},
  onHide() {},
  onUnload() {},
}
```

不要把旧示例中的 `$page.on('show')` 当成稳定契约；先读当前 BasePage 实现。子组件需要页面状态时，由根组件传递或使用项目自定义事件，并保证 on/off 成对。

## UI 与 CSS

- 文字必须放 `<text>`；`<div>` 默认不滚动；`<scroller>` 显式设置宽高和方向。
- `<image>` 同时设置 `src`、`width`、`height`；关键小图可按构建器支持使用 `?base64`。
- 使用 `px/rpx/%/vw/vh` 中经当前构建器验证的单位；不要依赖完整 Web CSS。
- 竖排/横排显式写 `flex-direction`，不要依赖版本间可能变化的默认值。
- 使用单 class 选择器；用 `activeClass` 等完整 class 名切状态，不写后代或复合选择器。
- 单角圆角拆成 `border-top-left-radius` 等属性；多值简写在部分编译器会失败。
- 给按钮、棋盘、工具栏、输入区域等固定格式控件稳定宽高，状态 class 不改变几何。
- 需要滚动的大列表分批渲染，但不要因此截断持久化数据。

模拟器只能验证可模拟的 UI。`<hole>`、系统输入法、原生 `.so`、DRM/KMS、MPP、真实 storage/net 差异必须真机验证。

## 系统输入法状态机

复用单例并保存 handler：

```js
import globalModule from 'global'

let manager = null
function getInputManager() {
  if (!manager) manager = new globalModule.Global()
  return manager
}

function normalizeText(value) {
  if (value && typeof value === 'object') {
    if (typeof value.value === 'string') return value.value
    if (typeof value.text === 'string') return value.text
  }
  return typeof value === 'string' ? value : ''
}
```

会话顺序：

1. mounted 时 `textEditFinished.on(handler)`。
2. 打开前关闭旧 UUID；调用 `startTextEdit(JSON.stringify(config))`，同步保存返回 UUID。
3. 回调先验证 UUID，再 parse JSON；仅确认路径写回文本。
4. 完成业务处理后立刻 `closeTextEdit(uuid)`，再清本地状态。
5. beforeDestroy 时先 `off(handler)`，再关闭残留会话。

常用配置包括 `text`、`placeholder`、`maxlength`、`inputType`、`autofocus`、`showCursor`、`cursorColor`、`cursorSize`、`multiLinesEditVisible`、`enterButtonText`。只把在目标固件实测过的枚举投入生产；`EnUSPreferred` 较常见，其他 inputType 仍需验证。

不要业务侧 trigger `requestIMAppShow`。这是输入法内部链路，不是稳定公共 API。

## Storage 兼容层

不同运行时可能提供：

- `$falcon.jsapi.storage.getItem/setItem({key,value})`
- `$falcon.jsapi.storage.getStorage/setStorage(...)`
- `import storage from 'storage'` 后 `storage.getStorage(key)`/`setStorage(key,value)`

在一个 adapter 中检测能力并把结果归一化成字符串：

```js
function normalizeStoredValue(result) {
  if (result == null) return ''
  if (typeof result === 'object') {
    if (typeof result.data === 'string') return result.data
    if (typeof result.value === 'string') return result.value
  }
  return typeof result === 'string' ? result : ''
}
```

对象使用 `{version,...}` schema + JSON；读取时处理空值、损坏 JSON、旧版本和越界数据。高频写入串行化：新写入等待前一写入 settle，避免完成顺序反转。

## Network 兼容层

优先 `$falcon.jsapi.net.request`。统一处理常见返回包装：

- 直接 `{statusCode,data}` 或 `{status,body}`；
- 外层 `{error,result}`；
- body 为 string、ArrayBuffer 或已经解析的 object。

目标低层 HTTP 可能返回 binary，也可能不支持自定义 header/POST body。先做 capability test；只有服务器协议明确允许时才把 allowlist 参数编码进 query。认证 token、配对码、一次性票据不得进入普通日志或不受控 URL。

把 timeout、状态码、业务 `ok:false` 和 transport error 归一化成一致 Error，页面只消费稳定结果。

## 异步与资源清理

对连接、扫描、播放、下载等长流程维护 generation：

```js
const generation = ++this.generation
const result = await operation()
if (generation !== this.generation || !this.pageActive) return
apply(result)
```

stop 时先递增 generation，再清 timer/subscription/queue，最后关闭 native 或网络资源。让 stop 幂等，并保存 `pendingStop`，防止 start 与未完成 stop 交错。

第二次进入/退出页面后的内存或进程增量才是泄漏的重要证据；首次增长可能只是模块加载。
