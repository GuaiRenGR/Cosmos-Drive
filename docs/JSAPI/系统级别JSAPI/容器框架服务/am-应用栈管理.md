# am-应用栈管理

# 1. 概述
提供应用栈的管理机制

# 2. 模块使用方式
```javascript
import am from 'am'
```

## 2.1 应用预加载
为支持应用在开机启动时预加载，通过如下app.json配置（系统级应用生效），会在启动home前预启动该app

```javascript
{
  "props": {
    "Preload": true
  }
}

```

# 3方法
## <font style="color:rgb(38, 38, 38);">3.1 </font>getTopApp()
<font style="color:rgb(38, 38, 38);">获取栈顶appid  
</font>**<font style="color:rgb(38, 38, 38);">入参</font>**<font style="color:rgb(38, 38, 38);">  
</font><font style="color:rgb(38, 38, 38);">无</font>

**调用示例**

```javascript
import am from '$am';

let topApp = am.getTopApp();
```

## <font style="color:rgb(38, 38, 38);">3.2 </font>moveToBack
<font style="color:rgb(38, 38, 38);">将app在应用栈中下移，隐藏到后台（还在应用栈中）</font>

**<font style="color:rgb(38, 38, 38);">权限</font>**

<font style="color:rgb(38, 38, 38);">移动本应用可授权，移动其他应用需系统应用权限  
</font>**<font style="color:rgb(38, 38, 38);">入参</font>**

| <font style="color:rgb(38, 38, 38);">属性</font> | <font style="color:rgb(38, 38, 38);">类型</font> | <font style="color:rgb(38, 38, 38);">必填</font> | <font style="color:rgb(38, 38, 38);">描述</font> |
| --- | --- | --- | --- |
| <font style="color:rgb(38, 38, 38);">appId</font> | <font style="color:rgb(38, 38, 38);">String</font> | <font style="color:rgb(38, 38, 38);">否(为空表示移动本应用)</font> | <font style="color:rgb(38, 38, 38);">要移动的应用的appId。</font> |


**调用示例**

```javascript
import am from '$am';

am.moveToBack();
```

## <font style="color:rgb(38, 38, 38);">3.3 </font>hide
<font style="color:rgb(38, 38, 38);">将app移动到隐藏应用栈中，其他app退栈不会自动显示该app（需通过startApp重新加入）</font>

**<font style="color:rgb(38, 38, 38);">权限</font>**

<font style="color:rgb(38, 38, 38);">移动本应用可授权，移动其他应用需系统应用权限  
</font>**<font style="color:rgb(38, 38, 38);">入参</font>**<font style="color:rgb(38, 38, 38);"></font>

| <font style="color:rgb(38, 38, 38);">属性</font> | <font style="color:rgb(38, 38, 38);">类型</font> | <font style="color:rgb(38, 38, 38);">必填</font> | <font style="color:rgb(38, 38, 38);">描述</font> |
| --- | --- | --- | --- |
| <font style="color:rgb(38, 38, 38);">appId</font> | <font style="color:rgb(38, 38, 38);">String</font> | <font style="color:rgb(38, 38, 38);">否(为空表示移动本应用)</font> | <font style="color:rgb(38, 38, 38);">要移动的应用的appId。</font> |


**调用示例**

```javascript
import am from '$am';

am.hide();
```

## 3.4 closeApp
<font style="color:rgb(38, 38, 38);">关闭指定app</font>

**<font style="color:rgb(38, 38, 38);">权限</font>**

<font style="color:rgb(38, 38, 38);">关闭本应用可授权，关闭其他应用需系统应用权限  
</font>**<font style="color:rgb(38, 38, 38);">入参</font>**

| <font style="color:rgb(38, 38, 38);">属性</font> | <font style="color:rgb(38, 38, 38);">类型</font> | <font style="color:rgb(38, 38, 38);">必填</font> | <font style="color:rgb(38, 38, 38);">描述</font> |
| --- | --- | --- | --- |
| <font style="color:rgb(38, 38, 38);">appId</font> | <font style="color:rgb(38, 38, 38);">String</font> | <font style="color:rgb(38, 38, 38);">否(为空表示移动本应用)</font> | <font style="color:rgb(38, 38, 38);">要移动的应用的appId。</font> |
| forceFinish | bool | 否 | 是否强制退出，为false时，如果app存在持久化后台服务，app不会退出，只会界面退出 |


**调用示例**

```javascript
import am from '$am';

am.closeApp(undefined, false);
```

## 3.5 hasWindowFocus
<font style="color:rgb(38, 38, 38);">本应用是否具有焦点窗口  
</font>**<font style="color:rgb(38, 38, 38);">入参</font>**

| <font style="color:rgb(38, 38, 38);">属性</font> | <font style="color:rgb(38, 38, 38);">类型</font> | <font style="color:rgb(38, 38, 38);">必填</font> | <font style="color:rgb(38, 38, 38);">描述</font> |
| --- | --- | --- | --- |
|  |  |  |  |


**调用示例**

```javascript
import am from '$am';

let focused = am.hasWindowFocus();
```

## 3.6 isAttachedToWindow
<font style="color:rgb(38, 38, 38);">本应用当前是否有界面打开  
</font>**<font style="color:rgb(38, 38, 38);">入参</font>**

| <font style="color:rgb(38, 38, 38);">属性</font> | <font style="color:rgb(38, 38, 38);">类型</font> | <font style="color:rgb(38, 38, 38);">必填</font> | <font style="color:rgb(38, 38, 38);">描述</font> |
| --- | --- | --- | --- |
|  |  |  |  |


**调用示例**

```javascript
import am from '$am';

let attached = am.isAttachedToWindow();
```

# 4. 事件
## 4.1 topApp
栈顶应用变化

**调用示例**

```javascript
import am from '$am';

am.on('topApp', r => {});
```

## 4.2 windowAttachState
本应用界面开启关闭事件

**调用示例**

```javascript
import am from '$am';

am.on('windowAttachState', r => {});
```



> 更新: 2023-06-20 10:51:06  
> 原文: <https://www.yuque.com/wcye0k/haasui/ole8cfa4dsu2qtxn>