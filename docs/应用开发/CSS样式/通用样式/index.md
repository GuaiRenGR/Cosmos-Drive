# 通用样式

所有组件都支持以下通用样式规则。

默认通用样式已在本文档中全部列出，一些组件可能有自定义样式，请参考组件文档。除此之外的属性，均不被支持。

我们\*\*支持 \*\*<code>**px**``**rpx**``**%**``**vw**``**vh**</code>**长度单位**。对于不希望受屏幕宽度和 viewPortWidth 影响的尺寸，可使用rpx、%、vw、vh。

注意

* <font style="color:#F5222D;">不支持类似 </font><code><font style="color:#F5222D;">em</font></code><font style="color:#F5222D;">、</font><code><font style="color:#F5222D;">rem</font></code><font style="color:#F5222D;">、</font><code><font style="color:#F5222D;">pt</font></code><font style="color:#F5222D;">这样的 CSS 标准中的其他长度单位；</font>
* 单位 `px`不可省略，否则在 H5 环境无法正确渲染；

| CSS样式 | 简介描述 | |
| --- | --- | --- |
| 盒模型 | | [链接](https://www.yuque.com/wcye0k/haasui/dt842s) |
| Flexbox | | [链接](https://www.yuque.com/wcye0k/haasui/ofrd1k) |
| Transition | | [链接](https://www.yuque.com/wcye0k/haasui/wlmgk4) |
| Transform | | [链接](https://www.yuque.com/wcye0k/haasui/zcgtb7) |
| 线性渐变 | | [链接](https://www.yuque.com/wcye0k/haasui/nn7d63) |
| 阴影(box-shadow) | | [链接](https://www.yuque.com/wcye0k/haasui/qzaugy) |
| opacity(透明度) | | [链接](https://www.yuque.com/wcye0k/haasui/my9ffc#xBVMx) |
| background-color | | [链接](https://www.yuque.com/wcye0k/haasui/my9ffc#aSgfy) |

##

## 上手样式

如果对于样式写法需要更多上手参考，可参考每个组件的文档中，都有常见的例子可供参考。

你可以按照以下步骤来规划页面的样式。

1. 全局样式规划：将整个页面分割成合适的模块。
2. flex 布局：排列和对齐页面模块。
3. 定位盒子：定位并设置偏移量。
4. 细节样式处理：增加特定的具体样式。


> 更新: 2022-05-18 11:52:29  
> 原文: <https://www.yuque.com/wcye0k/haasui/tryec7>