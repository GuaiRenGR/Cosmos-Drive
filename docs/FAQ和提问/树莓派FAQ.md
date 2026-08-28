# 树莓派FAQ

# 鼠标与屏幕的对接
## 屏幕
框架默认使用/dev/fb0作为 帧缓冲设备对应的设备文件，用户若要修改，可参考[框架系统配置](https://www.yuque.com/wcye0k/haasui/athe1h)修改/etc/miniapp/resources/cfg.json文件中的"device"属性的"fb"子属性，"fb"属性的值可通过ls /dev | grep fb命令查看。

![1654481246876-6570e8d2-873e-4aaa-8feb-c99b3cb5fe2b.png](./img/PTSTIW2dGDkTVGA-/1654481246876-6570e8d2-873e-4aaa-8feb-c99b3cb5fe2b-986122.png)

ls /dev | grep fb打印的结果是fb0，"device"属性的"fb"子属性应配为"/dev/fb0"。

```json
{
	"device": {
		"fb": "/dev/fb0"
	}
}
```

## 鼠标
框架默认使用/dev/input/event0作为 触屏设备对应的设备文件，用户若要修改，可参考[框架系统配置](https://www.yuque.com/wcye0k/haasui/athe1h)修改/etc/miniapp/resources/cfg.json文件中的"device"属性的"tp"子属性，"tp"属性的值可通过ls /dev/input | grep event命令查看。

![1654481445923-d318a4ca-d6f6-45ca-96e3-2a697dc89808.png](./img/PTSTIW2dGDkTVGA-/1654481445923-d318a4ca-d6f6-45ca-96e3-2a697dc89808-631524.png)

ls /dev/input | grep event打印的结果是event0，"device"属性的"tp"子属性应配为"/dev/input/event0"。

```json
{
	"device": {
		"fb": "/dev/input/event0"
	}
}
```

## 键盘
目前暂不支持在树莓派上使用键盘。



> 更新: 2022-06-30 22:01:25  
> 原文: <https://www.yuque.com/wcye0k/haasui/gupt2x>