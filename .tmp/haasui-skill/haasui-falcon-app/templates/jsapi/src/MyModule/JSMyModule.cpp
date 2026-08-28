#include "JSMyModule.hpp"
#include <Exceptions/Exception.hpp>       // ASSERT / Exception
#include <thread>

// ----------------------------------------------------------------------------
// Factory：每个 JS 模块都按这 6 步骨架写
//   1) JQFunctionTemplate::New(env, "<JS 类名>")
//   2) InstanceTemplate()->setObjectCreator([...](){ return new JS<Module>(); })
//   3) SetProtoMethod (JQFunctionInfo&)   / SetProtoMethodPromise (JQAsyncInfo&)
//   4) 是 JQPublishObject 子类必调 InitTpl(tpl) 装 subscribe/unsubscribe
//   5) CallConstructor() 拿单例 JSValue
//   6) JSAPI.cpp 里 env->setModuleExport("<JS class>", ...); 返回它
// ----------------------------------------------------------------------------
extern JSValue createMyModule(JQModuleEnv *env)
{
    JQFunctionTemplateRef tpl = JQFunctionTemplate::New(env, "MyModule");
    tpl->InstanceTemplate()->setObjectCreator([]() { return new JSMyModule(); });

    tpl->SetProtoMethod("getVersion", &JSMyModule::getVersion);            // sync
    tpl->SetProtoMethodPromise("doWork", &JSMyModule::doWork);             // promise
    tpl->SetProtoMethodPromise("doStream", &JSMyModule::doStream);         // promise + publish

    JSMyModule::InitTpl(tpl);
    return tpl->CallConstructor();
}

JSMyModule::JSMyModule()
    : obj_(std::make_unique<MyModule>()) {}

JSMyModule::~JSMyModule() = default;

// ----------------------------------------------------------------------------
// 同步方法：JS 线程跑；别阻塞！
// ----------------------------------------------------------------------------
void JSMyModule::getVersion(JQFunctionInfo &info)
{
    try {
        ASSERT(info.Length() == 0);
        MyModule *o = getObj(); ASSERT(o != nullptr);
        info.GetReturnValue().Set(o->getVersion());
    } catch (const std::exception &e) {
        info.GetReturnValue().ThrowInternalError(e.what());
    }
}

// ----------------------------------------------------------------------------
// 异步 Promise：模块线程池里跑，可阻塞
// ----------------------------------------------------------------------------
void JSMyModule::doWork(JQAsyncInfo &info)
{
    try {
        ASSERT(info.Length() == 1);
        ASSERT(info[0].is_string());
        std::string input = info[0].string_value();       // Bson API

        MyModule *o = getObj(); ASSERT(o != nullptr);
        std::string output;
        if (!o->doWork(input, output))
            info.postError("doWork failed");
        else
            info.post(Bson::object{{"success", true}, {"output", output}});
    } catch (const std::exception &e) {
        info.postError(e.what());
    }
}

// ----------------------------------------------------------------------------
// 异步 + 流式事件 publish（从 libcurl 回调里任意线程触发都安全）
// JS: const token = MyModule.subscribe("stream", cb)? ... 实际直接 MyModule.on('stream', cb)
// ----------------------------------------------------------------------------
void JSMyModule::doStream(JQAsyncInfo &info)
{
    try {
        ASSERT(info.Length() == 1);
        ASSERT(info[0].is_string());
        std::string input = info[0].string_value();

        MyModule *o = getObj(); ASSERT(o != nullptr);
        // 把 this 弱引用捕获进 onChunk；publish 是 JQPublishObject 的成员，自动 marshal 到 JS 线程
        auto cancelled = std::make_shared<std::atomic<bool>>(false);
        o->doStream(input,
                    [this](const std::string &chunk) {
                        publish("stream", chunk);   // ✅ 任意线程调用都安全
                    },
                    cancelled);
        info.post(true);
    } catch (const std::exception &e) {
        info.postError(e.what());
    }
}