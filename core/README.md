# Cosmos Drive core

Standalone CGO-free Go ARMv7 executable. It listens only on `127.0.0.1:18765`, implements WebDAV and passive FTP through `POST /request`, and stores profiles at `/userdisk/Favorite/cosmos/drive/connections.json`.

Build from Windows PowerShell with `..\build-core.ps1`. Only existing local Go and Zig installations are used; the script never downloads dependencies.
