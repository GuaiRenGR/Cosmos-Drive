# Less支持

## 简介
<font style="color:rgb(52, 73, 94);">框架预置Less支持.Less 是一门 CSS 预处理语言,它扩展了 CSS 语言,增加了变量、Mixin、函数等特性.详细的Less内容可参考:</font>[Less官方文档](http://lesscss.org/)<font style="color:rgb(52, 73, 94);">.</font>

## <font style="color:rgb(50, 50, 51);">启用Less</font>
<font style="color:rgb(52, 73, 94);">在框架工程中启动Less只需要设置vue文件中的style标签的lang属性为less即可.支持内联和外联</font>

```plain
<template>
  ...
</template>
<script>
  ...
</script>

<!-- 外联less -->
<style lang="less" src="./default.less" scoped></style>

<!-- 内联less -->
<style lang="less" scoped>
@text-color-default:#cccccc;
.text-common{
  color:@text-color-default;
}
.text-content{
  .text-common();
}
</style>
```

## 注意
+ <font style="color:rgb(52, 73, 94);">Less： </font><font style="color:rgb(88, 114, 126);background-color:rgb(247, 248, 250);">@import </font><font style="color:rgb(52, 73, 94);">路径不支持@开头的缩写,请使用相对路径引入</font>



> 更新: 2022-06-30 21:51:05  
> 原文: <https://www.yuque.com/wcye0k/haasui/uxm72c>