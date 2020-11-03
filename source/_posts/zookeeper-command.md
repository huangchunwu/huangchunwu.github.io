---
title: 查询dubbo服务在zookeeper的部署情况
date: 2019-11-27 12:41:11
tags: dubbo
categories: 技术
---

公司没有部署dubbo的admin界面，只能学会去生产机器用命令行排查问题。故做下记录，以便后续排查问题使用。



先进到zk的服务器，在shell里面敲命令，进入zk的命令界面

```shell
[test@FZ-KAFKA-61-72 bin]$ ./zkCli.sh -server 127.0.0.1:2181
```

然后，会出现 

```shell
Connecting to 127.0.0.1:2181
.....
Welcome to ZooKeeper!
[zk: 127.0.0.1:2181(CONNECTED) 0]
```

接下来，就可以查询dubbo服务的节点了

```shell
[zk: 127.0.0.1:2181(CONNECTED) 0] ls /
[brokers, zookeeper, dubbo, consumers, config]

```

查询dubbo服务的所有暴露的服务接口

```shell
[zk: 127.0.0.1:2181(CONNECTED) 0] ls /dubbo
[com.hcw.user.provider.api.service.UserAccountDubboService]
```

查询某个服务的提供者与消费者的注册情况

```shell
[zk: 127.0.0.1:2181(CONNECTED) 0] ls  /dubbo/com.hcw.user.provider.api.service.UserAccountDubboService/providers

[dubbo%3A%2F%2F192.168.61.99%3A20891%2Fcom.hcw.api.QSearchService%3Fanyhost%3Dtrue%26application%3Desh-provider%26dubbo%3D2.5.3%26interface%3Dcom.hcw.api.QSearchService%26logger%3Dslf4j%26methods%3DfindStockDoc%26pid%3D18460%26revision%3D0.0.2-SNAPSHOT%26side%3Dprovider%26threads%3D100%26timestamp%3D1572509354829]

[zk: 127.0.0.1:2181(CONNECTED) 0] ls    /dubbo/com.hcw.user.provider.api.service.UserAccountDubboService/consumers

[consumer%3A%2F%2F192.168.61.114%2Fcom.hcw.api.QService%3Fapplication%3Dexam-consumer%26category%3Dconsumers%26check%3Dfalse%26dubbo%3D2.5.3%26interface%3Dcom.hcw.api.QSearchService%26logger%3Dslf4j%26methods%3DfindDocument%2Cf]

```

