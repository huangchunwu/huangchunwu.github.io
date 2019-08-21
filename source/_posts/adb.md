---
title: Android开发调试远程连接设备
date: 2018-12-02 23:45:16
categories: 技术
tags: Android
---


最近在做一个Android-PAD项目，之前本地调试，基本靠sdk模拟器，或者数据线连接手机，学会了新招，可以远程连接设备进行调试，即远程adb。


----------


前提条件：一台Android设备，并且ROOT


----------


```python
su
setprop service.adb.tcp.port 9999  #设置端口，默认是5555
stop adbd
start adbd
netstat#看下adb端口是否打开
```

最后在终端执行
```python
C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools>adb connect 192.168.2.104 9999连接成功
```



