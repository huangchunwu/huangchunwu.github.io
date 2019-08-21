---
title: JUC工具类之exchanger
date: 2019-03-09 21:51:25
tags: JUC
categories: 技术
---
日常开发使用，JUC工具类里面的exchanger使用场景不多，既然看到了就学了一下记一下。
   
## 定义   
exchanger 用于二个线程，规定一个交换点，当双方线程到达这个点后，相互交换数据的效果。

## 应用
用于2个线程交互数据使用；经典生产消费者



## 示例代码

```
/**
 * java concurrent 包
 * <p>
 * 用于2个线程交互数据使用
 * 规定一个交换点，当双方线程到达这个点后，相互交换数据
 * <p>
 * <p>
 * Created by huangchunwu on 2019/3/4.
 */
public class ExchangeTest {


    @Test
    public void testExchange() {
        final Exchanger<Integer> exchanger = new Exchanger<Integer>();


        Runnable r1 = new Runnable() {
            @Override
            public void run() {
                try {
                    System.out.print(Thread.currentThread().getName() + "get " + exchanger.exchange(2019));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };


        Runnable r2 = new Runnable() {
            @Override
            public void run() {
                try {
                    System.out.print(Thread.currentThread().getName() + "get " + exchanger.exchange(2018));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };


        Thread t1 = new Thread(r1);
        t1.setName("A");
        Thread t2 = new Thread(r2);
        t2.setName("B");

        t1.start();
        t2.start();

        try {
            Thread.currentThread().sleep(1000000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

}
```

## 附录

[示例代码](https://github.com/huangchunwu/own)