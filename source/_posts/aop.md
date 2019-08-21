---
title: spring声明式事务失效的分析过程
date: 2018-12-16 19:56:40
tags: Spring
categories: 技术
---
### 问题的背景
在途牛，庆幸的是遇到了几个很正面的人，我也是从阅读其中一位同事的博客才发现了spring声明式事务的这个坑，说实话，我平时开发很少用事务，因为不好控制粒度，事务也是高并发的绊脚石。

---
### 问题的现象

为了理解方便，下面我用伪代码说明问题详细
``` javascript
Class exampleService{
    //不加事务，本身不需要事务介入
   public void methodA（）{
      //耗时操作
      ······
     //调用B
      methodB（）；
      ······
   }
    //声明了事务
   @Transactional 
   public void methodB（）{
      insert();
      throw new RuntimeException("操作db失败")
   }
}
```
运行完代码后，现象是发现methodB的插入的数据没有回滚，像我一样不知道的同学就纳闷了，下面来具体分析下为啥出现事务无效的现象。

---




### 问题的分析

这里来复习一下spring的声明式事务，无非就是spring的二大核心之一：AOP。

>AOP的实现原理是java的动态代理。

>spring实现动态代理有二种方式，其中一个就是cglib，另一个是jdk代理。

>cglib的原理是jvm调用native方法即ASM，操作class字节码另生成代理类。

>AOP注解的方法，生成的代理类，并在方法执行前，加入事务的开启，执行后加入事务提交操作

基于这些认知，我们看spring的声明式事务为什么失效。
exampleService有二个方法：methodA 是普通方法，methodB是另一个声明了事务方法，class编译出了一个AOP代理类exampleServiceProxy,
上述出现问题的调用关系是：

    exampleService.methodA（）调用的是内部方法exampleService.methodB().
    由此看出methodB并没有被Proxy类通知到。

正确的调用关系是：

    exampleServiceProxy.methodA()-->exampleServiceProxy.methodB().

---

### 怎么避免此类问题
知道了原理，我们解决此类问题的方法，要么是新建一个类并将methodB移进来。
要么是用编程式事务。

---

### 题外话

> 说下最近发生的事情，不喜跳过。这段时间工作比较忙，每天有6个小时的有效工作时间，在和南京总部的度假团队，一起开发火车票改签项目，说下这个项目的感受，又是一堆的CURD，这也是敲业务代码的弊端。我想避免温水煮青蛙，突破一下自己，改变了以往的开发习惯，先把以前大冰哥的改签代码，用Visio将业务流程画了一遍，我也不清楚这样有什么好处，有个“上海交大”的同事告诉我这样用处大，只能自己体会，我想人家那么优秀的学历说的话总归有点道理的。等我画完整个流程图后，渐渐的有了点启发，一边心里骂着之前代码结构的设计，一边寻思着开始代码的重构,目前正在紧张的开发中。回过头来想画流程图的好处，我就觉得，看代码的速度放慢了，思考空间也更大了些，于是启发就更多了些。

---
5/8号 
昨天面试的时候，被面试官问到这块知识，面试官问如果获取代理对象的目标对象？我不知道了，不过现在知道了。
像上面那类问题，另外一个解决方案就是，直接获取spring容器的代理对象：
``` javascript
Class exampleService{
    //不加事务，本身不需要事务介入
   public void methodA（）{
      //耗时操作
      ······
     //调用B
     ((BaseClass)SpringUtil.getBean("exampleService")).methodB（）；
      ······
   }
    //声明了事务
   @Transactional 
   public void methodB（）{
      insert();
      throw new RuntimeException("操作db失败")
   }
}
```

如果获取代理对象的目标对象？我不好用语言表达清楚，先贴个别人写的解答吧
[在spring中获取代理对象代理的目标对象工具类](https://jinnianshilongnian.iteye.com/blog/1613222)




参考资料：
[Spring的编程式事务和声明式事务](http://www.cnblogs.com/nnngu/p/8627662.html)
[Spring aop的实现原理](https://www.cnblogs.com/lcngu/p/5339555.html)
[Java动态代理机制详解（JDK 和CGLIB，Javassist，ASM）](https://www.cnblogs.com/flyingeagle/articles/7102282.html)