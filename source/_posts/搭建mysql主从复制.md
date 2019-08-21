---
title: 搭建mysql主从复制
date: 2019-06-16 19:43:00
tags: Mysql
categories: 技术
---

### Master创建复制账号


	mysql> GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.*
         TO repl@'192.168.0.%' IDENTIFIED BY 'slave',;


### Master 上的配置


	vi /etc/my.cnf

在my.cnf文件中加入如下配置内容

	[mysqld]
	log-bin=mysql-bin
	server-id=1



### 从节点（Slave）配置

修改 Slave 的配置文件/etc/my.cnf

	vi /etc/my.cnf

在my.cnf文件中加入如下配置内容

	[mysqld
	server-id=2


### 启动复制

1.获取主节点当前binary log文件名和位置（position）


	mysql> SHOW MASTER STATUS;

2.通过1的查询结果，在从（Slave）节点上设置主节点参数

	mysql> CHANGE MASTER TO MASTER_HOST='server1',
        -> MASTER_USER='repl',
        -> MASTER_PASSWORD='slave',
        -> MASTER_LOG_FILE='mysql-bin.000001',
        -> MASTER_LOG_POS=0;


3.查看主从同步状态

	mysql> show slave status\G;


4.开启主从同步

	mysql> start slave;
