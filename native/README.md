# Falcon JSAPI wrapper

`native/cosmos-drive/module.c` is a pure C QuickJS module named `cosmos_drive`.
It exports `start()`, `stop()`, `status()`, and `ensureConfig()`, and starts the bundled
`libs/arm/cosmos-drive-core` process. The Go process serves localhost REST
requests; the front end calls those requests through the built-in `http` module.

The module must be imported directly:

```js
import { start, status, stop, ensureConfig } from 'cosmos_drive'
```

It is not exposed as `$falcon.jsapi.cosmos_drive`. Before `exec`, the wrapper
sets the packaged core to mode `0700` and reports an `exec` error back to JS
through a close-on-exec pipe.

The target is little-endian ELF32 ARM (`arm-linux-musleabihf`, Cortex-A7). The
linker emits a SysV hash table for older uClibc loaders. `build-core.ps1`
inspects the dynamic symbols and fails if it finds `time64`, `clock_gettime64`,
or 64-bit stat dependencies. The Go core uses `CGO_ENABLED=0`, so it does not
consume the device libc time ABI.

```js
ensureConfig()
await start()
```

`configOrName` is either a JSON object/string accepted by the Go core or `@Profile Name`. `operation` is one of `save-config`, `list`, `download`, `upload`, `mkdir`, `delete`, or `move`.

`build-core.ps1` builds both the ARMv7 Go executable and
`libs/arm/libjsapi_cosmos_drive.so` using local Zig and Go tools only.
