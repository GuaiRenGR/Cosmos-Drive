# wifi-无线网络

# 1. 概述
wifi相关信息获取，WiFi的相关操作，比如连接，删除等功能



**Tip：**<font style="color:rgb(51, 51, 51);">Linux系统上依赖wpa_suppliant 框架，目前</font>**<font style="color:#DF2A3F;">框架默认不带，需要客户自己编译wpa_suppliant库</font>**

# 2. 模块使用方式
```cpp
import wifi from 'wifi'
```

# 3. 方法
## 3.1 scan()
**参数**

+ 无

**返回值**

+ 无

**用法：**发起扫描wifi操作，当有扫描结果时，通过事件"scan_result"通知

```javascript
wifi.on('scan_result', (apList) => {
  console.log(apList)
})
wifi.scan()
```

## 3.2 scanResult()
**参数**

+ 无

**返回值**

+ apList

**用法：**发起获取最近一次的扫描结果（如果有的话）

```javascript
let apList = await wifi.scanResult()
```

## 3.3 addConfig()
**参数**

+ ssid: ssid名称
+ psk：密码

**返回值**

+ 成功返回0，错误返回异常

**用法：**增加ssid配置项

```javascript
let ssid = 'ssid_name'
let psk = 'psk_value'
wifi.addConfig(ssid, psk)
```

## 3.4 removeConfig()
**参数**

+ ssid: ssid名称

**返回值**

+ 成功返回0，错误返回异常

**用法：**删除ssid配置项

```javascript
let ssid = 'ssid_name'
wifi.removeConfig(ssid)
```

## 3.5 listConfig()
**参数**

+ 无

**返回值**

+ configs：ssid配置列表 [{ssid: "ssid名称", "psk": "密码"}, ...]

**用法：**列出 ssid 配置项列表

```javascript
wifi.listConfig().then((configs) => {
  console.log(configs)
})
```



## 3.6 connect()
**参数**

+ ssid: 连接的 ssid 名称

**返回值**

+ 成功返回0，错误返回异常

**用法：**发起某个 ssid 的连接请求

```javascript
let ssid = 'ssid_name'
wifi.connect(ssid)
```



## 3.7 disconnect()
**参数**

+ ssid: 连接的 ssid 名称

**返回值**

+ 成功返回0，错误返回异常

**用法：**发起某个 ssid 的断开请求

```javascript
wifi.disconnect()
```

# 4. 事件
## 4.1 scan_result
**参数**

+ 无

**返回值**

+ [{status: "gotip", bssid: "ap的bssid", ssid: "ssid名称", rssi: 50, isEncrypt: true}, ...]

字段含义：

status：ap状态，string类型，可选值：

"gotip"，连接成功

"disconnected"，连接失败

bssid：ap的bssid值，string类型

ssid：ssid名称，string类型

rssi：信号强度，int类型

authmode：加密类型，string类型，可选项：

OPEN

WEP

WPA_PSK

WPA2_PSK

WPA_WPA2_PSK

WPA2_ENTERPRISE

MAX



**用法：**返回扫描 ap 列表

```javascript
wifi.on('scan_result', (scanResult) => {
  console.log(scanResult)
})
```



## 4.2 disconnected
**参数**

+ 无

**返回值**

+ {reason: "connect_failed", bssid: "bssid值", ssid: "ssid名称"}

字段含义：

reason：断连原因，string类型，可选值：

"connect_failed"，连接失败

"auth_failed"，秘钥失败

bssid：ap的bssid值，string类型

ssid：ssid名称，string类型

**用法：**在wifi断连时触发

```javascript
wifi.on('disconnected', (event) => {
  console.log(event)
})
```

## 4.3 connected
**参数**

+ 无

**返回值**

+ {reason: "", bssid: "bssid值", ssid: "ssid名称"}

字段含义：

reason：控制字符串

bssid：ap的bssid值，string类型

ssid：ssid名称，string类型

**用法：**在wifi连接成功时触发

```javascript
wifi.on('connected', (event) => {
  console.log(event)
})
```

# 


> 更新: 2023-08-07 20:13:22  
> 原文: <https://www.yuque.com/wcye0k/haasui/tu1gafgx738fpgux>