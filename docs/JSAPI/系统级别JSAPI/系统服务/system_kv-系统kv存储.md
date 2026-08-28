# system_kv - 系统kv存储

# 1. 概述
全局的K-V持久化存储和读取封装。底层统一的存储介质，应用间可共享。



**Tip：**由于每个芯片都不一样，且无统一开源库，目前只提供JSAPI接口，**<font style="color:#DF2A3F;">框架默认不带且无实现</font>**

# 2. 模块使用方式
```javascript
import skv from 'system_kv'
```



# 3. 方法
### 3.1 set(key, value)
**参数**

+ key  存储项的名称
+ value  存储项的值 

**返回值**

+ 无

**用法**

+ 设置一个存储项

```javascript
//存储
skv.set('foo','test');
```





### 3.2 get(key [, defaultValue])
**参数**

+ key  存储项的名称
+ defaultValue  存储项的默认值，不传默认为 undefined

**返回值**

+ value

**用法**

+ 获取指定 key 的存储项的值。如果 key 不存在，则返回 defaultValue。

```javascript
//存储
skv.get('foo').then((res) => {
    this.value = res;
});
```



### 3.3 remove(key)
**参数**

+ key  存储项的名称

**返回值**

+ 无

**用法**

+ 删除名称为 key 的存储项

```javascript
//删除
skv.remove('foo');
```



### 3.4 clear()
**参数**

+ 无

**返回值**

+ 无

**用法**

+ 清除所有存储项

```javascript
//清除
skv.clear();
```



# 4. 事件
无

## 


> 更新: 2023-06-28 11:51:48  
> 原文: <https://www.yuque.com/wcye0k/haasui/cg83lt6gg9yfop3r>