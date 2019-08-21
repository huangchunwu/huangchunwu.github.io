---
title: Redis执行expire命令失败引发的坑
date: 2019-04-28 22:12:22
tags:
- 面试
- Redis
categories: 技术
---

## 背景

在我们做系统开发的时候，遇到高并发的场景，我们对一些数据会直接借助Redis存储，又或者借助Redis实现分布式锁，它带给我们很多的好处，同时我们在使用的时候，会遇到很多的坑，接下来，是我面试的时候遇到的一个问题，我平时一直没意识到。

给KEY设置过期时间，如下
```
EXPIRE key seconds
```
我们系统Redis通过集群，实现HA，可是也难免会因为网络抖动，又或者Redis达到瓶颈，EXPIRE/DELETE 这样的操作，可能会失败，导致的后果就是Redis残留无效KEY。那么日积月累。。。





## 前置知识

 1. 给定 key 的剩余生存时间

```
redis> TTL key
```

 2. Redis分布式锁

Redis分布式锁在2.6.12版本之后的实现方式比较简单，只需要使用一个命令即可：
```
SET key value [EX seconds] [NX]
```
这个命令相当于2.6.12之前的setNx和expire两个命令的原子操作命令

 3. GETSET key value


```
redis> GETSET db mongodb    # 没有旧值，返回 nil
(nil)

redis> GET db
"mongodb"

redis> GETSET db redis      # 返回旧值 mongodb
"mongodb"

redis> GET db
"redis"
```

将键 key 的值设为 value ， 并返回键 key 在被设置之前的旧值


## 如何解决

当时，因为知识体系里面没有这个东西，没有答出来。今天回头想想，翻了一下《Redis实战》，里面有提到这个，

> 为了确保锁在客户端已经崩溃（客户端在执行介于SETNX与EXPIRE之间的时候崩溃是最糟糕的）的情况下仍然能够自动被释放，客户端会在尝试获取锁失败之后，检查锁的超时时间，并为未设置超时时间的锁设置超时时间。

那么如果第二次EXPIRE又失败了，怎么办？
我想到的方案是，重试5次，还失败的话，将失败的KEY,放入MQ等待下次消费。


## Redis分布式锁，如果EXPIRE失败，导致死锁

通过上面，我们也知道了不能依赖EXPIRE让KEY失效。Redis在分布式锁上，更不能依赖EXPIRE释放锁，网上借鉴来的比较稳妥的方法如下

```
public booelan getLock(String lockKey) {
    boolean lock = false;
    while (!lock) {
        String expireTime = String.valueOf(System.currentTimeMillis() + 5000);
        // (1)第一个获得锁的线程，将lockKey的值设置为当前时间+5000毫秒，后面会判断，如果5秒之后，获得锁的线程还没有执行完，会忽略之前获得锁的线程，而直接获取锁，所以这个时间需要根据自己业务的执行时间来设置长短。
        lock = shardedXCommands.setNX(lockKey, expireTime);
        if (lock) { // 已经获取了这个锁 直接返回已经获得锁的标识
            return lock;
        }
         // 没获得锁的线程可以执行到这里：从Redis获取老的时间戳
        String oldTimeStr = shardedXCommands.get(lockKey);
        if (oldTimeStr != null && !"".equals(oldTimeStr.trim())) {
            Long oldTimeLong = Long.valueOf(oldTimeStr);
            // 当前的时间戳
            Long currentTimeLong = System.currentTimeMillis();
            // (2)如果oldTimeLong小于当前时间了，说明之前持有锁的线程执行时间大于5秒了，就强制忽略该线程所持有的锁，重新设置自己的锁
            if (oldTimeLong < currentTimeLong) { 
                // (3)调用getset方法获取之前的时间戳,注意这里会出现多个线程竞争，但肯定只会有一个线程会拿到第一次获取到锁时设置的expireTime
                String oldTimeStr2 = shardedXCommands.getSet(lockKey, String.valueOf(System.currentTimeMillis() + 5000)); 
                // (4)如果刚获取的时间戳和之前获取的时间戳一样的话,说明没有其他线程在占用这个锁,则此线程可以获取这个锁.
                if (oldTimeStr2 != null && oldTimeStr.equals(oldTimeStr2)) { 
                    lock = true; // 获取锁标记
                    break;
                }
            }
        }
        // 暂停50ms,重新循环
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            log.error(e);
        }
    }
    return lock;
}

```

## 参考

[Redis在京东到家的订单中的使用](https://tech.imdada.cn/2017/06/30/daojia-redis/)