# power - 电源管理

# 1. 概述
提供电源、电池、电量、开关机等信息和功能

**Tip：**由于每个芯片都不一样，且无统一开源库，目前只提供JSAPI接口，**<font style="color:#DF2A3F;">框架默认不带且无实现</font>**

# 2. 模块使用方式
```javascript
import power from 'power'
```

# 3. 方法
### 3.1 getInfo()
**参数**

+ 无

**返回值**

+ **result**

格式如下

```javascript
{
    autoHibernate    //闲置休眠开关 true: 启用；false:禁用
    hibernateTimeout //闲置时长 （单位：秒）
    batteryPercent   //当前剩余电量
    isCharging       //电池状态   true:正在充电中；false: 未充电
}
```

**用法**

+ 获取电源管理状态

```javascript

//  获取电源管理状态
power.getInfo().then((res) => {
  this.autoHibernate = res.autoHibernate;
  this.hibernateTimeout = res.hibernateTimeout;
  this.batteryPercent = res.batteryPercent;
  this.isCharging = res.isCharging;
});
```



### 3.2 setAutoHibernate(isOn)
**参数**

+ isOn  true-启用，false-禁用

**返回值**

+ 无

**用法**

+ 设置是否启用超时自动休眠

```javascript
//设置系统闲置休眠
power.setAutoHibernate(true); 
```



### 3.3 setHibernateTime(time)
**参数**

+ time  闲置时长（单位：秒）

**返回值**

+ 无

**用法**

+ 设置自动休眠的闲置时间

```javascript
//设置系统闲置30分钟后休眠
power.setHibernateTimeout(30 * 60); //秒
```



### 3.4 shutdown()
**参数**

+ 无

**返回值**

+ 无

**用法**

+ 立即关机

```javascript
//立即关机
power.shutdown();
```



### 3.5 reboot()
**参数**

+ 无

**返回值**

+ 无

**用法**

+ 立即重启

```javascript
//立即重启
power.reboot();
```

## 
# 4. 事件
### 4.1 batteryChange
**参数**

+ 无

**返回值**

+ event

格式如下

```javascript
{
  name     //change
  battery  //当前电量
}
```

**用法**

+ 电池电量改变事件

```javascript
//充电状态改变
power.on("change", (event)=>{
  console.log( "event.battery： "+ event.battery);
})
```



### 4.2 charge
**参数**

+ 无

**返回值**

+ event

格式如下

```javascript
{
  name        //charge
  isCharging  //true: 正在充电；false:未充电
}
```

**用法**

+ 充电状态改变事件

```javascript
//充电状态改变
power.on("charge", (event)=>{
  console.log(event.isCharging ? "charging": "on battery");
})
```



### 4.3 batteryLow
**参数**

+ 无

**返回值**

+ event

格式如下

```javascript
{
  name      //low
  battery   //当前电量
}
```

**用法**

+ 电池电量低事件

```javascript
//电量低
power.on("low", (event)=>{
  console.log("notice battery low");
})
```



### 4.4 batteryEmergency
**参数**

+ 无

**返回值**

+ event

格式如下

```javascript
{
  name     //emergency
  battery  //当前电量
}
```

**用法**

+ 紧急电量事件

```javascript
//紧急电量，即将关机
power.on("emergency", (event)=>{
  console.log("system shutting down");
})
```

## 




> 更新: 2023-06-21 18:06:32  
> 原文: <https://www.yuque.com/wcye0k/haasui/zbhgznim6tnoq90v>