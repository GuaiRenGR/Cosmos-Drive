# <image>

## 显示效果

![1646033373521-a5676c46-505f-4333-aee7-d34dc35b5280.gif](./img/hRscK-YPGZa1Bude/1646033373521-a5676c46-505f-4333-aee7-d34dc35b5280-568121.gif)

## 简介

<image> 用于在界面中显示单个图片。

* 在代码中请使用 <image> 标签, 。
* 默认框架提供**mini-glide** 图片下载模块。
* <image> 必须指定样式中的宽度和高度。
* <image> 不支持内嵌子组件。

## 基本用法

```plain
<template>
  <image style="width:500px;height:500px" src="https://vuejs.org/images/logo.png" />
</template>
```

## 子组件

<image>不支持子组件。

## 样式

支&#x6301;****通用样式****。

WARNING

width, height 和 src必须被提供，否则图片无法渲染。

## 属性

| 属性名 | 类型 | 值 | 默认值 |
| --- | --- | --- | --- |
| resize | String | cover / contain / stretch | stretch |
| src | String | {URL / Base64 } | - |

### resize

* contain：缩放图片以完全装入<image>区域，可能背景区部分空白。
* cover：缩放图片以完全覆盖<image>区域，可能图片部分看不见。
* stretch：默认值. 按照<image>区域的宽高比例缩放图片。

resize属性和background-size的理念很相似。

### src

要显示图片的 URL，该属性是 <image> 组件的强制属性。如果要显示设备文件系统上的图片，可使用file://图片绝对路径 来显示。

#### 支持的图片格式

目前已支持的图片格式 \*\*<font style="color:#DF2A3F;">JPEG、PNG、GIF、BMP</font>\*\*等图片格式

#### 网络图片

```plain
<template>
  <image style="width:500px;height:500px" src="https://vuejs.org/images/logo.png" />
</template>
```

#### 应用图片

```plain
<template>
  <image class="image" resize="contain" :src="require('./images/image1.png')" />
</template>
```

#### 本地图片

```plain
<template>
  <img src="file:///userdata/DictPenData/userAvatar.jpeg" />
</template>
```

#### <font style="color:rgb(0, 0, 0);">图片下载-</font>图片扩展功能

<font style="color:rgb(0, 0, 0);">某些业务需要将网上图片下载到本地，框架提供了将该图在CLI编译时下载到应用包编译中，解决无网络情况下图片加载问题</font>

```plain
require('http://a.png?download')
```

#### <font style="color:rgb(0, 0, 0);">图片转成Base64-</font>图片扩展功能

<font style="color:rgb(0, 0, 0);">某些业务希望能更快的加载图片，框架提供了将该图片在CLI编译时转换成Base64的功能，提升图片显示速度</font>

```plain
require('http://a.png?base64')  //网络图片
or
require('./a.png?base64')      //本地图片
```

## 事件

* **通用事件**. 参见**通用事件**

### `load`

当加载完成 `src` 指定的图片时，`load`事件将被触发。

**事件对象**:

* `success`: {Boolean} 标记图片是否成功加载。
* `size`: {Object} 加载的图片大小对象，属性列表：
  * `naturalWidth`: {Number} 图片宽度，如果图片加载失败则为0。
  * `naturalHeight`: {Number} 图片高度，如果图片加载失败则为0。

#### 处理 `load` 事件

在 `<image>` 标签上绑定 `load` 事件：

```plain
<image @load="onImageLoad" src="path/to/image.png"></image>
```

增加事件处理函数：

```plain
export default {
  methods: {
    onImageLoad (event) {
      if (event.success) {
        // Do something to hanlde success
      }
    }
  }
}
```


> 更新: 2024-01-08 16:34:42  
> 原文: <https://www.yuque.com/wcye0k/haasui/bmiafh>