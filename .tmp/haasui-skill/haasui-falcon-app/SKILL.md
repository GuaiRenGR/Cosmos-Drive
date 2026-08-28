---
name: haasui-falcon-app
description: Develop and maintain applications for NetEase Youdao Dictionary Pen devices running the Falcon mini-app runtime. Use for new or existing Vue/QuickJS mini-apps, device profiling, UI and lifecycle work, storage/network/input compatibility, optional native JSAPI modules, optional media/KMS integration, cross-compilation, AMR packaging, ADB installation, debugging, and real-device verification across multiple pen models and firmware versions.
---

# 有道词典笔 Falcon 应用开发

面向需要在有道词典笔上开发、移植或排查 Falcon mini-app 的任务。将目标设备、固件和当前项目源码作为事实来源；本 skill 中的型号、尺寸、ABI、命令输出和 API 形态都只能作为待验证线索。先建立 profile，再决定实现和产物布局。

## 适用范围

- 适用于 Falcon/QuickJS mini-app、Vue 2 SFC 页面和配套的 JSAPI/native 扩展。
- 适用于设备上的输入法、触控、存储、网络、下载、音视频和生命周期问题。
- 只有在目标 profile 已证明支持时，才处理 `<hole>`、GStreamer、MPP、DRM/KMS 或独立 native 进程。
- 不把某个应用的服务端协议、登录流程、品牌文案、appid 或业务状态机当成平台能力。

## 核心流程

1. 检查仓库结构、构建脚本、测试和 `git status`；保留无关的工作区改动。
2. 连接目标词典笔，建立设备 profile：型号、固件、Falcon/API、屏幕、触控、ABI/libc、输入法、媒体能力和工具链。
3. 将设备差异收口到 profile、adapter 或 native 配置；页面和业务代码不散落型号判断。
4. 先定义跨层数据契约、错误语义和清理路径，再实现正常路径；长异步操作必须可取消、可替换、可重复停止。
5. 用 mock/模拟器验证纯逻辑和可模拟 UI，用真机验证系统输入法、native、触控、KMS、安装和启动。
6. 只为已验证 ABI 构建 native 库，只用项目打包器生成 `.amr`；每次发布同步校验版本和 manifest。
7. 使用明确的规范启动页完成安装、冷启动、前后台、至少两次进入/退出和异常恢复，确认无残留 timer、订阅、线程或进程。

## 设备 profile

读取 [references/device-profiling.md](references/device-profiling.md)，只读探测并将结果保存到项目文档或 profile 文件。至少记录：

```yaml
profile_id: youdao-<model>-<firmware>
model: ""
firmware: ""
runtime: { falcon: "", quickjs: "", api: "" }
abi: { machine: "", bits: 0, libc: "", loader: "", toolchain: "" }
screen:
  logical: { width: 0, height: 0 }
  physical: { width: 0, height: 0, direction: 0, xoffset: 0, yoffset: 0 }
  touch: { direction: 0, xoffset: 0, yoffset: 0 }
input_method: { version: "", global_text_edit: untested, textarea_soft_input: untested }
media: { gstreamer: "", decoder: "", kms_driver: "", connector: "", crtc: null, plane: null }
package: { appid: "", version: "", start_page: "index" }
validation: { tested_at: "", evidence: [] }
```

禁止在未确认 profile 前写死 `setViewPort`、逻辑/物理宽高、旋转、offset、触控映射、plane、decoder、库目录、工具链、appid、安装目录或日志目录。发现新机型或固件时新增 profile，不修改一个全局默认值覆盖已有设备。

ADB 探测要使用短的、固定路径的只读命令；先运行 `adb devices -l`，再查询 `/etc/os-release`、`/proc/version`、`/proc/cpuinfo`、device-tree `compatible`、Falcon 配置和 `miniapp_cli --help`。不要假定 `getprop`、`ldd`、`modetest` 或某个日志目录存在；“命令不存在”也是 profile 结果。避免递归扫描整个 `/sys`，避免重启设备。若 ADB 提示 `login with 'adb shell auth' to continue`，暂停并请求人工完成认证。

## 项目分层

尊重现有目录；仅在缺少边界时采用以下职责：

```text
project/
  package.json                 # appid、版本、构建脚本
  api-mock/                    # JSAPI/输入法 mock
  profiles/                    # 设备 profile 和验证证据
  libs/                        # 已验证的 native 库
  assets/                      # 打包资源
  src/
    app.js app.json            # App 生命周期、页面注册、viewport
    base-page.js               # 统一订阅和 timer 清理
    pages/ components/         # Vue 页面
    services/                  # storage/net/input/device adapters
  native/                      # 可选 JSAPI、进程或媒体桥接
  test/                        # 纯逻辑、协议、参数和源码契约测试
```

把能力检测、入参转换、返回归一化和错误翻译放在 service adapter；业务页面只消费稳定接口。为每条 fallback 写 mock 或单元测试，避免在模板中堆叠 `if (apiA) ... else ...`。

## Falcon UI 与生命周期

- 按当前 `aiot-vue-cli` 支持的 Vue 2 SFC 和 CSS 子集编写；不使用浏览器 DOM、Node API 或未经验证的 Web CSS。
- `App.onLaunch` 读取 profile 后用其中已验证的逻辑宽度调用 `setViewPort(...)`，再注册统一的 BasePage；不要先渲染一个猜测尺寸的首帧。
- `app.json` 使用显式页面名和页面脚本。页面类继承项目 BasePage，不绕过资源释放。
- 根 Vue 页面使用项目实际支持的 `onShow/onHide/onUnload` 钩子；不要假定 `$page.on('show')` 存在。
- 统一封装 timeout、interval、Falcon 订阅、native subscription、网络循环和子进程，在 `onUnload` 的 `finally` 中释放。
- 文字使用 `<text>`，滚动区域显式设置尺寸，图片同时设置 `src/width/height`；稳定控件的状态 class 不得改变几何尺寸。
- 将 Falcon logical、物理屏幕、旋转后输出和触控坐标定义成纯函数，测试四角、中心、边界和越界输入。

完整运行时、存储、网络和输入法模式见 [references/falcon-runtime.md](references/falcon-runtime.md)。

## 能力与兼容

按以下顺序选实现：高层 `$falcon.jsapi.*` → 已在目标 profile 验证的模块 → 自定义 native JSAPI。对同名 API 也要验证参数、同步/异步性质和返回包装；不要凭名字推断兼容。

- 存储对象使用带 `version` 的 schema，读取时处理空值、损坏 JSON、旧版本和边界值；高频写入串行化，失败时保留内存状态并给出可恢复提示。
- 网络 adapter 统一处理状态码、业务错误、超时、字符串/二进制/object body 和 transport error。低层 HTTP 缺 header/body 时不得静默削弱认证；query fallback 只能使用服务端明确允许的非敏感 allowlist 参数，且禁止记录敏感 query。
- 长流程使用 generation/cancellation token；新任务替换旧任务时，过期回调不得更新页面。停止顺序为：递增 generation、清 timer/订阅/队列、关闭 native/网络资源、等待回收。
- 对下载、扫描、播放、连接等资源提供明确的 `start`、幂等 `stop`、`getStatus`、错误/退出事件和有限重试；区分预期停止与意外退出。

## 系统输入法

将输入法视为独立系统 mini-app，而不是普通控件。先在每个固件验证 `global.startTextEdit` 和 `<textarea :softInputEnable="true">` 两条路径：是否弹出、回调 confirm/cancel、返回值形态和 close 行为都要记录。

- 复用一个 Global 实例，保存 `textEditFinished` handler，并严格 `on/off` 成对管理。
- 打开前关闭旧 UUID，保存同步返回的 UUID；回调只处理当前 UUID。
- 仅 `editConfirmed === true` 时写回文本；兼容字符串和 `{value,text}` 返回值，应用结果后关闭会话。
- 页面销毁时先 `off`，再关闭残留会话；不要业务侧调用内部 `requestIMAppShow`。
- 若输入法触发 `onHide`，用“系统输入会话中”状态守卫媒体/心跳；真正离开页面仍必须清理。

## Native JSAPI

只有平台 API 不足时增加 native。开始前确认目标 `uname -m`、ELF class/machine、endianness、动态加载器、libc、libstdc++/GLIBCXX、依赖库、SDK 头文件、sysroot 和交叉工具链。读取 [references/native-jsapi.md](references/native-jsapi.md)，从 `templates/jsapi/` 复制骨架并删除无关依赖。

保持以下三名一致：

```text
libjsapi_<plugin>.so
registerCModuleLoader("<plugin>", ...)
import { Module } from "<plugin>"
```

导出 `extern "C" JQUICK_EXPORT void custom_init_jsapis()`。短操作使用同步方法，阻塞 I/O 使用 Promise/异步 handler，跨线程事件使用 SDK 的 publish 机制。所有输入做长度、范围、枚举、路径和 URL 校验；C++ 异常转换为稳定的 JS error。native 对象必须有幂等 stop、析构清理、并发 start/stop 测试和退出回收。

同一份二进制只有在每个目标 profile 都通过 ELF/依赖检查、加载日志和功能测试后才能共享。默认优先尝试 `libs/libjsapi_<plugin>.so` 单库布局；若二进制、libc、依赖或固件布局不兼容，再按 profile 分包。不要因为 profile 名不同就复制相同文件，也不要把现成 `.so` 当通用库。

## 可选媒体与硬件图层

任务涉及视频、音频或 `<hole>` 时才读取 [references/media-kms.md](references/media-kms.md)。先用目标设备的 `gst-inspect-1.0`、`modetest`、DRM sysfs 和短样本确认 source/demux/parser/decoder/sink、format、possible CRTCs、zpos、alpha/blend、rotation 和 rectangle。

将媒体分成两层：native/GStreamer 负责解码与 KMS 提交，Falcon UI 负责 `<hole>`、控件和触控层。logical → physical → rotated/KMS 坐标必须有显式转换；plane、rotation、driver、connector、crtc 和 rectangle 都属于 profile。子进程使用参数数组而非 shell 字符串，提供日志、PID/status、exit/error、正常停止、超时强杀和 `waitpid`，并保证快速切页不会复活过期回调。

## 构建、打包与安装

使用项目锁定的 Node、`aiot-vue-cli` 和交叉工具链；不要自动选择机器上“第一个”工具链。常见命令需先用项目脚本和 CLI `--help` 确认：

```text
aiot-cli                 # debug 构建
aiot-cli -p              # debug AMR
aiot-cli -q -p           # QuickJS AMR
aiot-cli -c -q -p        # production AMR
aiot-cli simulator ./    # 模拟器
```

在 native 库进入包前运行 `file`、`readelf -h`、`readelf -d` 和 `nm -D`，确认架构、解释器、依赖和 `custom_init_jsapis`。AMR 必须由项目打包器生成；不要使用通用 ZIP 工具替代它。解包检查 manifest、所有脚本/资源和 `.so` 路径，确认没有旧构建残留。发布前递增项目版本（若项目约定 AMR 版本与 package version 同步则同时更新），记录 SHA-256 和 profile。

安装和启动命令以设备 `miniapp_cli --help` 为准。常见形态是：

```sh
adb push <app>.amr /tmp/<app>.amr
adb shell miniapp_cli install /tmp/<app>.amr
adb shell miniapp_cli start <appid> --<page>
```

有些固件使用位置参数或不同临时目录；不要盲目复制示例。安装、覆盖安装和冷启动都显式传规范启动页；省略 page 可能只创建进程而不挂载页面。不要用整机重启掩盖安装、入口或生命周期错误。

## 验证矩阵

- 构建：debug/production、CSS 检查、manifest 引用、资源和目标 `.so`。
- 纯逻辑：profile/坐标转换、storage schema、协议归一化、输入法结果、重试/generation、native 参数和错误路径。
- 模拟器：布局和 mock 状态；明确记录无法模拟的输入法、native、DRM/KMS、MPP 和真实存储/网络差异。
- 每台真机：首次安装、覆盖安装、显式启动页、输入法确认/取消、前后台、网络中断、重复 start/stop、两次进入/退出和异常恢复。
- 多 profile：每个 profile 使用自己的产物或共享库证据，保存架构检查、关键日志、截图、版本和校验值。
- 资源回收：第二次进入/退出后的 timer、订阅、线程、子进程和内存增量；首次增长可能只是模块加载。

黑屏或启动失败时按边界排查：启动页和 manifest → 包内脚本/chunk → native ELF/依赖/加载日志 → profile 几何和 KMS → 页面业务逻辑。多页面构建生成的带 hash chunk 只要被 manifest 引用就不得手工删除。

## 交付前检查

- 运行项目测试、构建检查和 `git diff --check`。
- 确认没有提交凭据、设备私密标识、运行时数据或不可移植的预编译库。
- 确认文档、启动器、更新器、安装脚本使用同一个规范启动页和版本来源。
- 把真机证据与 profile 绑定，明确哪些能力仍未验证；不要把模拟器成功表述为硬件兼容。
