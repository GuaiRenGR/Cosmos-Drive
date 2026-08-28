# File-文件管理(已不更新)

# 说明
+ **目前文件读写没有权限控制，给到非自己产品的客户开发应用时需谨慎**
+ **<font style="color:#E8323C;">已不更新，</font>****新方案(需要框架V1.5版本) **[**见 fs 文档**](https://www.yuque.com/wcye0k/haasui/ysr9v3ma8qq2gzta)

# 1. File JSAPI简介
File JSAPI是框架提供的一个轻量级文件接口，特别适用于存储小程序运行所需的文件，如文本、图片、视频等资源文件，这些文件都可以通过File JSAPI来存取。

<font style="color:#262626;"></font>

<font style="color:#262626;">File </font>JSAPI<font style="color:#262626;">的作用域为当前小程序应用，包含的接口如下：</font>



| **接口宿主** | **JSAPI** | **调用方法** | **接口功能** |
| :---: | --- | :---: | :---: |
| <font style="color:#404040;">file</font> | saveFile | $falcon.jsapi.file.saveFile({apFilePath: 'xxx'}) | 文件管理 |
| | getSavedFileInfo | $falcon.jsapi.file.getSavedFileInfo({apFilePath: 'xxx'}) | |
| | getFileInfo | $falcon.jsapi.file.getFileInfo({apFilePath: 'xxx'}) | |
| | getSavedFileList | $falcon.jsapi.file.getSavedFileList({}) | |
| | removeSavedFile | $falcon.jsapi.file.removeSavedFile({apFilePath: 'xxx'}) | |




## 1.1 file.saveFile
**file.saveFile** 是保存文件到本地**（本地文件大小总容量限制：10 MB）**的 API，支持文件网络下载。

调用 my.saveFile 成功后，可在"MINIAPP_DATAROOT file/appid/"路径下查看保存的文件，其中appid是小程序的id。

**入参**

Object 类型，属性如下：

| **属性** | **类型** | **必填** | **描述** |
| --- | --- | --- | --- |
| apFilePath | String | 是 | 文件路径。 |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
const file = $falcon.jsapi.file;
file.saveFile({
  apFilePath: 'd:\\demo.jpg',
}, result => {console.log(result)});
```

**success 回调函数**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| apFilePath | String | 文件保存路径。 |


## 1.2 file.getSavedFileInfo
**file.getSavedFileInfo** 是获取"MINIAPP_DATAROOT file/appid/"路径下保存的<font style="color:#333333;">所有</font>文件信息的 API，其中appid是小程序的id。

**入参**

<font style="color:#333333;">入参为Object类型，属性如下：</font>

| **属性** | **类型** | **必填** | **描述** |
| --- | --- | --- | --- |
| apFilePath | String | 是 | 文件路径。 |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
const file = $falcon.jsapi.file;
file.saveFile({
  apFilePath: 'd:\\demo.jpg',
}, result => {
  result && !result.error && file.getSavedFileInfo({
    apFilePath: result["apFilePath"],
  }, result => {console.log(result)});
});
```

## 1.3 file.getFileInfo
**getFileInfo**<font style="color:#333333;"> 是获取文件信息的 API。</font>

**入参**

<font style="color:#333333;">入参为Object类型，属性如下：</font>

| **属性** | **类型** | **必填** | **描述** |
| --- | --- | --- | --- |
| apFilePath | String | 是 | 文件路径。（本地文件） |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
const file = $falcon.jsapi.file;
file.getFileInfo({
  apFilePath: "/data/mini_app/file/0000000000000001/demo.jpg",
}, result => {console.log(result)});
```

**success 回调函数**

入参为Object类型，属性如下

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| size | Number | 文件大小。 |
| digest | String | 摘要结果。 |


## 1.4 file.getSavedFileList
**file.getSavedFileList**<font style="color:#333333;"> 是获取保存的所有文件信息的 API。</font>

**入参**

Object 类型，属性如下：

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| appId | String | 否 | 小程序的 appId。 |
| callback | Function | 否 | 回调函数，包含result参数。 |


****

**示例代码**

```javascript
const file = $falcon.jsapi.file;
file.getSavedFileList({
}, result => {
  result && !result.error && console.log(result);
});
```

**success 回调函数**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| fileList | List | 文件列表。 |


**File 对象属性**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| size | Number | 文件大小。 |
| createTime | Number | 创建时间。 |
| apFilePath | String | 文件路径。 |


## 1.5 file.removeSavedFile
**file.removeSavedFile**<font style="color:#333333;"> 是删除某个保存的文件的 API。</font>

**入参**

Object 类型，属性如下：

| **属性** | **类型** | **必填** | **描述** |
| --- | --- | --- | --- |
| apFilePath | String | 是 | 文件路径。 |


****

**示例代码**

```javascript
const file = $falcon.jsapi.file;
file.getSavedFileList({
}, result => {
  result && !result.error && file.removeSavedFile({
    apFilePath: result.fileList[0].apFilePath,
  }, result => {console.log(result)});
});
```

**success 回调函数**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| apFilePath | String | 被删除文件的路径。 |




## 1.6 file.readFile
**file.readFile**<font style="color:#333333;"> 是用来读取文件内容的API。</font>

**入参**

Object 类型，属性如下：

| **属性** | **类型** | **必填** | **描述** |
| --- | --- | --- | --- |
| filePath | String | 是 | 文件路径。 |


****

**示例代码**

```javascript
const file = $falcon.jsapi.file;
file.readFile({
  filePath: 'd:\\demo.txt',
}, result => {
 	result && !result.error && console.log(result);
});
```

**success 回调函数**

| **属性** | **类型** | **描述** |
| --- | --- | --- |
| content | String | 文件的内容。 |




# 2. File JSAPI使用教程
## 2.1 file对象获取
在使用File JSAPI前，需要先获取$falcon.jsapi的file对象，所有的接口都是通过file对象进行调用的。

```javascript
const storage = $falcon.jsapi.file;
```

## 2.2 文件存储
文件存储操作需要通过步骤1获取的file对象来进行，具体可通过file.saveFile来实现键值对参数的存储，可存储的文件类型有txt、png、jpg、zip等常见类型。

| 文件类型/文件操作 | 写入操作 |
| --- | --- |
| txt | 支持 |
| png | 支持 |
| jpg | 支持 |
| zip | 支持 |
| <font style="color:#404040;">...</font> | 支持 |


在进行文件存储时，有两种方式，一种是同步存储，另一种是异步存储。同步存储直接返回存储结果，异步存储需要在async函数中操作，通过await返回存储结果。

| 接口名/参数列表 | 入参1 | 入参2 |
| --- | --- | --- |
| saveFile | apFilePath : 'xxx' | <font style="color:#262626;">(</font><font style="color:#262626;">result</font><font style="color:#262626;">) </font><font style="color:#262626;">=></font><font style="color:#262626;"> {</font><br/><font style="color:#262626;">    </font><font style="color:#262626;">console</font><font style="color:#262626;">.</font><font style="color:#262626;">log</font><font style="color:#262626;">(</font><font style="color:#262626;">result</font><font style="color:#262626;">);</font><br/><font style="color:#262626;">}</font> |


同步存储方式：

```javascript
// sync
const file = $falcon.jsapi.file;
file.saveFile(
  {
    apFilePath: "d:\\demo.jpg",
  },
  (result) => {
    console.log(result);
  }
);
```

异步存储方式：

```javascript
// async
const file = $falcon.jsapi.file;
let result = await storage.setStorage({
  key: 'key',               // key
  data: 'storage content',  // value
});
console.log(result);
```

## 2.3 其他文件操作
其他文件操作也需要通过步骤1获取的file对象来进行，包含getSavedFileInfo、getFileInfo、getSavedFileList和removeSavedFile，也支持同步和异步两种操作。

# 3. File JSAPI调用示例
本节将以保存一张图片为示例，介绍如何去调用File JSAPI，具体包含保存文件、获取保存的文件信息、获取文件信息、获取保存的文件列表和删除文件。调用saveFile()，就可将文件存储到当前小程序的私有文件路径下，以供小程序使用。文件使用完毕后，调用removeSavedFile()，就可将之删除。

## 3.1 保存文件
从给定apFilePath中获取要保存的文件路径，并调用saveFile()将之保存到小程序的私有文件路径下：

```javascript
saveFile() {
  const file = $falcon.jsapi.file;
  file.saveFile(
    {
      apFilePath: "d:\\demo.jpg",
    },
    (result) => {
      console.log(result);
    }
  );
}
```

![1645152144378-cda41e59-7b10-4c4e-af13-bc7151683d4a.gif](./img/hIbaD6WUcqwTy1ZY/1645152144378-cda41e59-7b10-4c4e-af13-bc7151683d4a-949072.gif)

## 3.2 获取保存的文件信息
要获取某个已保存的文件的信息，可通过调用getSavedFileInfo()实现：

```javascript
getSavedFileInfo() {
  const file = $falcon.jsapi.file;
  file.saveFile(
    {
      apFilePath: "d:\\demo.jpg",
    },
    (result) => {
      result &&
        !result.error &&
        file.getSavedFileInfo(
          {
            apFilePath: result["apFilePath"],
          },
          (result) => {
            console.log(result);
          }
        );
    }
  );
}
```

![1645152144503-c9022c72-d700-41e8-9d28-a1a6e16ea856.gif](./img/hIbaD6WUcqwTy1ZY/1645152144503-c9022c72-d700-41e8-9d28-a1a6e16ea856-074018.gif)

## 3.3 获取文件信息
要获取某个文件的信息，可通过调用getFileInfo()实现：

```javascript
getFileInfo() {
  const file = $falcon.jsapi.file;
  file.getFileInfo(
    {
      apFilePath: "d:\\demo.jpg",
    },
    (result) => {
      console.log(result);
    }
  );
}
```

![1645152144429-095f6471-01e6-4ed4-80a5-4198393867ae.gif](./img/hIbaD6WUcqwTy1ZY/1645152144429-095f6471-01e6-4ed4-80a5-4198393867ae-955490.gif)

## 3.4 获取保存的文件列表
要获取已保存的文件的列表，可通过调用getSavedFileList()实现：

```javascript
getSavedFileList() {
  const file = $falcon.jsapi.file;
  file.getSavedFileList({}, (result) => {
    result && !result.error && console.log(result);
  });
}
```

![1645152144432-388bc6c3-78b6-4a7d-9bf0-97c5268ad76b.gif](./img/hIbaD6WUcqwTy1ZY/1645152144432-388bc6c3-78b6-4a7d-9bf0-97c5268ad76b-771313.gif)

## 3.5 删除文件
删除通过saveFile()保存的文件，可以调用removeSavedFile()实现：

```javascript
removeSavedFile() {
  const file = $falcon.jsapi.file;
  file.getSavedFileList({}, (result) => {
    result &&
      !result.error &&
      file.removeSavedFile(
        {
          apFilePath: result.fileList[0].apFilePath,
        },
        (result) => {
          console.log(result);
        }
      );
  });
}
```

![1645152144417-f95d1679-a39e-4000-9356-134e2193731f.gif](./img/hIbaD6WUcqwTy1ZY/1645152144417-f95d1679-a39e-4000-9356-134e2193731f-176605.gif)



> 更新: 2023-09-07 11:36:50  
> 原文: <https://www.yuque.com/wcye0k/haasui/tqn56l>