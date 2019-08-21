---
title: ThreadLocal如何防止内存泄漏
date: 2019-02-02 16:51:15
tags: 
- Threadlocal
- 并发
categories: 技术
---
 工作五年了，对ThreadLocal原理还不是很清楚，o(*￣︶￣*)o。今天来分析下，使用threadLocal时候，导致内存泄漏的原理。

---

## 概念
 > 1、用于存放线程局部变量。
 > 2、一个线程都会维护一个threadLocalMap,threadLocal包装成弱引用作为key，用户的值作为value,装在entry数组里面。

---

## 主要方法
 > set(T value) 存储线程局部变量值
 > get() 获取线程局部变量值
 > remove() 移除线程局部变量，即entry数组
 

---

## 垃圾回收
1、ThreadLocal层面
 通常，线程结束了，threadLocal作为弱引用的key，此时key==null,Entry也就被GC了
2、ThreadLocalMap层面
 如果线程存活比较久，线程局部变量作为value的数量如果超过容量的2/3(没有扩大容量时是10个)，则会触发Entry的回收

---

### 注意事项

内存泄露
```
 1、如果使用线程池，要注意手动清理threadLocal
 2、如果线程消亡了，threadLocal==null,此时entry还是被强引用的话，
    threadLocalMap不会被回收，造成内存泄露
```


---

## 应用

```

 1、可以用于单个线程的参数的存储，模板方法的上下文
 2、Java7中的SimpleDateFormat不是线程安全的，可以用ThreadLocal来解决这个问题
 3、InheritableThreadLocal可以跨线程共享ThreadLocal变量，用于将主线程的变量传递给子线程中例如用户标识（user id）或事务标识（transaction id），但不能是有状态对象，例如 JDBC Connection
 
```

ThreadLocalMap使用ThreadLocal的弱引用作为key，如果一个ThreadLocal没有外部强引用引用他，那么系统gc的时候，这个ThreadLocal势必会被回收，这样一来，ThreadLocalMap中就会出现key为null的Entry，就没有办法访问这些key为null的Entry的value，如果当前线程再迟迟不结束的话，这些key为null的Entry的value就会一直存在一条强引用链：
Thread Ref -> Thread -> ThreaLocalMap -> Entry -> value
永远无法回收，造成内存泄露。

所以JDK建议将ThreadLocal变量定义成private static的，这样的话ThreadLocal的生命周期就更长，由于一直存在ThreadLocal的强引用，所以ThreadLocal也就不会被回收，也就能保证任何时候都能根据ThreadLocal的弱引用访问到Entry的value值，然后remove它，防止内存泄露。


---

## 附录
[示例代码](https://github.com/huangchunwu/own)