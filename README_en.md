# Cosmos Drive

Cosmos Drive is a remote file manager for the Youdao Dictionary Pen Falcon mini-app runtime. It provides WebDAV and FTP access on the pen's horizontal `1020x240` display and targets Linux ARMv7l hardware with about 90 MB total memory.

[中文 README](README.md)

## Features

- WebDAV (HTTP/HTTPS) and passive FTP connections
- Remote browsing, URL-decoded names, and folder creation
- Remote downloads and local directory browsing
- Local file uploads and transfer management
- File/folder picker entry point for other Falcon mini-apps
- Automatic creation of the configuration directory and file

## Configuration

The connection profile file is `/userdisk/Favorite/cosmos/drive/connections.json`. See [Computer-side remote connection configuration](docs/电脑端配置远程连接.md) for the JSON format and security notes. Passwords are stored as plain text on the device; never commit a real profile file.

The default download directory is `/userdisk/Favorite/cosmos/drive/downloads/`. Connections can also be added from the pen. Text fields use the system input method when available, and the core writes profiles with mode `0600`.

## Cross-app file picker

Callers need no Cosmos Drive `.so` or JavaScript library. Use Falcon's built-in `$falcon.navTo`:

```javascript
$falcon.navTo('falcon://8001787877932650/picker', {
  action: 'select-file',
  requestId: 'reader-import-001',
  returnUri: 'falcon://9000000000000001/index',
  downloadDir: '/userdisk/Favorite/my-reader/imports'
})
```

Cosmos Drive opens the “Select file” page. After confirmation it downloads to `downloadDir/<requestId>/` and returns page parameters through `returnUri`; `file.localPath` is directly readable by the caller. Use `action: 'select-folder'` to return a remote folder path without recursive download.

See [Cloud file picker API](docs/云端文件选择接口.md) for parameters, results, cancellation, and errors. The compatibility entry point is `falcon://8001787877932650/index`.

## Build

No WSL or Linux environment is required. The Windows PowerShell script locates existing Go and Zig installations from PATH or neighboring projects and never downloads tools automatically:

```powershell
npm install
npm run build:core
npm run build
```

`build:core` builds the CGO-free Go service as `libs/arm/cosmos-drive-core`, builds the ARMv7 `libs/arm/libjsapi_cosmos_drive.so` with Zig, and checks ELF32 ARM output plus `time64`/64-bit stat dependencies. The Go service listens only on `127.0.0.1:18765`.

## Install

```bash
adb push 8001787877932650.1_0_0.amr /userdisk/Favorite/
adb shell "miniapp_cli install /userdisk/Favorite/8001787877932650.1_0_0.amr"
```

## Repository layout

```text
src/                    Falcon mini-app front end
core/                   CGO-free Go remote file service
native/cosmos-drive/    QuickJS JSAPI wrapper
libs/arm/               ARMv7 core and .so bundled into the app
build-core.ps1          Windows cross-build script
docs/                   Project-specific configuration and picker docs
```

## License

Licensed under the GNU Affero General Public License v3. See [LICENSE.txt](LICENSE.txt).
