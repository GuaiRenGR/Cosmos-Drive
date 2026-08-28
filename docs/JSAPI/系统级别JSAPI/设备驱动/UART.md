# UART

## 1.概述
通用异步收发器是一种通用串行数据总线，用于异步通信。该总线双向通信，可以实现全双工传输和接收。在嵌入式设计中，UART用来与PC进行通信，包括与监控调试器和其它器件，如EEPROM通信。



**Tip：**由于每个芯片都不一样，且无统一开源库，目前只提供JSAPI接口，**<font style="color:#DF2A3F;">框架默认不带且无实现</font>**

## 2.方法
#### open(Object options)
打开串口，创建 UART 实例。

+ 入口参数

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| port | Int | 是 | 要打开的串口的设备路径 |
| dataWidth | Int | 是 | 串口数据宽度，单位“位” |
| baudRate | Int | 是 | 串口波特率，默认115200 |
| stopBits | Int | 是 | 串口停止位个数 <br/>有效参数：1，2 |
| parity | String | 是 | 校验位<br/>支持参数：“none”,"odd","even" |
| flowControl | String | 否 | 支持参数：<br/>“disable”，“cts”，“rts”，“rtscts” |
| mode | String | 否 | poll，配置为轮询主动读模式 |
| | | | 配置为空，配置为中断监听读取模式 |


+ 返回参数

串口实例

+ 使用示例

```javascript
import {uart} from 'io'

let com1 = await uart.open(
  {
        port: "/dev/tty.usbserial-14140",
        dataWidth: 8,
        baudRate: 115200,
        stopBits: 1,
        flowControl: "disable",
        parity: "none"
  }
)
```



#### write(Uint8Array|String data)
向串口发送数据，该函数为阻塞函数，串口发送完成后才会返回。

+ 入口参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| data | Uint8Array/String | 是 | 需要发送到串口的数据，可以是数组或字符串、ArrayBuffer |


+ 返回参数

无

+ 使用示例

```javascript
import {uart} from 'io'

let com1 = await uart.open(
  {
        port: "/dev/tty.usbserial-14140",
        dataWidth: 8,
        baudRate: 115200,
        stopBits: 1,
        flowControl: "disable",
        parity: "none"
  }
)
var buffer = [0x01,0x02,0x03,0x04]

let res
res = await com1.write("hello world")
res = await com1.write(buffer)
```

#### read(Number bytes, Number timeout)
<font style="color:#E8323C;">当“mode”参数为“poll”时</font>，用阻塞的方式读取串口数据，读到指定量的数据或超时后退出。

+ 入口参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| bytes | Number | 是 | 单次读取数据的最大长度，超出长度范围的数据在下次读取时返回。 |
| timeout | Number | 是 | 轮询读超时等待时间 毫秒 |


+ 返回参数

|  | 类型 | 描述 |
| --- | --- | --- |
| data | ArrayBuffer | 从串口读取的数据 |


读取到的数据长度，如果没有读取到数据，返回0

+ 使用示例

```javascript
import {uart} from 'io'

let com1 = await uart.open(
  {
        port: "/dev/tty.usbserial-14140",
        dataWidth: 8,
        baudRate: 115200,
        stopBits: 1,
        flowControl: "disable",
        parity: "none",
        mode:"poll"
  }
)

/* ArrayBuffer 转字符串 */
function ArrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

// 读取10个字节，超时500ms
let buffer = await com1.read(buffer,10,500)
console.log(ArrayBufferToString(buffer))

```

#### on(String event, Function cb)
串口事件回调，当串口发生如收到数据时（“mode”参数不为“poll”时）将触发回调。

+ 入口参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| event | String  | 是 | 目前支持的事件：<br/>"data",在非"poll"模式下收到数据 |
| cb | Function  | 是 | 回调函数 function(onData) {}<br/><font style="color:#E8323C;">onData数据格式为arraybuffer。</font> |


+ 返回参数

无

+ 使用示例

```javascript
import {uart} from 'io'

let com1 = await uart.open(
  {
        port: "/dev/tty.usbserial-14140",
        dataWidth: 8,
        baudRate: 115200,
        stopBits: 1,
        flowControl: "disable",
        parity: "none"
  }
)
/* ArrayBuffer 转字符串 */
function ArrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

/* ArrayBuffer 转 Uint8Array */
function ArrayBufferToUint8Array(buf) {
    return Array.prototype.slice.call(new Uint8Array(buf))
}

com1.on("data", function (onData) {
  /* 打印出串口接收到的数据，数据类型为 ArrayBuffer，先转为字符串后再打印 */
  console.log("uart on: " + ArrayBufferToString(onData))

  /* 串口把接收到的数据直接回发出去 */
  com1.write(onData)
}
```

#### close()
关闭串口，销毁实例。

+ 入口参数

无

+ 返回参数

无



> 更新: 2023-10-11 21:50:09  
> 原文: <https://www.yuque.com/wcye0k/haasui/xo8progfhsqy8nqi>