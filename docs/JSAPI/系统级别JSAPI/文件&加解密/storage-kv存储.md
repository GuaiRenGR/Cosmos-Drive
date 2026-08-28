# storage-kv存储

# 1. 概述
storage 模块用来存储键值对kv(Key-Value)数据，放在应用路径下面(有别于系统级别的[system_kv](https://www.yuque.com/wcye0k/haasui/cg83lt6gg9yfop3r))

Tip：框架V1.5版本以上支持该API

# 2. 模块使用方式
```cpp
import storage from 'storage'
```

# 3. 方法
## 3.1 getStorage()
**参数**

+ key：获取的 key 值

**返回值**

+ 异步方法，返回对应的 value 值（字符串），失败抛出异常，空值返回null

**用法：**根据 key 获取某个 value 值

```javascript
let val1 = await storage.getStorage('key1')
let val2 = await storage.getStorage('key2')
this.message = `key1: ${val1}, key2: ${val2}`

```

## 3.2 setStorage()
**参数**

+ key：存储的 key 值，必须是字符串
+ value：存储的 value 值，必须是字符串

**返回值**

+ 异步方法，返回0为成功，失败抛出异常

**用法：**存储 kv 键值对

```javascript
try {
  await storage.setStorage('key1', 'val1')
  await storage.setStorage('key2', 'val2')
  console.log('set success')
} catch(e) {
  console.log(`set success failed ${JSON.stringify(err)}`)
}
```

## 3.3 getStorageKeys()
**参数**

+ 无

**返回值**

+ 异步方法：返回 key 列表

**用法：**获取存储的所有 key 值

```javascript
let keys = await storage.getStorageKeys()
console.log(JSON.stringify(keys))
```

## 3.4 removeStorage()
**参数**

+ key：删除的 key 值

**返回值**

+ 异步方法，返回0为成功，失败抛出异常

**用法：**删除某个 key 值

```javascript
await storage.removeStorage('key1')
this.message = JSON.stringify(await storage.getStorageKeys())

```

## 3.5 clearStorage()
**参数**

+ 无

**返回值**

+ 异步方法，返回0为成功，失败抛出异常

**用法：**清空存储的所有 kv 键值对

```javascript
await storage.clearStorage()
console.log(JSON.stringify(await storage.getStorageKeys()))
```



> 更新: 2023-10-27 18:38:33  
> 原文: <https://www.yuque.com/wcye0k/haasui/cecpi2euwnfffu67>