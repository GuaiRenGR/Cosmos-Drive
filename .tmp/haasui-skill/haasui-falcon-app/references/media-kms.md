# 有道词典笔媒体、MPP 与 KMS

硬件媒体能力是机型/固件属性。先探测元素与 plane，再选择管线；不要把某个项目的 `rotation`、plane-id 或 rectangle 当通用答案。

## 分层模型

最终画面可能由两个独立平面组成：

1. Falcon UI plane：Vue 页面、控件、触控层和 `<hole>` 透明区域。
2. KMS video plane：GStreamer 硬解后由 `kmssink` 输出。

检查两个 plane 的 zpos、alpha/blend 和 possible crtcs。不要笼统假设“视频总在 UI 上/下”；以 `modetest` 与实机遮挡结果为准。

## 选择管线

按输入协议选择 source 和 demux：

```text
HTTP(S) MPEG-TS: souphttpsrc ! queue ! tsdemux ! h264parse ! <decoder> ! kmssink
本地 MPEG-TS:    filesrc ! tsdemux ! h264parse ! <decoder> ! kmssink
HTTP(S) MP4:     souphttpsrc ! qtdemux ! h264parse ! <decoder> ! kmssink
本地 MP4:        filesrc ! qtdemux ! h264parse ! <decoder> ! kmssink
```

用 `gst-inspect-1.0` 确认 `<decoder>` 及其 rotation/fast-mode 属性。MPP 驱动在不同固件上的属性和值可能不同；先跑短样本，再写 native 默认。

`kmssink` 参数来自 profile：driver、connector/crtc、plane-id、sync、aspect ratio、render rectangle。每次更改都保留完整 gst 日志。

## 坐标契约

至少定义三组坐标：

- Falcon logical：`setViewPort` 下的 UI/触控坐标。
- 物理屏幕：DRM mode 的宽高、direction、offset。
- KMS 输出：rotation 后的 render rectangle。

不要只用一个比例做所有转换。把转换写成纯函数，并用四角、中心、边界外值测试。UI `<hole>`、触控层和 video rectangle 改动必须在同一变更中评审。

## `<hole>`

- 每个时刻只渲染业务需要的 hole；多个状态可用互斥 `v-if`。
- hole 的 logical 矩形要与 video physical 矩形经过坐标变换后对应。
- hole 外 UI 是否覆盖视频取决于 plane 顺序和透明合成；真机验证抽屉、弹层和半透明区域。
- 模拟器不提供 KMS 证据。

## Native 进程生命周期

优先通过参数数组执行进程，不拼接 shell 字符串。对 URL/路径做长度、scheme、控制字符和目录边界校验。

进程管理至少提供：

- `start(config)`：先停止旧实例或明确拒绝并发；返回 PID/status。
- `stop()`：幂等；先正常终止，超时后强制终止。
- `getStatus()`：state、PID、last exit code。
- `error/exit/state` 事件。
- 独立日志文件，stderr 与 stdout 可关联。
- wait/reap，避免 zombie 和残留解码进程。

Vue 页面为每次连接维护 generation。native exit 属于预期 stop 时不触发重连；意外 exit 才进入有限退避。进入后台、页面卸载、会话替换和应用退出都走同一个 stop 路径。

## 验证清单

- source/demux 与真实容器一致；TLS/CA 策略明确。
- parser/decoder/sink 属性都能在目标固件 `gst-inspect` 查到。
- plane、rotation、rectangle 来自 profile，不来自示例。
- 全屏、局部 hole、UI 覆盖、触控四角均正确。
- 网络中断、服务端关闭、快速前后台、重复 start/stop 不留进程。
- 日志不包含 token、配对码或一次性 URL 凭据。
