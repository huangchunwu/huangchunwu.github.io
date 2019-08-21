---
title: 高并发下，redis热点KEY的解决方案
date: 2019-05-05 20:49:24
tags: 缓存
categories: 技术
---


## 背景

在高并发系统中，我们将多个KEY数据分片，hash均衡分布在redis集群中，如果遇到活动，或者明星的热点新闻，那这台存有热点的KEY的redis实例，遇到百万的流量，这台机器的网卡也恐怕撑不住了，那么redis基本就瘫痪了，服务器抓取不到redis的数据，直接去请求DB，那么db也就遭殃了，于是被领导拖到小黑屋.....
那么，有什么解决方案呢？

## 解决方案

主要分2步

>  1. 动态统计计算出KEY的请求次数，识别为热点数据
>  2. 识别出热点数据，通过zookeeper通知服务器更新为本地缓存，Ehcache,又或者是static map，当然要注意防止本地内存溢出。

如何动态识别KEY为热点数据？

- 客户端   

 redis客户端发起redis请求的时候，为每个KEY计数,存在本地缓存，或数据库

- 代理层  
 redis集群架构加一层，Twemproxy、Codis代理，由代理统计。（推荐）

- 服务端
利用redis的monitor命令

- 机器TCP流量	



参考资料
《Redis开发与运维》
[如果20万用户同时访问一个热点缓存，如何优化你的缓存架构？](https://mp.weixin.qq.com/s?__biz=MzU0OTk3ODQ3Ng==&mid=2247484401&idx=1&sn=823cffa4a1aa73335bdfb7c02e8c85f0&chksm=fba6ebf2ccd162e422b1b496f5790ebdf7f6d11adb8d2e00957ca371dcca0514a3fde09af521&mpshare=1&scene=23&srcid=#rd)