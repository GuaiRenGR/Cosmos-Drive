# http/s-网络请求

# 1. 概述
提供http请求和下载功能。

# 2. 模块使用方式
```javascript
import http from 'http'
```

# 3. 方法
## 3.1 request接口
**参数**

+ Options:
        * url: 请求的url地址（如果是）
        * method: GET/POST/DELETE/PATCH/PUT
        * headers: 自定义请求头 {k1: v1, k2: v2}
        * data: 表单数据   k1=v1&k2=v2
        * timeout：请求超时，单位ms，默认为5000ms

**返回值**

+ HttpResponse：{status, headers, body}

**用法**

发送http请求

```javascript
import http from 'http';

http.request({
  url: 'https://httpbin.org/get',
  method: 'GET',
  headers: {
  }
}).then((res) => {
  console.log(`http get then ${JSON.stringify(res)}`)
}).catch((err) => {
  console.log(err)
  console.log(`http get catch ${JSON.stringify(err)}`)
})

http.request({
  url: 'https://httpbin.org/post',
  method: 'POST',
  data: 'k1=v1&k2=v2',
  headers: {
  }
}).then((res) => {
  console.log(`http post then ${JSON.stringify(res)}`)
}).catch((err) => {
  console.log(err)
  console.log(`http post catch ${JSON.stringify(err)}`)
})
```

## 3.2 download接口
**参数**

+ 入参：
    - Options:
        * url: 请求的url地址（如果是）
        * method: GET/POST/DELETE/PATCH/PUT
        * headers: 自定义请求头 {k1: v1, k2: v2}
        * data: 表单数据   k1=v1&k2=v2
        * outPath: 下载路径
        * progress: 进度回调 (bytes, totalBytes) => {}
        * timeout：请求超时，单位ms，默认为5000ms

**返回值**

+ HttpResponse：{status, headers}

**用法**

通过http下载文件

```javascript
import http from 'http';

http.download({
  url: 'https://httpbin.org/get',
  method: 'GET',
  outPath: '/data/r.json',
  progress: (bytes, totalBytes) => {
    console.log(`http download progress ${bytes, totalBytes}`)
  }
}).then((res) => {
  console.log(`http download get then ${JSON.stringify(res)}`)
}).catch((err) => {
  console.log(err)
  console.log(`http download get catch ${JSON.stringify(err)}`)
})
```





> 更新: 2024-01-16 15:05:34  
> 原文: <https://www.yuque.com/wcye0k/haasui/qbdp9ubv5nytmpev>