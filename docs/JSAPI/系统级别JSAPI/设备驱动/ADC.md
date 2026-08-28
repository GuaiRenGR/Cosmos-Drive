# ADC

**ADC-模拟数字转换器模块**

# **1. 概述**
模拟数字转换器即A/D转换器，或简称ADC，通常是指一个将模拟信号转变为数字信号的电子元件。通常的模数转换器是将一个输入电压信号转换为一个输出的数字信号。由于数字信号本身不具有实际意义，仅仅表示一个相对大小。故任何一个模数转换器都需要一个参考模拟量作为转换的标准，比较常见的参考标准为最大的可转换信号大小。而输出的数字量则表示输入信号相对于参考信号的大小。



**Tip：**由于每个芯片都不一样，且无统一开源库，目前只提供JSAPI接口，**<font style="color:#DF2A3F;">框架默认不带且无实现</font>**



# 2. 模块使用方式
```javascript
import {adc} from "io";
```

# **3. 方法**
### 3.1 open 
**参数**

+ Object对象

| 参数 | 类型 | 必选参数 | 说明 |
| --- | --- | :---: | --- |
| port | String | 是 | adc的端口号码 |


**返回值**

+ Object类型，ADC实例，为空代表创建失败。



**用法**

+ 创建ADC实例

```javascript
//  创建ADC实例
adc1 =await adc.open({port:"0"});
```



### 3.2 readValue  
**参数**

+ 无

**返回值**

+ value:  adc当前数据



**用法**

+ 获取ADC数据

```javascript
//  创建ADC实例
adc1 =await adc.open({port:"0"});
//获取ADC数据
var value = await adc1.readValue();
```





### 3.3 close  
**参数**

+ 无

**返回值**

+ 无



**用法**

+ 关闭ADC实例

```javascript
//  创建ADC实例
adc1 =await adc.open({port:0});
//关闭ADC实例
await adc1.close();
```

## 




> 更新: 2023-06-21 18:05:07  
> 原文: <https://www.yuque.com/wcye0k/haasui/scsw5qgpoq1g5bgt>