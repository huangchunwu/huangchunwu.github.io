---
title: 关于BigDecimal除法的踩坑记录
date: 2019-08-15 14:56:38
tags:
- 避坑指南
categories: 技术
---
最近比较忙，很久没有更博了。最近做的一个证券类的猜涨跌活动的项目，涉及到了计算百分比，用到了decimal这个精度比较高的类（float，double计算会丢失精度），程序在测试阶段，出现了错误   **java.lang.ArithmeticException: Non-terminating decimal expansion; no exact representable decimal result**。报错的代码是：

```java
BigDecimal successRate = new BigDecimal(successTimes).divide(new BigDecimal(totalJoinTimes)).setScale(2,BigDecimal.ROUND_HALF_UP);

```

这里就体现你英语水平的地方了，如果报错日志看不懂， 估计你还得去网上搜下此类错误原因，反之，通过报错日志，就能定位到问题，Non-terminating  无止境的，no exact 不是期望的，大概意思就是 除出的结果是个无限循环小数，不是确切的decimal值。所以，用BigDecimal.divide(),要特别注意在方法内，设置保留几位小数，正确的写法是：

```java
BigDecimal successRate = new BigDecimal(successTimes).divide(new BigDecimal(totalJoinTimes),2,BigDecimal.ROUND_HALF_UP);
```

总结一下，其实以前也遇到过这类问题，就是没有及时总结，导致这一次又犯了一次，特此立个flag，以后不会重蹈覆辙。



这里特别提下：

```java
在《Effective   Java》这本书中也提到这个原则，float和double只能用来做科学计算或者是工程计算，在商业计算中我们要用java.math.BigDecimal。使用BigDecimal并且一定要用String来够造。
```

至于为什么？

是因为float与double 单精度与双精度小数，比如2.2，在程序里面是十进制的数字，在计算机中是以2进制存储，

换算成十进制的值，却不会是2.2的。

