// 在 .vue / .ts 页面里调原生 jsapi 的标准三种形态（与 §9.9 的三种调用形态一致）
import { MyModule } from 'myplugin';

// 1) 同步：直接拿值，跑在 JS 线程，别在这里等 IO
const ver = MyModule.getVersion();
console.log('native version', ver);

// 2) 异步 Promise：跑在 C++ 模块线程池，可阻塞；await 或 .then
MyModule.doWork('hello').then((result) => {
  console.log('doWork ok', result.success, result.output);
});

// 3) 事件订阅：先 subscribe 再触发；记得在 destroyed 里 off，否则内存泄漏
const onChunk = (data: string) => {
  console.log('stream chunk', data);
};
MyModule.on('stream', onChunk);
MyModule.doStream('hello-stream').then(() => {
  console.log('stream done');
  // 完成后 off（具体 off 形式见 SDK 实现；通常是 MyModule.off('stream', onChunk)）
});