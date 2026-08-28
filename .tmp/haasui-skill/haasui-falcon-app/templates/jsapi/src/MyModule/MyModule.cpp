#include "MyModule.hpp"
#include <chrono>
#include <thread>

MyModule::MyModule() = default;
MyModule::~MyModule() = default;

std::string MyModule::getVersion() const
{
    return "1.0.0-template";
}

bool MyModule::doWork(const std::string &input, std::string &output)
{
    // 真实例：用 Fetch::fetch(url, opts) 打 HTTP、sqlite3 builder 存档、抛 CurlError/NetworkError
    // 这里仅示范可阻塞 IO——doWork 是在异步线程池里调，sleep 也行
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
    output = "echo:" + input + " from native";
    return true;
}

void MyModule::doStream(const std::string &input,
                         const std::function<void(const std::string &chunk)> &onChunk,
                         const std::shared_ptr<std::atomic<bool>> &cancelled)
{
    // 真实例：libcurl 流式 SSE，每行 chunk 调 onChunk（见 reference Fetch 斑）
    for (int i = 0; i < 5 && !cancelled->load(); ++i) {
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
        onChunk("chunk " + std::to_string(i) + " of \"" + input + "\"");
    }
}