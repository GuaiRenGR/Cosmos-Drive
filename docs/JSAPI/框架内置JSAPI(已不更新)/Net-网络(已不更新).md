# Net-网络(已不更新)

# 说明
+ <font style="color:#DF2A3F;">已不更新</font>，新方案(**需要框架V1.5版本**)见 [http/s 文档](https://www.yuque.com/wcye0k/haasui/qbdp9ubv5nytmpev)

示例代码：

```javascript
const http = $falcon.jsapi.http

http.request({
  url: 'https://testpmc.youxuepai.com/push/cross/preschool/getUserTracks.json',
  data: {
    'machine_no': '7120935186230152460',
    'nextStart': '',
    'date': '2020-12-09',
    'pageSize': '10',
    'start_date': '2020-12-09'
  },
  header: {
    'Content-Type': 'application/json'
  }
  }, (result) => {
    console.log(result);
  });

//或者使用await
const result = await http.request(options);
console.log(result);
```







参数说明：

| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| url | String | 是 | 开发者服务器接口地址 |
| data | String,Object | 否 | 请求的参数 |
| header | Object | 否 | 设置请求的 header |
| method | String | 否 | 默认为 GET，有效值GET,POST |




> 更新: 2023-09-07 11:36:59  
> 原文: <https://www.yuque.com/wcye0k/haasui/rgk6o5>