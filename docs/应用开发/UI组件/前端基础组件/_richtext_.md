# <richtext>

##

## 简介

`<richtext>` 组件用来创建图文混排的富文本组件。

**<font style="color:rgb(64, 64, 64);">基本用法</font>**

```html
<template>
  <div>
    <richtext @itemclick="listener" @click="click" style="color:red;font-size:20px;lines:3;background-color:green;">
      <span pseudoRef="1" style="text-decoration:line-through;font-size: 50">linklink</span>
      <image
        style="width: 150;"
        src="https://ftp.bmp.ovh/imgs/2019/12/b29a4c1207bdd187.jpeg"
      ></image>
      <span style="font-size: 42; color: yellow">TAOBAO</span>
      <image
        src="https://g.alicdn.com/iot_miniapp/falcon-ui-demo/0.0.13/images/gif.gif"
        pseudo-ref="23"
      ></image>
      <span style="text-decoration:underline;background-color:blue;line-height:40px"
        >轻量级小程序是一套用在嵌入式设备上的轻量级应用开发框架,是AliOS Things系统上推荐的应用&显示框架,目前是JS开发为主、C/C++开发为辅.</span
      >
    </richtext>
  </div>
</template>

<script>
module.exports = {
  methods: {
    listener: function (foo) {
      console.log('itemclick', foo.pseudoRef);
    },
    click(e) {
    },
  },
};
</script>
```

## 子组件

`<richtext>` 富文本组件可以内嵌 <code><span>``<br>``<image>``<div></code>。同时它也支持 <code><span>``<br>``<image></code> `<div>`的嵌套。

只有 `<span>`, `<br>`, `<image>`和`<div>` 可以包含在 `<richtext>` 标签里。`<span>` 会被显示为 `display:inline`，而 `<image>` 会被显示为 `display:inline-block`，`<div>`会被显示为`display:block`。

`<richtext>` 的子节点分两种类型。

* `<span>` `div`可以再包含孩子节点。
* `<image>` `<br>`不能再包含孩子节点。
* 富文本组件自身不能嵌套。。

## 样式

#### 通用样式

支持所有通用样式

* 盒模型
* `flexbox` 布局
* `position`
* `opacity`
* `background-color`
* `lines` 最大行数
* text-overflow: ellipsis 设置文字超出省略号显示样式

## 子组件样式

富文本和它下面的 `<span>`, `<br>`, `<image>` 只支持有限的样式。

* `<span>`,`<br>`和`<richtext>`
  * 可以被继承
    * color
    * font-family
    * font-size
    * font-style
    * font-weight
    * line-height
  * 不可被继承
    * background-color
* `<span>`
  * 可以被继承
    * text-decoration: none | underline | line-through, 默认值是 none
* `<richtext>`
  * 不可被继承
    * lines: 最大行数，必须为正数。
* `<image>`
  * 不可被继承
    * width
    * height

## 属性

#### 支持的图片格式

目前已支持的图片格式 \*\*<font style="color:#DF2A3F;">JPEG、PNG、GIF、BMP</font>\*\*等图片格式

## 事件

* **通用事件** 支持所有**通用事件**。
* **itemclick**. 触发时机是:
  * 选中的组件包含**pseudo-ref**属性，**pseudo-ref**<font style="color:#2C3E50;"> 会作为参数传回来。</font>
  * 若多个嵌套节点上均包含 `itemclick` 事件，则只有最外层节点上的 `itemclick` 会被触发


> 更新: 2024-01-08 16:37:14  
> 原文: <https://www.yuque.com/wcye0k/haasui/hx54tm>