# Storage-数据存储(已不更新)

# 说明
+ value目前只支持字符串类型
+ **<font style="color:#DF2A3F;">已不更新</font>**，新方案(**需要框架V1.5版本**)见[新版 Storage 文档](https://www.yuque.com/wcye0k/haasui/cecpi2euwnfffu67)

# 1. Storage JSAPI简介
Storage JSAPI是一个轻量级数据存储接口，特别适用于存储应用的各项数据。

例如在天气应用中，在某一次使用时用户添加了若干个城市，当用户下一次点开时也希望之前设置的城市会保存在应用中，以方便直接获取信息。又如在屏保设置选项里，用户设置了打开屏保，当设备下次开机时也需要记住用户的选项，将屏保打开。这时就需要借助于Storage JSAPI，利用它来存储一些键值对(Key-Value)参数。

<font style="color:#262626;"></font>

<font style="color:#262626;">Storage </font>JSAPI<font style="color:#262626;">的作用域为当前小程序应用，包含的接口如下：</font>



| **接口宿主** | **JSAPI** | **调用方法** | **接口功能** |
| :---: | :---: | :---: | :---: |
| <font style="color:#404040;">storage</font> | <font style="color:#404040;">setStorage</font> | $falcon.jsapi.storage.setStorage({key: 'key', data: 'data'}) | 数据存储 |
| | <font style="color:#404040;">getStorage</font> | $falcon.jsapi.storage.getStorage({key: 'key'}) | |
| | <font style="color:#404040;">removeStorage</font> | $falcon.jsapi.storage.removeStorage({key: 'key'}) | |
| | <font style="color:#404040;">clearStorage</font> | $falcon.jsapi.storage.clearStorage() | |




## 1.1 setStorage
保存key-value数据

**入参**

Object 类型，属性如下：

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| key | String | 是 | 缓存数据的 key。 |
| data | <font style="color:#333333;background-color:#FAFAFA;">String</font> | 是 | 缓存数据的 value。 |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
// 异步方法
const storage = $falcon.jsapi.storage;
storage.setStorage({
  key: 'key', 							// key
  data: 'storage content',	// value
}, result => {result && !result.error && console.log('save success: ', result);});

// 同步方法
const storage = $falcon.jsapi.storage;
let result = await storage.setStorage({
  key: 'key', 							// key
  data: 'storage content',	// value
});           
result && !result.error && console.log('save success: ', result);
```

**success 回调函数**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| key | String | 缓存数据的 key。 |
| data | <font style="color:#333333;background-color:#FAFAFA;">String</font> | 缓存数据的 value。 |


## 1.2 getStorage
读取key-value数据

**入参**

Object 类型，属性如下：

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| key | String | 是 | 缓存数据的 key。 |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
const storage = $falcon.jsapi.storage;
storage.getStorage({
  key: 'key' 		// key
}, result => {
	result && !result.error && console.log('dialog clicked ', result);
});
```

**success 回调函数**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| data | String | key 对应的内容。 |


## 1.3 removeStorage
删除当前小程序指定key所对应的value数据

**入参**

Object 类型，属性如下：

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| key | String | 是 | 缓存数据的 key。 |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
const storage = $falcon.jsapi.storage;
storage.removeStorage({
  key: 'key' 		// key
}, result => {result && !result.error && console.log('dialog clicked ', result);});
```

**success 回调函数**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| key | String | 缓存数据的 key。 |


## 1.4 clearStorage
清空当前小程序所有的key-value数据

**入参**

Object 类型，属性如下：

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| appId | String | 否 | 小程序的 appId。 |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
const storage = $falcon.jsapi.storage;
storage.clearStorage({
}, result => {result && !result.error && console.log('dialog clicked ', result);});
```

**success 回调函数**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| appI<font style="color:#262626;">d</font> | String | 被清空数据的小程序的 id。 |


## 1.5 getStorageInfo
获取当前小程序所有的key数据，将返回所有通过setStorage接口存储的key数据

**入参**

Object 类型，属性如下：

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| appId | String | 否 | 小程序的 appId。 |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
const storage = $falcon.jsapi.storage;
storage.getStorageInfo({
}, result => {result && !result.error && console.log('dialog clicked ', result);});
```

**success 回调函数**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| keys | String Array | 当前 storage 中所有的 key。 |
| currentSize | Number | 当前占用的空间大小, 单位为 KB。 |
| limitSize | Number | 限制的空间大小，单位为 KB。 |


# 2. Storage JSAPI使用教程
## 2.1 storage对象获取
在使用Storage JSAPI前，需要先获取$falcon.jsapi的storage对象，所有的接口都是通过storage对象进行调用的。

```javascript
const storage = $falcon.jsapi.storage;
```

## 2.2 数据存储
数据存储操作需要通过步骤1获取的storage对象来进行，具体可通过storage.setStorage来实现键值对参数的存储，可存储的数据类型有Bool、Float、Int、Long、String五种。

| 数据类型/数据操作 | 写入操作 |
| --- | --- |
| <font style="color:#404040;">Bool</font> | 支持 |
| <font style="color:#404040;">Float</font> | 支持 |
| <font style="color:#404040;">Int</font> | 支持 |
| Long | 支持 |
| <font style="color:#404040;">String</font> | 支持 |


在进行数据存储时，有两种方式，一种是同步存储，另一种是异步存储。同步存储直接返回存储结果，通过await返回存储结果，异步存储需要在async函数中操作。

| 接口名/参数列表 | 入参1 | 入参2 |
| --- | --- | --- |
| <font style="color:#404040;">setStorage</font> | key: 'key' | data: 'storage content' |


异步存储方式：

```javascript
// async
const storage = $falcon.jsapi.storage;
storage.setStorage({
  key: 'key',               // key
  data: 'storage content',  // value
}, result => {});
```

同步存储方式：

```javascript
// sync
const storage = $falcon.jsapi.storage;
let result = await storage.setStorage({
  key: 'key',               // key
  data: 'storage content',  // value
});
console.log(result);
```

## 2.3 数据读取
数据读取操作也需要通过步骤1获取的storage对象来进行，具体可通过storage.getStorage来实现键值对参数的读取，可读取的数据类型有Bool、Float、Int、Long、String五种。

| 数据类型/数据操作 | 读取操作 |
| --- | --- |
| Bool | 支持 |
| Float | 支持 |
| Int | 支持 |
| Long | 支持 |
| String | 支持 |


在进行数据读取时，也有两种方式，一种是同步读取，另一种是异步读取。同步读取直接返回读取结果，通过await返回读取结果，异步读取需要在async函数中操作。

| 接口名/参数列表 | 入参1 |
| --- | --- |
| getStorage | key: 'key' |


异步读取方式：

```javascript
// async
const storage = $falcon.jsapi.storage;
storage.getStorage({
  key: 'key'    // key
}, result => {
  result && !result.error && console.log('dialog clicked ', result);
});
```

同步读取方式：

```javascript
// sync
const storage = $falcon.jsapi.storage;
let result = await storage.getStorage({
  key: 'key',    // key
});
console.log(result);
```

# 3. Storage JSAPI调用示例
本节将以屏保设置选项为示例，介绍如何去调用Storage JSAPI。屏保设置选项是指用户是否设置了开启屏保，用户在设置了屏保选项后，设备在下次开机后，应保持用户的设置，根据用户的设置默认将屏保打开或关闭。用户设置了屏保开关的选项后，这个设置参数就可以通过Storage JSAPI存储到磁盘中，下次设备开机就会主动去读取该选项，这样就做到了用户设置的持久化。

![1645152362682-28848f2a-0ff3-4331-9971-7743d6658464.png](./img/Mw-hac5xSZe3BLTG/1645152362682-28848f2a-0ff3-4331-9971-7743d6658464-859788.png)![1645152362681-b4e2ed3b-debb-4191-a986-d56b2a996889.png](./img/Mw-hac5xSZe3BLTG/1645152362681-b4e2ed3b-debb-4191-a986-d56b2a996889-658697.png)

屏保设置选项

## 3.1 屏保设置页面开发
首先需要开发屏保设置页面，<template>模板和<style>样式如下：

```css
<template>
  <div class="wrapper">
    <text class="screen" @click="open">屏保开启</text>
    <FlSwitch
            @change="switchChange"
            :width="100"
            :height="50"
            colorChecked="blue"
            v-model="switchChecked"
    />
  </div>
</template>

<style scoped>
.wrapper {
  justify-content: center;
  align-items: center;
  background-color: #f8f8ff;
}
.screen {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #888;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}
</style>
```

## 3.2 保存屏保设置参数
用户设置的屏保是否开启的参数可通过Storage JSAPI中的setstorage接口进行保存，当用户选择打开屏保时，将screen-saver参数设置为on，当用户选择关闭屏保时，将screen-saver参数设置为off。setstorage设置screen-saver参数的操作在FlSwitch组件的状态发生改变时进行，FlSwitch组件的状态通过switchChange函数进行监听，具体<script>脚本如下：

```javascript
<script>
import FlSwitch from "../../packages/switch/index.vue";
export default {
  name: "index",
  components: {
    FlSwitch,
  },
  data() {
    return {
      msg: "",
    };
  },
  methods: {
    switchChange(on) {
      console.log("switchChange ", on);
      const storage = $falcon.jsapi.storage;
      if(on == true) {
        storage.setStorage({
          key: 'screen-saver',         // key
          data: 'on',                  // value
        }, result => {});
      } else {
        storage.setStorage({
          key: 'screen-saver',         // key
          data: 'off',                 // value
        }, result => {});
      } 
    },
    finishApp() {
      this.$app.finish();
    },
    finishPage() {
      this.$page.finish();
    },
  },
};
</script>
```

## 3.3 屏保设置效果展示
当用户设置开启屏保时，screen-saver的值被置为on；当用户设置关闭屏保时，screen-saver的值被置为off。

![1645152361085-679a5630-a55c-4d51-987b-bd4be6b2addd.gif](./img/Mw-hac5xSZe3BLTG/1645152361085-679a5630-a55c-4d51-987b-bd4be6b2addd-953404.gif)



> 更新: 2023-09-07 11:36:37  
> 原文: <https://www.yuque.com/wcye0k/haasui/oevydu>