---
title: volatile 必备知识
date: 2019-04-18 23:41:27
tags: 
- volatile
- synchronized
categories: 技术
---
## 前置知识

JMM虚拟机线程内存模型 
:   每个线程，都是在自己的工作内存里面操作，想与另外一个线程共享变量值，需要将工作内存的变量刷到主内存，其他线程从主内存复制一份到工作线程来取值。


## 区别

```
volatile
保证了线程之间的可见性和有序性,但不具备原子性。被volatile修饰的变量，线程每次取值都会
从主内存复制到工作内存。 
```

```
synchronized 
解释成JVM指令码 就是monitorenter 和 monitorexit控制线程同步
保证了线程的可见性、有序性和原子性。synchronized的锁来自
对象头的锁，即MarkWord存放的锁标志。
```

这里容易混淆的是 synchronized有序性，不代表能防止指令重排序，有序性的含义是代表保证线程执行的有序性，也只有volatile才有指令内存屏障，
所以双重检锁的单例模式，用了volatile修饰instance，防止new instance()的非原子性操作的指令重排序，导致拿到null的单例。






---
2019-5-11

今天20:00饿了么蜂鸟配送的面试官电面了我，问了这块知识，原来这里可以有这么多东西可以问。

## volatile怎么保证线程的可见性，一个线程的变量变更，另一个线程是怎么感知的？
JVM内存模型对volatile修饰的变量，定义了几个特殊规则：
1. 线程在工作内存中，使用该变量的时候，需要从主内存刷新到工作内存去。
2. 线程修改了工作内存的变量值，需要刷新到主内存去，供其他线程使用。

## 为什么JVM将内存分为工作内存与主内存，即为什么有栈和堆
主内存是线程共享的，不具有线程安全性，而工作内存是线程独有的，具有隔离性，线程安全
工作内存即CPU的高速缓存，为了执行效率高。

## volatile有哪些场景的应用
1. 用于一些开关标识的场景（我只知道这个）
2. 用于缓存的更新的场景，比如缓存失效的时候，多个线程并发获取该缓存，只允许一个线程去DB，拉取数据后塞进缓存后，供其他线程可见使用。
3. 单例模式中，声明单例为volatile。


