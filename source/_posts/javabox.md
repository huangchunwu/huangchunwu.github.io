---
title: 装箱与拆箱的性能差距
date: 2019-09-05 19:42:31
tags: 装箱与拆箱
categories: 技术
---



今天读同事的代码，了解到Java拆箱与装箱对性能差距很大。首先，复习下装箱与拆箱的概念，说白了就是包装类型，与基础类型的转换，记得没错的话，这是Java的语法糖。

## 装箱

```java
int i =0 ;
Integer j = i; 
```

## 拆箱

```java
Integer i = 0;
int j = j;
```



下面，分别执行使用装箱与拆箱的程序，和没有装拆箱的程序：

```java
// 装箱
public void boxTest() {
        long startTime = System.currentTimeMillis();
        Long sum = 0L;
        for (long i = 0; i < Integer.MAX_VALUE; i++) {
            sum = i;
        }
        System.out.println("processing time: " + (System.currentTimeMillis() - startTime) + " ms");
    }
```

打印结果：

```java
processing time: 7808 ms
```



```java
 // 不装箱
    public void unBoxTest() {
        long startTime = System.currentTimeMillis();
        long sum = 0L;
        for (long i = 0; i < Integer.MAX_VALUE; i++) {
            sum = i;
        }
        System.out.println("processing time: " + (System.currentTimeMillis() - startTime) + " ms");
    }
```

执行结果：

```java
processing time: 1589 ms
```

对比下，惊呆了，可以相差6S。如果追求极致的性能的服务器，这块平日开发的时候，还是可以注意一下，可以优化性能。那么为什么装箱拆箱性能有影响呢，具体原因是，int i = 0;  Integer j = i; 虚拟机会转成  int i =0 ; Integer j = new Integer(i); 那么可想而知，循环体，一直new  Integer(),不断的GC。

好了，写到这里。今天还是有收获的。





