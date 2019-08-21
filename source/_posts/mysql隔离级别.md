---
title: MYSQL事务默认隔离级别为什么是可重复读
date: 2019-04-25 22:27:57
categories: 技术
tags: 
- 隔离级别
- Mysql
---

## 预备知识
### ACID是做什么的

```   
简而言之，解释为

    原子性（atomicity）
    一致性（consistency）
    隔离性（isolation）
    持久性（durability）  
```

**为保证数据库事务操作的正确性与可靠性**，必须满足以上4个特性。





---

### 事务隔离级别跟ACID有啥关系

上面ACID的4个特性中，其他三个都是针对单一事务，当出现并行事务的时候，就会存在以下几个问题：

 - 脏读
 - 不可重复读
 - 幻读

数据库是怎么解决这个问题的呢？
简而言之，加锁。数据库提供了自动锁的功能，只需要用户指定会话的事务隔离级别，数据库就会分析SQL然后给事务访问的资源加入合适的锁。

事务隔离级别有以下

- 读未提交(Read UnCommitted)
- 读已提交(Read Commited，后面简称RC)
- 可重复读(Repeatable Read，后面简称RR)
- 序列化读(Serializable)

--- 

### binlog的几种格式

- statement:记录的是修改SQL语句
- row：记录的是每行实际数据的变更 ，RC隔离级别下使用的binlog格式   
- mixed：statement和row模式的混合

--- 

## MySQL事务默认隔离级别RR
我们知道，Oracal默认隔离级别是RC， Mysql默认隔离级别是RR，可不可以换成其他的？
数据库主从同步的方式是怎么样， 是通过binlog。
Mysql 5.0版本之前，binlog只支持STATEMENT这种格式。而这种格式**在RC隔离级别下主从同步是有bug的。因此Mysql将RR作为默认的隔离级别！**

---

## 互联网项目中mysql应该选什么事务隔离级别？

由上面我们知道了，mysql默认是可重复读的原因，那么我们可以升级Mysql到5,1即可以解决，**互联网项目大部分用的是RC**，为什么？

- 可重复读存在GAP锁，死锁的概率相对读已提交大
- 在RR隔离级别下，条件列未命中索引会锁表！而在RC隔离级别下，只锁行