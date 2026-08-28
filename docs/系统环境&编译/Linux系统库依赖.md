# Linux系统库依赖

小程序框架V1.5版本以上提供一些Linux系统通用能力的扩展，**<font style="color:#DF2A3F;">系统侧可以根据业务需要</font>**，增加以下通用库的集成

#### 基础服务
+ curl (http 网络请求，推荐使用)
+ wpa_suppliant （wifi配网）
+ 显示驱动
    - framebuffer (推荐有vsync)
    - weston (RK芯片)
+ tinyalsa驱动 或alsa-lib驱动 (音频驱动框架)
+ v4l2驱动 (有camera场景，摄像头驱动框架)
+ 视频场景：目前暂未提供JSAPI，客户可以自己选择ffmpeg 或 GStreamer 对接



#### 开发调试
+ ssh 
+ adb 强烈推荐有，方便开发调试



> 更新: 2023-09-05 14:44:57  
> 原文: <https://www.yuque.com/wcye0k/haasui/qtwitlfsw9o3w5u5>