---
title: 类的加载机制与对象的实例化
date: 2019-03-26 20:15:42
tags: 
- 类的加载机制
categories: 技术
---


今天读到周志明的《深入理解java虚拟机》中类加载机制与对象的实例化这块，这本书说实话，还是有点生涩难懂，不过老祖先有祖训：“书读百遍，其义自见”，这句话是对的，我也是时隔2年，重新拜读的。

---

## 前置知识点

### 成员变量与静态变量的区别

静态变量 别名 类变量；成员变量 别名 实例变量
类的静态方法和静态变量属于类，作为类型数据保存在方法区，其生命周期取决于类，而实例方法和字段位于Java堆，其生命周期取决于对象的生命周期。

---

### 类初始化与类实例化的区别

类的初始化是指虚拟机加载CLASS文件到内存中，将Class文件解析成JVM理解的执行指令，将类变量指定初始值，和类的函数方法等存入方法区，将class文件的符号引用转成方法区的直接引用。
类初始化之后就可以访问类的静态字段和方法，而访问类的非静态(实例)字段和方法，就需要创建类的对象实例，故**类的实例化是在类的初始化之后，是在堆上创建一个该类的对象**

---



## 类加载过程

-  装载（加载class解释成虚拟机的方法区的运行期数据结构）
-  验证（解析class文件合法性）
-  准备(类变量设初始值，而非实例变量)
-  解析（符号引用转成直接引用）
-  初始化（类变量与static语句初始化）
-  使用、卸载


## 类的实例化

-  虚拟机接受new指令，
-  类加载过程，父类静态变量与静态方法块执行完毕，子类静态变量与静态方法执行完毕
-  再执行父类的实例变量与构造方法，最后执行子类的实例化变量与构造方法

## 举例

``` javascript

public abstract class ObjectCreateAEx {
    ObjectCreateAEx(){
        int a = getAV();
        System.out.println(a);
    }

    public abstract int getAV();
}



public class ObjectCreateBEx extends ObjectCreateAEx{

    private int a = 10;

    private static int b = 11;

    private static final  int c = 12;

    ObjectCreateBEx(int a){
        a = a;
    }


    @Override
    public int  getAV() {
       return a;
    }


    public static void main(String[] args) {
        ObjectCreateBEx  aEx =  new ObjectCreateBEx(100);
    }
}
``` 

计算打印的结果是：0。为什么?因为类初始化的是静态变量b，而a是在实例化后才赋值成10的,
类实例化的过程是，先构造函数，再实例变量赋值。所以父类构造函数调用子类的变量，取得是子类还未赋值的初始化变量

## 附录

[示例代码](https://github.com/huangchunwu/own)