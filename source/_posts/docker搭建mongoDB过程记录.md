---
title: docker搭建mongoDB过程记录
date: 2019-06-29 23:31:31
tags: 
- mongoDB
- docker
categories: 技术
---

最近用笔记本用了几次docker，感觉特别轻巧，方便，相较6年前用虚拟机VM那种笨重感再也没有了。有个好处就是，搭建环境很轻便。想起网上的段子，“大象塞进冰箱要几步”，不管要多少步，总得先弄头大象吧，学习一门新技术也是如此，比如我最近在看mongo，不管懂不懂，先装一个mongodb敲个hello world练练手。
在新公司，牛逼的代码倒是没看见，新技术倒是不少，趁着这样的环境多学习多练习也是极好的，下面记录下我安装MongoDB的过程.

## 下载镜像

	docker pull mongo

下载docker官方仓库提供的最近版本的镜像

	docker images#查询是否有mongo镜像


## 开启MongoDB容器

	docker run -d -p 27017:27017 -v mongo_configdb:/data/configdb -v mongo_db:/data/db --name mongo docker.io/mongo

- 镜像映射的端口号是27017，
- 配置文件的位置在/data/configdb
- 数据库文件的位置在/data/db


	docker container ls# 查询容器是否已经启动
	docker stop mongo #停止mongo
	docker rm mongo #删除mongo容器


## 利用客户端连接

[Robo 3T](https://www.robomongo.org/)可以连接MongoDB的免费客户端。
就可以登录到mongoDB服务器，执行CURD了。