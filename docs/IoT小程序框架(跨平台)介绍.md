# IoT小程序框架(跨平台)介绍

## 定位
<font style="color:rgb(23, 26, 29);">是一套</font>**<font style="color:rgb(23, 26, 29);">阿里云团队</font>**<font style="color:rgb(23, 26, 29);">推出的跨平台的轻量级JS应用框架，包含UI显示框架、多应用&多服务能力、应用热更新、系统API扩展等能力，且它利用JS语言低门槛和API标准化大幅度降低了嵌入式带屏硬件上应用的研发难度</font>

<font style="color:rgb(23, 26, 29);">目前支持Linux、MacOS、Windows、Ubuntu、RTOS系统(AliOS Things、平头哥Yoc)等系统上运行</font>

## 理念
移动开发模式，全面拥抱JavaScript开源生态，且系统服务通过统一的JSAPI，**实现一端开发，多端运行策略**



![1648606563275-9d7fe7a0-53b2-4003-90c4-90b5b0d1ba11.png](./img/cpcNQ2xPwGEzWhnf/1648606563275-9d7fe7a0-53b2-4003-90c4-90b5b0d1ba11-635550.png)



## 框架特色
![O1CN01htYOLn1CMGsvfxC5S_!!6000000000066-2-tps-1500-558.png](./img/cpcNQ2xPwGEzWhnf/1647222517087-e884430f-b1d6-434d-ad1e-516d4039a997-670704.png)

## 组件效果
![1668409437618-b0f4c658-69b8-49f4-9856-a9732d32d4ee.gif](./img/cpcNQ2xPwGEzWhnf/1668409437618-b0f4c658-69b8-49f4-9856-a9732d32d4ee-613426.gif)

## Chrome浏览器体验
UI效果，可以通过浏览器体验，[请点击网站](https://hli.aliyuncs.com/xyfolder/miniapp-wasm/index.html)



## 基础框架介绍
![1690790282938-7c147ba2-fb8f-4c33-a198-7490f41e7c10.png](./img/cpcNQ2xPwGEzWhnf/1690790282938-7c147ba2-fb8f-4c33-a198-7490f41e7c10-051843.png)

#### 框架-前端能力
+ 前端框架：采用<font style="color:rgb(52, 73, 94);">Vue.js(v2.6.12)开源框架,实现了W3C标准的标签和样式子集</font>
+ <font style="color:rgb(52, 73, 94);">CSS样式：详细见</font>[链接](https://www.yuque.com/wcye0k/haasui/tryec7)
+ <font style="color:rgb(52, 73, 94);">前端组件：详细见</font>[链接](https://www.yuque.com/wcye0k/haasui/ptpl24)

#### 框架-应用能力
+ 多应用能力：引入类似android应用理念，客户可以将复杂的业务拆分多个独立应用，框架侧已管理应用的创建和退出，当应用退出后框架会回收该应用的内存资源
+ 热更新能力：支持应用的独立升级(不依赖OTA升级)，实现应用更加敏捷的版本迭代(包含so库)
+ 包管理能力：实现对不同应用的管理，基于该模块可以扩展出**<font style="color:#e8323c;">应用市场</font>**，可以实现三方应用的在线安装功能

#### 框架-图形能力
+ 图片解码：支持jpeg、png解码能力
+ 字体：支持FreeType2 矢量字库
+ 支持Lottie、SVGA动画特效
+ 视频图层合并：支持Video层与 OSD层叠加，目前建议自带视频硬件合成(可有效降低CPU占用率)
+ GPU硬件加速：支持通过GreenUI图形框架的Canvas api，实现对不同渲染引擎的对接，通过扩展OGLES接口，实现对GPU硬件加速支持



## 支持系统平台
Linux、Window、MacOS、Ubuntu、RTOS系统(AliOS Things & 平头哥Yoc)

## 推荐硬件
+ CPU架构： arm、risc-v 架构
+ CPU频率：推荐 单核 >800MHZ，更高的频率效果更佳
+ 框架资源占用(纯软件绘制)：**<font style="color:#E8323C;">RAM 2.5MB~4MB(不包含framebuffer占用)</font>**， ROM 1.5MB (不包含字库)
+ 一般场景(720P分辨率)：包含多个应用，推荐8MB~16MB内存，ROM(包含字库) 10MB~16MB





> 更新: 2023-10-24 10:53:44  
> 原文: <https://www.yuque.com/wcye0k/haasui/awyrlg>