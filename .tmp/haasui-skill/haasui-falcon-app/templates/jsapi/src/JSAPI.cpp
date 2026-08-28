// ============================================================================
//  JSAPI 总注册入口
//  规则：pluginname 必须 == CMake LIB_NAME 去 libjsapi_ 前缀、== .so 名去前缀和 .so
//       == registerCModuleLoader 第一参 == JS import 'pluginname' 里的 pluginname
//  本模板 pluginname = "myplugin"  =>  .so 名 libjsapi_myplugin.so、JS: import {MyModule} from 'myplugin'
// ============================================================================

#include <jsmodules/JSCModuleExtension.h>
#include <jquick_config.h>
#include "MyModule/JSMyModule.hpp"

using namespace JQUTIL_NS;

static std::vector<std::string> exportList = {
    "MyModule",
    // 加新模块时把它的 JS class 名追加到这里，同步加 setModuleExport 一行
};

static int module_init(JSContext *ctx, JSModuleDef *m)
{
    auto env = JQModuleEnv::CreateModule(ctx, m, "myplugin");   // 名字必须 == pluginname
    env->setModuleExport("MyModule", createMyModule(env.get()));
    env->setModuleExportDone(JS_UNDEFINED, exportList);
    return 0;
}

DEF_MODULE_LOAD_FUNC_EXPORT(myplugin, module_init, exportList)
// 宏展开为 myplugin_module_load(ctx, moduleName)：若 moduleName == "myplugin"
// 则 JS_NewCModule + AddModuleExport("default") + 逐个 AddModuleExport(exportList)

extern "C" JQUICK_EXPORT void custom_init_jsapis()
{
    registerCModuleLoader("myplugin", &myplugin_module_load);
}