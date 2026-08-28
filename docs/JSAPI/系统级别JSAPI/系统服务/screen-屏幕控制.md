# screen-屏幕控制

# 1. 概述
屏幕控制封装，亮度、亮屏、灭屏、自动熄屏时间

**Tip：**由于每个芯片都不一样，且无统一开源库，目前只提供JSAPI接口，**<font style="color:#DF2A3F;">框架默认不带且无实现</font>**



# 2. 模块使用方式
```javascript
import screen from 'screen'
```

# 3. 方法
### 3.1 getInfo()
**参数**

+ 无

**返回值**

+ result

格式

```javascript
{
  isOn  // 屏幕显示状态 true: 亮屏；false:息屏
  isAutoBrightness //  自动调整屏幕亮度  true:启用；false: 禁用
  brightness // 当前屏幕亮度
  isAutoOff  //自动息屏   true:启用；false: 禁用
  autoOffTimeout  // 自动息屏时长 （单位：秒） 
}
```

**用法**

+ 获取屏幕配置和状态

```javascript
//  获取电源管理状态
screen.getInfo().then((res) => {
  this.isOn = res.isOn;
  this.isAutoBrightness = res.isAutoBrightness;
  this.brightness = res.brightness;
  this.isAutoOff = res.isAutoOff;
  this.autoOffTimeout = res.autoOffTimeout;
});
```



### 3.2 turnOn()
**参数**

+ 无

**返回值**

+ 无

**用法**

+ 亮屏

```javascript
//亮屏
screen.turnOn();
```



### 3.3 turnOff()
**参数**

+ 无

**返回值**

+ 无

**用法**

+ 熄屏

```javascript
//息屏
screen.turnOff();
```



### 3.4 setAutoBrightness(isAuto)
**参数**

+ isAuto  true-启用，false-禁用

**返回值**

+ 无

**用法**

+ 设置是否启用自动亮度调节

```javascript
// 启用自动亮度调节
screen.setAutoBrightness(true); 
```



### 3.5 setBrightness(percent)
**参数**

+ percent  亮度

**返回值**

+ 无

**用法**

+ 设置亮度

```javascript
//设置亮度
screen.setBrightness(60); 
```



### 3.6 setAutoOff(isAuto)
**参数**

+ isAuto  true-启用，false-禁用

**返回值**

+ 无

**用法**

+ 设置是否启用闲置自动息屏

```javascript
//启用闲置自动息屏
screen.setAutoOff(true); 
```



### 3.7 setAutoOffTimeout(time)
**参数**

+ time  自动息屏市场（单位：秒）

**返回值**

+ 无

**用法**

+ 设置闲置自动灭屏时间，仅当启用自动灭屏时生效

```javascript
//设置系统闲置60秒后息屏
screen.setAutoOffTimeout(60); 
```

# 4. 事件
### 4.1 status
**参数**

+ 无

**返回值**

+ event

格式

```javascript
{
  change //status
  isOn   // 屏幕状态 true: 亮屏；false:息屏  
}
```

**用法**

+ 屏幕息屏或者亮屏会触发

```javascript
//充电状态改变
screen.on("status", (event)=>{
  console.log( "event.isOn： "+ event.isOn);
})
```



> 更新: 2023-06-21 18:06:09  
> 原文: <https://www.yuque.com/wcye0k/haasui/ol0k308wz40c8eis>