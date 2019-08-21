---
title: 利用docker搭建mysql开发环境
date: 2019-06-16 13:47:49
tags: docker
categories: 技术
---

docker真是一个好东西。以前我们安装一个mysql可能需要以下几步：

 - 下载应用程序
 - 解压、安装
 - 配置

使用docker后

 - 下载镜像
 - 启动容器
 - 完成
 
具体操作：
``` javascript
 $ docker pull mysql #下载最新的MYSQL镜像
 $ docker run -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql #启动mysql容器
``` 
通过以下命令查看有没有成功

``` javascript
 $ docker image ls #查询MYSQL镜像
 $ docker ps #查看mysql容器
 $ docker  container ls #查询正在运行的容器
 
``` 

最新版本的mysql8，官网说比之前的性能快了2倍，
今天在测试使用sqlyog或者navicat 去 连接MySQL8.0 的时候，出现如下报错提示：
``` 
ERROR 2059 (HY000): Authentication plugin 'caching_sha2_password' cannot be loaded
``` 

查了网上的帖子，方案如下：



``` javascript
docker exec -it mysql bash#进入mysql容器

mysql -u root -p 123456;
 
SELECT `user`, `host`, `authentication_string`, `plugin` FROM mysql.user;#查询root的账号的密码验证插件类型

修改root账号的密码验证插件类型：

ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';

flush privileges;
 
``` 

再用sqlyog或者navicat登陆一下，大功告成
