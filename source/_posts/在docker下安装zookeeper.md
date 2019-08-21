---
title: 在docker下安装zookeeper
date: 2019-07-08 15:51:25
tags: zookeeper
categories: 技术
---

## 下载zk镜像


	docker pull zookeeper


## 启动容器

	docker run --name some-zookeeper -it -p 2181:2181 -p 2888:2888 -p 3888:3888 zookeeper
	# 2181 端口号时 zookeeper client 端口
	# 2888端口号是zookeeper服务之间通信的端口
	# 3888端口是zookeeper与其他应用程序通信的端口
	# 使用 ZK 命令行客户端连接 ZK
	docker run -it --rm --link some-zookeeper:zookeeper zookeeper zkCli.sh -server zookeeper


![zk](/images/zk.png)
