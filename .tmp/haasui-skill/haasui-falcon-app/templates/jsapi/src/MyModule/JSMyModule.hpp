// JS 包壳类：JS 端可见的 API、协议、线程模型都在这里组织
#pragma once
#include "MyModule.hpp"                // 业务工作类（OS/C++ only，不引 jsutil）
#include <jqutil_v2/jqutil.h>
#include <memory>
#include <mutex>

using namespace JQUTIL_NS;

class JSMyModule : public JQPublishObject
{
public:
    JSMyModule();
    ~JSMyModule();

    // 同步 JS 线程跑；别做阻塞 IO，否则卡 UI 和 JS
    void getVersion(JQFunctionInfo &info);

    // 异步 Promise 跑在模块线程池里，可做磁盘/网络 IO
    void doWork(JQAsyncInfo &info);

    // 异步 + 流式事件 publish（从任意线程都安全，SDK 自动 marshal 到 JS 线程）
    void doStream(JQAsyncInfo &info);

private:
    std::unique_ptr<MyModule> obj_;
    mutable std::mutex objMutex_;
    MyModule *getObj() const {
        std::lock_guard<std::mutex> lock(objMutex_);
        return obj_.get();
    }
};

extern JSValue createMyModule(JQModuleEnv *env);