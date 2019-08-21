---
title: JVM进程占用内存过高排查
date: 2019-03-22 22:54:21
tags: JVM
categories: 技术
---
## 基础知识


### 32位的系统 进程内存限制最多2G？

32 位寻址空间只有 4GB 大小，于是 32 位应用程序进程最大只能用到 4GB 的内存。然而，除了应用程序本身要用内存，操作系统内核也需要使用。应用程序使用的内存空间分为用户空间和内核空间，每个 32 位程序的用户空间可独享前 2GB 空间（指针值为正数），而内核空间为所有进程共享 2GB 空间（指针值为负数）。所以，32 位应用程序实际能够访问的内存地址空间最多只有 2GB。

### JVM进程崩溃？
1, 当超出JVM的分配的内存时，JAVA进程并不会退出只是结束当前的线程
2, 当服务器内存不够时，linux杀死使用内存的一个进程
3,  把系统拆分成多个服务部署在同一台机时需要特别注意，JVM启动时分配的内存只是申请（其实体现在VIRT），当一台服务器运行多个JAVA进程时请保留足够的可用内存 (大于分配给各个JVM的进程之和)

### TOP命令参数

VIRT 虚拟内存中含有共享库、共享内存、栈、堆，所有已申请的总内存空间。
RES  是进程正在使用的内存空间(栈、堆)，申请内存后该内存段已被重新赋值。
SHR  是共享内存正在使用的空间。
SWAP 交换的是已经申请，但没有使用的空间，包括(栈、堆、共享内存)。
DATA 是进程栈、堆申请的总空间。



### linux内存和JAVA堆中的关系

JAVA进程内存 = JVM进程内存+heap内存+ 永久代内存+ 本地方法栈内存+线程栈内存 +堆外内存 +socket 缓冲区内存
 
RES = JAVA正在存活的内存对象大小 + 未回收的对象大小  + 其它
 
VIART= JAVA中申请的内存大小，即 -Xmx  -Xms + 其它
 
其它 = 永久代内存+ 本地方法栈内存+线程栈内存 +堆外内存 +socket 缓冲区内存 +JVM进程内存

---

## 怎么排查

a: 实时查看：
```
找到前30个最耗内存的对象：
jmap -histo pid | head 30 （带上:live则表示先进行一次FGC再统计，如jmap -histo:live pid）
```

b: 把heap文件dump下来分析：
```
jmap -dump:live,format=b,file=heap.bin pid （使用Eclipse mat分析）
```

统计进程打开的句柄数：
```
ls /proc/pid/fd |wc -l
```

统计进程打开的线程数：
```
ls /proc/pid/task |wc -l
```

当前jvm线程数统计：
```
jstack pid |grep ‘tid’|wc –l  (linux 64位系统中jvm线程默认栈大小为1MB)
```

查询堆内存分布情况：
```
jmap -heap pid
```


查看进程内存 
```
pmap pid
```

```
第一列，内存块起始地址 
第二列，占用内存大小 
第三列，内存权限 
第四列，内存名称，anon表示动态分配的内存，stack表示栈内存 
最后一行，占用内存总大小，请注意，此处为虚拟内存大小，占用的物理内存大小可以通过top查看
```

jstat命令查看jvm的GC情况

```
Options，选项，我们一般使用 -gcutil 查看gc情况 
vmid，VM的进程号，即当前运行的java进程号 
interval，间隔时间，单位为秒或者毫秒 
count，打印次数，如果缺省则打印无数次
```

>  jstat -gc pid 5000



## JVM调优实战参考
---------

[jvm疯狂吞占内存，罪魁祸首是谁？](https://www.analysys.cn/article/detail/20019016)
[记一次Java内存占用过大排查](https://jeffinbao.github.io/2016/04/24/20160424-research-on-java-memory-overweighted/)
