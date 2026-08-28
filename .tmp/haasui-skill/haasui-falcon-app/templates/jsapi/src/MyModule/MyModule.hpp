// 业务工作类：纯 OS/C++，不依赖 jsutil —— 便于在 host 测试
#pragma once
#include <string>
#include <functional>
#include <atomic>
#include <memory>

class MyModule
{
public:
    MyModule();
    ~MyModule();

    // 同步业务方法（不要碰 JS 值）
    std::string getVersion() const;

    // 可阻塞业务方法
    bool doWork(const std::string &input, std::string &output);

    // 流式：每段 chunk 触发回调
    void doStream(const std::string &input,
                   const std::function<void(const std::string &chunk)> &onChunk,
                   const std::shared_ptr<std::atomic<bool>> &cancelled);
};