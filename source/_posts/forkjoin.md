---
title: 并行计算框架forkJoin框架
date: 2019-01-25 21:04:58
tags: 
- forkJoin 
categories: 技术
---
## 框架思想
当业务系统遇到要处理大任务的时候，可以拆分成小任务来执行，最后将小任务的执行结果汇总，返回给大任务，简称为“分而治之”，jdk7提供了forkJoin框架，Hadoop提供了MapReduce。

---

## 适合场景
> 多核CPU服务器
> CPU密集的应用，
> 并行计算的应用


---



## 主要方法
### forkJoinTask 抽象类
不直接使用，直接使用以下子类提供的fork与join方法
> RecursiveAction 无返回值
> RecursiveTask 有返回值
    
---    
     
### forkJoinPool 线程池
提供了forkJoin线程池。每一个工作线程维护一份双端队列，队列里面存放待执行的任务，线程池内部使用“工作窃取算法”，即工作线程自己的队列任务处理完了，可以“窃取”其他线程的队列的任务去执行，提供的CPU利用率，所以工作线程不要用于IO流操作等超时任务。

---

### 工作窃取算法
每一个工作线程维护一份双端队列，当工作线程处理完自己的队列后，会窃取其他线程的队列帮忙处理，充分使用所有线程资源，直到处理完所有的队列，这才是特别的地方。


---

### fork/Join框架基本模板
```
if(任务足够小){
    进行计算；
}else{
    将任务分为两个部分；
    结合两个子任务结果；
}
```
## 实现代码
``` javascript

public class CountTask extends RecursiveTask<Integer> {


    /**
     * 临界值
     */
    private static final int THRESHOLD = 1000;

    int start=0;
    int end=100000;
    int sum = 0;

    public CountTask(int start,int end){
        this.start = start;
        this.end = end;
    }



    @Override
    protected Integer compute() {

        if (end-start<THRESHOLD){
            for (int i=start;i<end;i++){
                sum += i;
            }
        }else {
            int middle = (start + end)/2;

            RecursiveTask<Integer> left_task =  new CountTask(start,middle);
            RecursiveTask<Integer> right_task =  new CountTask(middle,end);

            invokeAll(left_task,right_task);

            sum = left_task.join() + right_task.join();
        }
        return sum;
    }
}


/**
 * 分而治之
 * forkjoin 线程池是双端队列，采用窃取算法
 * Created by huangchunwu on 2019/1/21.
 */
public class ForkJoinTaskTest {


    @Test
    public  void testInvokeForkPool(){
        // 创建一个通用池，这个是jdk1.8提供的功能
        ForkJoinPool pool = ForkJoinPool.commonPool();

        long startTime = System.currentTimeMillis();
        ForkJoinTask task = new CountTask(1,999999999);
        Integer result = (Integer) pool.invoke(task);
        long endTime = System.currentTimeMillis();
        System.out.println("Fork/join sum: " + result + " in " + (endTime - startTime) + " ms.");
    }


    @Test
    public  void testsubmitForkPool(){
        // 创建一个通用池，这个是jdk1.8提供的功能
        ForkJoinPool pool = ForkJoinPool.commonPool();

        long startTime = System.currentTimeMillis();
        ForkJoinTask task = new CountTask(1,999999999);
        pool.submit(task);
        Integer result =0;
        try {
            result = (Integer) task.get();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        long endTime = System.currentTimeMillis();
        System.out.println("Fork/join sum: " + result + " in " + (endTime - startTime) + " ms.");
    }
}

```


---


## 参考资料

[Fork-Join分治编程介绍（一）](https://www.cnblogs.com/jinggod/p/8490511.html)
[示例源码](https://github.com/huangchunwu/own)