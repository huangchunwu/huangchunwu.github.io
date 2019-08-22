---
title: 解决服务器宕机重启，Java服务不能自启动的问题
date: 2019-08-21 15:24:27
tags: 棉花糖
categories: 技术
---

JAVA程序发布的时候，最常见的是会编译成war包，又或者jar包。

war包是用来发布带网页JSP等的程序，而只是一些Java和配置文件组成的服务程序只需要jar则可以，war部署在Tomcat下面，jar包只要在命令行敲个命令 java -jar demo.jar 则可，多么清晰干脆。命令行操作，带来二个问题

```java
1:运营人员不小心关闭了命令行，服务则关闭了，这种在window下常见
2:当服务器异常重启，Java服务是不能自动重启的，那么怎么解决呢？
```

### Java Service Wrapper

**wrapper ** 包装的意思，就是将jar包装成windows或者Linux的服务，这样服务器重启也会随着服务器服务一起重启。 

使用java service wrapper 只需要简单的配置，无需添加任何代码，无侵入性。

[Java Service Wrapper](http://wrapper.tanukisoftware.com/doc/english/download.jsp)  入手很简单，主要有以下几个目录

```shell
- demo-service
  -bin   # 启动demo服务的地方
   - run.sh # 启动文件
   - wrapper #wrapper系统文件
  -lib   # 将demo服务的jar放进来
   - wrapper.jar
   - libwrapper.so
   - logback**
  -conf  # 启动demo的一些配置文件 
    -wrapper.conf  # wrapper配置文件
    -logback.xml  # logback日志配置
  -logs  # demo服务的日志
    - demo-20190821.log  #应用日志
    - wrapper-2019-08-21.log #wrapper日志
```



1. run.sh  

```xml
*******省略***********************
# Wrapper
WRAPPER_CMD="./wrapper"
WRAPPER_CONF="../conf/wrapper.conf"
*******省略***********************
```

2：wrapper.conf

```xml
****
wrapper.java.mainclass=org.tanukisoftware.wrapper.WrapperSimpleApp
set.default.REPO_DIR=lib  # 设置LIB环境变量
set.APP_BASE=.

# Java Classpath (include wrapper.jar)  Add class path elements as
#  needed starting from 1
wrapper.java.classpath.1=lib/wrapper.jar
wrapper.java.classpath.2=%REPO_DIR%/* # 指定LIB目录

# Java Library Path (location of Wrapper.DLL or libwrapper.so)
wrapper.java.library.path.1=lib

# Java Bits.  On applicable platforms, tells the JVM to run in 32 or 64-bit mode.
wrapper.java.additional.auto_bits=TRUE

# Java Additional Parameters
wrapper.java.additional.1=-Dlogback.configurationFile=file:conf/logback.xml # 指定日志配置文件

# Initial Java Heap Size (in MB)
wrapper.java.initmemory=256  # 指定JAVA堆初始化大小

# Maximum Java Heap Size (in MB)
wrapper.java.maxmemory=1024 # 指定JAVA堆最大内存

# Application parameters.  Add parameters as needed starting from 1
wrapper.app.parameter.1=cn.hcw.gc.GcExample # 指定main函数

#********************************************************************
# Wrapper Logging Properties
#********************************************************************
# Enables Debug output from the Wrapper.
# wrapper.debug=TRUE

# Format of output for the console.  (See docs for formats)
wrapper.console.format=PM

# Log Level for console output.  (See docs for log levels)
wrapper.console.loglevel=INFO

# Log file to use for wrapper output logging.
wrapper.logfile=logs/wrapper-YYYYMMDD.log # 指定系统日志格式
wrapper.logfile.rollmode=DATE # 指定日志按日期分割

# Format of output for the log file.  (See docs for formats)
wrapper.logfile.format=LPTM

# Log Level for log file output.  (See docs for log levels)
wrapper.logfile.loglevel=INFO

# Maximum size that the log file will be allowed to grow to before
#  the log is rolled. Size is specified in bytes.  The default value
#  of 0, disables log rolling.  May abbreviate with the 'k' (kb) or
#  'm' (mb) suffix.  For example: 10m = 10 megabytes.
wrapper.logfile.maxsize=500 # 指定日志文件内存最大大小

*******省略***********************

# Name of the service
wrapper.name=demo-app-service

# Display name of the service
wrapper.displayname=demo-app-service Application

# Description of the service
wrapper.description=demo-app-service Description

# Service dependencies.  Add dependencies as needed starting from 1
wrapper.ntservice.dependency.1=

# Mode in which the service is installed.  AUTO_START, DELAY_START or DEMAND_START
wrapper.ntservice.starttype=AUTO_START

# Allow the service to interact with the desktop (Windows NT/2000/XP only).
wrapper.ntservice.interactive=FALSE


```

以上文件可以参加源码下载运行，至此，Java Service Wrapper 搭建成功，服务可以启动了。

在Linux下执行命令

```she
./run.sh start # 启动
./run.sh status # 服务运行状态
./run.sh stop #停止服务
```





### 源码

[Java Service Wrapper](https://github.com/huangchunwu/Java-Service-Wrapper-demo.git)



