---
title: 源码阅读利器-UML类图
date: 2019-04-27 23:34:23
tags: UML
categories: 技术
---

## 预备知识


### 为什么要有类图？

类图(Class diagram)主要用于描述系统的结构化设计。类图也是最常用的UML图，用类图可以显示出类、接口以及它们之间的静态结构和关系。

### 领域UML类图 VS 实现UML类图

通常在软件需求分析的时候，产品设计师需画一份领域UML类图，
设计阶段，研发会画一份实现UML类图，二者还是有区别的。



## 读懂UML


1. 类继承

![汽车与SUV之间为泛化关系；](/images/uml_generalization.jpg)


注：最终代码中，泛化关系表现为继承非抽象类

3. 接口实现

![实现关系(realize)](/images/uml_realize.jpg)

注：最终代码中，实现关系表现为继承抽象类；

4. 聚合关系

如下图表示A聚合到B上，或者说B由A组成；
![聚合关系](/images/uml_aggregation.jpg)


```
public class WildGooseAggregate {
    private List<WildGoose> wideGooses;
}
```


5. 组合关系

![组合关系](/images/uml_composition.jpg)

```
public class Bird {
    private Wing wing;
    public Bird() {
        wing = new Wing();
    }
}
```

组合关系是一种强依赖的特殊聚合关系，如果整体不存在了，则部分也不存在了；例如， 公司不存在了，部门也将不存在了；

6. 关联关系

![关联关系](/images/uml_association.jpg)

```
public class Penguin {
    private Climate climate;
}
```
注：在最终代码中，关联对象通常是以成员变量的形式实现的；

7. 依赖关系

![依赖关系](/images/uml_dependency.jpg)

```
public class Programmer{
    public void work(Computer computer) {
        
    }
}
```
注：在最终代码中，依赖关系体现为类构造方法及类方法的传入参数，箭头的指向为调用关系；依赖关系除了临时知道对方外，还是“使用”对方的方法和属性；