# PWM

# **1. 概述**
脉冲宽度调制是一种模拟控制方式，根据相应载荷的变化来调制晶体管基极或MOS管栅极的偏置，来实现晶体管或MOS管导通时间的改变，从而实现开关稳压电源输出的改变。这种方式能使电源的输出电压在工作条件变化时保持恒定，是利用微处理器的数字信号对模拟电路进行控制的一种非常有效的技术。脉冲宽度调制是利用微处理器的数字输出来对模拟电路进行控制的一种非常有效的技术，广泛应用在从测量、通信到功率控制与变换的许多领域中。



**Tip：**由于每个芯片都不一样，且无统一开源库，目前只提供JSAPI接口，**<font style="color:#DF2A3F;">框架默认不带且无实现</font>**

# 2. 模块使用方式
```javascript
import {pwm} from "io";
```

# 3. 方法
### 3.1 open 
**参数**

+ object类型

| 参数 | 类型 | 必选参数 | 说明 |
| --- | --- | :---: | --- |
| port | String | 是 | pwm的端口号码 |
| duty | Number | 否 | 默认为50<br/>设置PWM占空比，范围在0 ~ 100，单位是百分比 |
| freq | Number | 否 | 默认为1000<br/>设置PWM的频率，单位是HZ |


**返回值**

+ Object类型，PWM实例，为空代表创建失败。



**用法**

+ 创建PWM实例

```javascript
//  创建PWM实例
this.pwm1 =await pwm.open({port:"3",duty:60,freq:500});
```





### 3.2 set 
**参数**

+ object类型

| 参数 | 类型 | 必选参数 | 说明 |
| --- | --- | :---: | --- |
| duty | Number | 否 | 设置PWM占空比，范围在0 ~ 100，单位是百分比 |
| freq | Number | 否 | 设置PWM的频率，单位是HZ |


**返回值**

+ 无，出错会直接报错



**用法**

+ 设置PWM参数。

```javascript
//  创建PWM实例
pwm1 =await pwm.open({port:"3"});
await pwm1.set({duty:50, freq:2000});
```





### 3.3 get  
**参数**

+ 无

**返回值**

+ Object类型

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| duty | Number | 设置PWM占空比，范围在0 ~ 100，单位是百分比 |
| freq | Number | 设置PWM的频率，单位是HZ |




**用法**

+ 获取PWM参数

```javascript
//  创建PWM实例
pwm1 =await pwm.open({port:3});
this.res = await pwm1.get();
this.duty = this.res.duty;
this.freq =  this.res.freq;
```



### 3.4 enable
**参数**

+ enable   // true:使能 false:失能

**返回值**

+ 无



**用法**

+ 使能/失能PWM实例

```javascript
//  创建PWM实例
pwm1 =await pwm.open({port:3});
await pwm1.set({duty:50, freq:2000});
// 失能PWM
await pwm1.enable(false); 
```

### 
### 3.5 close  
**参数**

+ 无

**返回值**

+ 无



**用法**

+ 关闭PWM实例

```javascript
//  创建PWM实例
pwm1 =await pwm.open({id:3});
await pwm1.set({duty:50, freq:2000});
// 关闭PWM实例
await pwm1.close();
```

## 
## 


> 更新: 2023-06-21 18:05:17  
> 原文: <https://www.yuque.com/wcye0k/haasui/hg0nhu3y5m9shb32>