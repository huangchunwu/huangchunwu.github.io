---
title: 如何写一个程序频繁的FULL GC
date: 2019-05-10 22:58:57
tags: GC
categories: 技术
---


```
public class GcExample {

    private static final int _1MB=1024*1024;

    public static void main(String[] args) {

        while (true){
            byte[] b = new byte[4*_1MB];
            b=null;
            System.gc();
        }

    }

}

```

 System.gc()源码
 
```
 public static void gc() {
        Runtime.getRuntime().gc();
    }
```

显示的使用 System.gc()，会导致频繁full gc，这个方法可以在禁用掉
在vm options加入
```
-XX:+DisableExplicitGC
```
那么System.gc()有什么作用吗？
在使用堆外内存的时候，会配合使用。
通过-XX:MaxDirectMemorySize来指定最大的堆外内存大小，当使用达到了阈值的时候将调用System.gc来做一次full gc，以此来回收掉没有被使用的堆外内存。