# system-系统通用

# 1. 概述
模块:system, 用于系统操作

```javascript
// 导入system模块
import system from 'system'
```

# 2. 方法
### 2.1 reset()
接口功能：重置设备(恢复出厂设置)

入参：无

出参：无

示例：

```javascript
system.reset()
```

### 2.2 getVersion()
接口功能：获取系统版本号

入参：无

出参：

| 参数列表 | 参数类型 | 描述 |
| --- | --- | --- |
| arg1(version) | string | 系统版本 |


示例：

```javascript
let version = system.getVersion()
```

### 2.3 getSN()
接口功能：获取设备序列号

入参：无

出参：

| 参数列表 | 参数类型 | 描述 |
| --- | --- | --- |
| arg1(sn) | string | 序列号 |


示例：

```javascript
let sn = system.getSN()
```

# 


> 更新: 2023-03-14 11:45:58  
> 原文: <https://www.yuque.com/wcye0k/haasui/hv3c8g0wg1q5n6h5>