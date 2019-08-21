---
title: 垃圾回收器的选择
date: 2019-04-06 19:50:23
tags:
- GC
categories: 技术
---
其实，要不是读周志明的《深入理解java虚拟机》，垃圾回收器这个东西，我工作中是不需要接触到的。既然学习了，我就得沉淀点东西，以供后续复习。那么有这本书详细的描述了这块的知识，还需要我写点什么呢？恩，据我了解，周围同事读过这本书感受，都不是很流畅，读完有点懵，也记不住读过的内容，我要做的就是对知识的解剖的有条理性。肉是肉，骨头是骨头，码的整整齐齐。

---
## 前置知识

吞吐量
:   CPU用于运行用户代码的时间与CPU总消耗时间的比值，即吞吐量=运行用户代码时间/（运行用户代码时间+垃圾收集时间），虚拟机总共运行了100分钟，其中垃圾收集花掉1分钟，那吞吐量就是99%。

并行（Parallel）
:   指多条垃圾收集线程并行工作，但此时用户线程仍然处于等待状态。

并发（Concurrent）
:   指用户线程与垃圾收集线程同时执行（但不一定是并行的，可能会交替执行），用户程序在继续运行，而垃圾收集程序运行于另一个CPU上。

---




## 垃圾回收器分类

### 按照回收线程数分：
1、串行垃圾回收器
> serial 收集器，serial old 收集器

2、并行垃圾回收器
> parNew收集器，Parallel Scavenge，parallel old

---


### 按照工作模式划分
1、独占式垃圾回收器
> serial 收集器，serial old 收集器，parNew收集器，Parallel Scavenge，parallel old

2、并发式垃圾回收器
> cms


---

### 按照工作的内存区间划分：
1、新生代
> serial， parNew， Parallel Scavenge

2、老生代
> serial old， parallel old， cms

---

### 按照碎片处理方式划分
压缩式垃圾回收器
> CMS收集器

        CMS收集器提供了
        -XX:+UseCMSCompactAtFullCollection开启碎整理
        -XX:CMSFullGCsBeforeCompaction，设置执行多少次不压缩的FullGC后，跟着来一次带压缩的

非压缩式垃圾回收器
> serial 收集器，serial old 收集器，parNew收集器，Parallel Scavenge，parallel old

---

### 按照回收算法
1、标记 清除 
> cms

2、复制
> serial ，parNew， parallel scavenger

3、标记 整理
> serial old， parallel old


---

## 最佳实践

Parallel Scavenge收集器无法与CMS收集器配合工作
```
最佳搭配：
ParNew + CMS（GC停顿时间短），
Parallel Scavenge+Parallel Old（吞吐量高）
```