# Cosmos Drive

Cosmos Drive 是运行在有道词典笔 Falcon mini-app 环境中的远程文件管理器。它在横向 `1020x240` 屏幕上提供 WebDAV 和 FTP 文件访问，并针对 Linux ARMv7l、约 90 MB 总内存的设备做了资源限制。

[English README](README_en.md)

## 功能

- WebDAV（HTTP/HTTPS）和 FTP（被动模式）连接
- 远程目录浏览、URL 文件名解码和新建文件夹
- 远程文件下载到本地
- 本地目录浏览和文件上传
- 传输管理：查看下载、上传和失败条目
- 供其他 Falcon mini-app 使用的文件/文件夹选择入口
- 首次启动自动创建配置目录和配置文件

## 配置

连接配置文件位于：

```text
/userdisk/Favorite/cosmos/drive/connections.json
```

电脑端编辑、字段定义和安全注意事项见[电脑端配置远程连接](docs/电脑端配置远程连接.md)。密码以明文存储在设备文件中，请勿把真实配置提交到 Git。

默认下载目录为：

```text
/userdisk/Favorite/cosmos/drive/downloads/
```

应用也支持在词典笔的“添加连接”页面直接配置连接；文本输入会调用系统输入法，核心服务负责以 `0600` 权限写入配置。

## 跨应用文件选择

其他 Falcon mini-app 不需要依赖 Cosmos Drive 的 `.so` 或 JavaScript 库，只需调用 Falcon 内置的 `$falcon.navTo`：

```javascript
$falcon.navTo('falcon://8001787877932650/picker', {
  action: 'select-file',
  requestId: 'reader-import-001',
  returnUri: 'falcon://9000000000000001/index',
  downloadDir: '/userdisk/Favorite/my-reader/imports'
})
```

Cosmos Drive 会打开“选择文件”页面。用户确认远程文件后，文件下载到 `downloadDir/<requestId>/`，结果通过 `returnUri` 的页面参数返回，其中 `file.localPath` 是调用方可以直接读取的本地路径。选择文件夹时使用 `action: 'select-folder'`，只返回远程路径，不递归下载。

完整参数、返回结构、取消和错误处理见[云端文件选择接口](docs/云端文件选择接口.md)。兼容入口为 `falcon://8001787877932650/index`。

## 构建

构建不需要 WSL 或 Linux 环境。Windows PowerShell 脚本从 PATH 或项目邻近目录查找本地 Go 和 Zig，不会自动下载工具：

```powershell
npm install
npm run build:core
npm run build
```

`build:core` 会将 Go 核心编译为 Linux ARMv7 可执行文件 `libs/arm/cosmos-drive-core`，并使用 Zig 编译 ARMv7 `libs/arm/libjsapi_cosmos_drive.so`，同时检查 ELF32 ARM、导出符号和 `time64`/64 位 stat 依赖。Go 核心只监听 `127.0.0.1:18765`，前端通过设备内置 HTTP 接口访问。

## 安装

构建完成后会生成 AMR 包。通过 ADB 安装示例：

```bash
adb push 8001787877932650.1_0_0.amr /userdisk/Favorite/
adb shell "miniapp_cli install /userdisk/Favorite/8001787877932650.1_0_0.amr"
```

## 目录

```text
src/                    Falcon mini-app 前端
core/                   CGO-free Go 远程文件服务
native/cosmos-drive/    QuickJS JSAPI 包装模块
libs/arm/               打包所需 ARMv7 核心和 .so
build-core.ps1          Windows 本地交叉编译脚本
docs/                   项目专用配置和跨应用接口文档
```

## 许可证

本项目采用 GNU Affero General Public License v3，详见 [LICENSE.txt](LICENSE.txt)。
