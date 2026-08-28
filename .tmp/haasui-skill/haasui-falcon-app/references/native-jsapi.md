# 有道词典笔 Native JSAPI

不同词典笔可能是 MIPS32、ARMv7 或 AArch64，并可能使用 glibc/uClibc。以下是通用宿主契约，不代表二进制跨机型兼容。

## 构建前提

从目标 profile 确认：

- ELF machine/class/endianness；
- libc 与动态加载器；
- libstdc++/GLIBCXX 要求；
- Falcon `iot-miniapp-sdk` 头和实现；
- 所有第三方依赖的目标版本；
- 对应 sysroot 和交叉工具链。

不要把 `libs/` 中现成 `.so` 当通用库。先用 `file`/`readelf` 对照目标系统 ELF；架构一致也不代表 libc/符号版本兼容。

## 三名与入口

保持：

```text
libjsapi_<plugin>.so
registerCModuleLoader("<plugin>", &<plugin>_module_load)
import { Module } from "<plugin>"
```

模块入口：

```cpp
#include <jsmodules/JSCModuleExtension.h>
#include <jquick_config.h>
#include "MyModule/JSMyModule.hpp"

using namespace JQUTIL_NS;
static std::vector<std::string> exportList = { "MyModule" };

static int module_init(JSContext *ctx, JSModuleDef *module) {
    auto env = JQModuleEnv::CreateModule(ctx, module, "myplugin");
    env->setModuleExport("MyModule", createMyModule(env.get()));
    env->setModuleExportDone(JS_UNDEFINED, exportList);
    return 0;
}

DEF_MODULE_LOAD_FUNC_EXPORT(myplugin, module_init, exportList)

extern "C" JQUICK_EXPORT void custom_init_jsapis() {
    registerCModuleLoader("myplugin", &myplugin_module_load);
}
```

## 同步、Promise 与事件

| 模式 | 注册 | Handler | 约束 |
|---|---|---|---|
| 同步 | `SetProtoMethod` | `JQFunctionInfo&` | 只做短操作，不阻塞 JS 线程 |
| Promise | `SetProtoMethodPromise` | `JQAsyncInfo&` | 阻塞 I/O/进程控制放这里；成功 post，失败 postError |
| 事件 | `JQPublishObject` + `InitTpl` | `publish(topic,bson)` | 保存/释放订阅，跨线程发布由 SDK marshal |

同步参数是 JSValue 包装，使用 `JQString/JQNumber/JQObject`；Promise 参数已序列化为 Bson，使用 `string_value/int_value/object_items`。不要混用两套解析 API。

所有 handler 用 `try/catch` 把 C++ 异常转换成 `ThrowInternalError` 或 `postError`。对 JS 输入做长度、范围、枚举、路径/URL 控制字符校验；不要拼 shell 命令处理不可信参数。

## CMake 骨架

只保留项目真正需要的依赖：

```cmake
cmake_minimum_required(VERSION 3.10)

if(DEFINED ENV{CROSS_C_COMPILER} AND DEFINED ENV{CROSS_CXX_COMPILER})
  set(CMAKE_C_COMPILER "$ENV{CROSS_C_COMPILER}")
  set(CMAKE_CXX_COMPILER "$ENV{CROSS_CXX_COMPILER}")
elseif(DEFINED ENV{CROSS_TOOLCHAIN_PREFIX})
  set(CMAKE_C_COMPILER "$ENV{CROSS_TOOLCHAIN_PREFIX}gcc")
  set(CMAKE_CXX_COMPILER "$ENV{CROSS_TOOLCHAIN_PREFIX}g++")
else()
  message(FATAL_ERROR "Set the compiler from the target device profile")
endif()

project(jsapi_myplugin C CXX)
set(CMAKE_CXX_STANDARD 17)
set(SDK "${CMAKE_SOURCE_DIR}/iot-miniapp-sdk")

file(GLOB_RECURSE SDK_SOURCES "${SDK}/src/*.cpp")
add_library(iot_sdk STATIC ${SDK_SOURCES})
target_include_directories(iot_sdk PUBLIC "${SDK}/include")
set_target_properties(iot_sdk PROPERTIES POSITION_INDEPENDENT_CODE ON)

file(GLOB_RECURSE SOURCES "${CMAKE_SOURCE_DIR}/src/*.cpp")
add_library(jsapi_myplugin SHARED ${SOURCES})
target_link_libraries(jsapi_myplugin PRIVATE
  iot_sdk pthread -Wl,-unresolved-symbols=ignore-all)
set_target_properties(jsapi_myplugin PROPERTIES OUTPUT_NAME "jsapi_myplugin" PREFIX "lib")
```

仅在业务使用时添加 curl/sqlite/GStreamer 等库，并使用目标 sysroot/设备匹配版本。不要让基础模板强制依赖无关库。

## 产物组织

同一份 AArch64 二进制已在所有目标真机验证通过时，优先构建一个只含一份 native 库的通用 AMR：

```text
libs/
  libjsapi_<plugin>.so
```

当多个 profile 已在真机验证可从 `libs/` 根目录加载同一份 `.so` 时，不要仅因 profile 名不同而把相同文件重复放进：

```text
libs/<profile-a>/
libs/<profile-b>/
```

这个结论只证明两种 profile 接受根目录打包布局，不自动证明任意 AArch64 二进制、libc、符号版本或第三方依赖都兼容。先完成 ELF 与依赖检查，并在每个目标设备上验证同一二进制；若二进制不同，或某个目标固件拒绝根目录布局，再为该 profile 单独构建和打包。

使用项目锁定的 Node 和 `aiot-vue-cli` 生成 AMR。已验证的 `aiot-vue-cli@1.0.32` 会原样复制 `libs/`，并在每次构建前删除后重建 `.falcon_`，不会遗留旧的 profile 目录。AMR 虽是 ZIP 容器，但不要用 PowerShell `Compress-Archive` 代替项目打包器；这种替代包已出现 PMS 安装报 `file not exist`。

检查产物：

```sh
file libjsapi_<plugin>.so
readelf -h libjsapi_<plugin>.so
readelf -d libjsapi_<plugin>.so
nm -D libjsapi_<plugin>.so | grep custom_init_jsapis
```

打包与真机验收同时确认：

1. 解包 AMR，确认全包只有一份 `.so`，路径为 `libs/libjsapi_<plugin>.so`。
2. 确认 AMR manifest 中的库键仍是 `libs/libjsapi_<plugin>.so`。
3. 在每个目标 profile 上安装，要求 `miniapp_cli install` 返回 `ret: 0`。
4. 检查安装 slot 的 manifest，确认它保留根目录源路径。
5. 检查日志出现 `dynamic_load_jsapi .../libs/libjsapi_<plugin>_<id>.so`，并确认模块实际可调用。设备安装后可能把库展平并重命名；仅看到这个安装路径，不能反推源 AMR 使用了哪种目录布局。
6. 在每种目标真机上冷启动，覆盖模块加载、每个导出、错误入参、并发 start/stop、应用卸载和再次启动。

若项目构建环境有多套 Node，必须使用项目锁定版本；以项目的 `package.json`、lockfile、构建脚本和已知成功构建日志为准。不要因为本机默认 Node 能运行普通 JavaScript，就推断它能运行旧版 `aiot-vue-cli`。
