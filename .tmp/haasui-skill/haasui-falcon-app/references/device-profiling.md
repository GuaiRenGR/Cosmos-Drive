# 有道词典笔 Falcon 设备画像

先探测，再设计。不同有道词典笔可能使用不同 CPU、libc、屏幕方向、Falcon/输入法版本和媒体栈；型号名相近也不能推导 ABI 兼容。

不同项目可能为同一硬件使用不同 profile id；名称不是 ABI、屏幕映射或固件兼容性的证据。以当前仓库的 profile、工具链和真机证据为准。

## 必填画像

| 类别 | 记录项 |
|---|---|
| 身份 | 商业型号、设备代号、固件 build、系统版本 |
| Runtime | Falcon/framework、Vue、QuickJS/API 版本、debugger 开关 |
| ABI | `uname -m`、32/64 位、ELF machine、endianness、glibc/uClibc、C++ runtime |
| 屏幕 | 物理宽高、UI direction、offset、应用 design width/height、触控坐标方向 |
| 包 | appid、version、启动 page、安装目录、私有数据目录、日志目录 |
| JSAPI | 高层 `$falcon.jsapi.*`、原生 module、方法签名和返回形态 |
| 输入法 | 有道输入法 appid/version、`global.startTextEdit`、textarea 路径 |
| 媒体 | GStreamer 版本、source/demux/parser/decoder/sink、DRM driver/connector/plane/zpos |
| 构建 | Node/aiot-cli、交叉工具链、sysroot、目标依赖 `.so` |

## 只读探测

先确认设备：

```sh
adb devices -l
adb shell uname -a
adb shell uname -m
adb shell getconf LONG_BIT
adb shell "cat /etc/os-release 2>/dev/null || true"
adb shell "ldd --version 2>&1 | head -n 2"
adb shell "cat /proc/cpuinfo | head -n 40"
```

`ldd --version` 不存在或输出特殊时，拉取一个目标 ELF 到开发机，用 `file`/`readelf` 检查；不要凭目录名猜 libc：

```sh
adb shell "command -v miniapp_cli; command -v gst-launch-1.0"
adb pull <known-target-elf> ./probe.elf
file ./probe.elf
readelf -h ./probe.elf
readelf -l ./probe.elf
readelf -d ./probe.elf
```

查 Falcon 配置和包路径。不同固件路径不同，先检查已知位置，再窄范围查找；路径不存在时记录为未发现，不要据此臆测版本：

```sh
adb shell "test -f /etc/miniapp/resources/cfg.json && cat /etc/miniapp/resources/cfg.json"
adb shell "test -f /etc/miniapp/resources/local_packages.json && cat /etc/miniapp/resources/local_packages.json"
adb shell "find /userdisk /userdata /data/miniapp -maxdepth 7 -name manifest.json 2>/dev/null | head -n 40"
adb shell "miniapp_cli --help 2>&1 || miniapp_cli help 2>&1"
```

在测试 app 的 `App.onLaunch` 中记录一次 `$falcon.env`，只保留非敏感字段，不要持续打印或上传完整环境对象：

```js
console.log('[device-profile] env=' + JSON.stringify($falcon.env))
```

查系统输入法（名称和日志路径随固件变化）：

```sh
adb shell "find /userdisk /userdata /data/miniapp -maxdepth 8 -name manifest.json 2>/dev/null | xargs grep -l '有道输入法\|IM_PANEL' 2>/dev/null"
adb shell "grep -hE 'youdao-im|requestIMAppShow|textEditFinished|startTextEdit' /userdata/applog/DictPen_*.log 2>/dev/null | tail -n 120"
```

查媒体和 DRM；命令不存在本身也是画像结果：

```sh
adb shell "gst-launch-1.0 --version 2>/dev/null"
adb shell "gst-inspect-1.0 souphttpsrc filesrc tsdemux qtdemux h264parse mppvideodec kmssink 2>/dev/null"
adb shell "ls -l /dev/dri 2>/dev/null; ls -l /sys/class/drm 2>/dev/null"
adb shell "modetest -M rockchip 2>/dev/null || modetest 2>/dev/null"
```

不要只从 `modetest` 的 plane 编号推断可用性；同时记录 format、possible crtcs、zpos、alpha/blend 和实际点亮结果。

## 输入法兼容记录

为每个固件分别验证两条路径：

1. `global.startTextEdit` 是否返回非空 UUID、显示 IM_PANEL、回传 confirm/cancel、允许 close。
2. `<textarea :softInputEnable="true">` 是否只 focus，还是确实显示键盘并产生 input/confirm/blur。

历史设备上的输入法结论只能作线索；升级固件、替换输入法或更换型号后必须重新验证。

## Profile 模板

在项目中保存类似记录；不要写入密码、token 或设备私密标识：

```yaml
profile_id: youdao-<model>-<firmware>
model: ""
firmware: ""
runtime:
  falcon: ""
  vue: ""
  quickjs: ""
abi:
  machine: ""
  bits: 0
  libc: ""
  toolchain: ""
screen:
  physical: { width: 0, height: 0, direction: 0, xoffset: 0, yoffset: 0 }
  design: { width: 0, height: 0 }
input_method:
  version: ""
  global_text_edit: untested
  textarea_soft_input: untested
media:
  gstreamer: ""
  decoder: ""
  kms_driver: ""
  connector: ""
  plane: null
package:
  appid: ""
  start_page: index
validation:
  tested_at: ""
  evidence: []
```

将 profile 作为构建和测试输入，而不是散落在 Vue/C++ 中的魔法数字。
