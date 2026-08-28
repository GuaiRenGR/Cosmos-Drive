# 配置alias目录别名

## 问题：
如果我们想要引入公共封装库，采用相对路径会比较繁琐，且不同目录层次页面中引入的方式也不同。

比如想要在 src/pages/index/index.vue 中引入 /libs/jscom/testlib.js 文件，使用相对目录需要，如图

```javascript
import testlib from '../../../libs/jscom/testlib.js'
```

![1647396621390-b00d5eae-22e1-4a3d-b72d-436b549c173f.png](./img/x8-9kYqJS57gq7nE/1647396621390-b00d5eae-22e1-4a3d-b72d-436b549c173f-756467.png)

## 使用
在 app.json 中配置 alias 目录别名，如下，其中 libs/jscom 相对于项目根目录配置

```javascript
  "options": {
    "alias": {
      "jscom": "libs/jscom"
    }
  }
```

![1647396621352-ecf217bf-08ca-405a-b5dc-7a5e87c97c9f.png](./img/x8-9kYqJS57gq7nE/1647396621352-ecf217bf-08ca-405a-b5dc-7a5e87c97c9f-465549.png)

在文件中引入，简单清晰，且在任何文件中引入方式一致

```javascript
import testlib from 'jscom/testlib.js'
```

![1647396621349-1518161c-478b-4fc2-b432-f0fa62127bf1.png](./img/x8-9kYqJS57gq7nE/1647396621349-1518161c-478b-4fc2-b432-f0fa62127bf1-325741.png)



> 更新: 2022-03-16 10:10:44  
> 原文: <https://www.yuque.com/wcye0k/haasui/ppazrx>