---
title: SpringBatch+MYSQL仓库+运维监控后台项目记录
date: 2019-01-11 21:30:18
tags: 
- 批处理
- SpringBatch
- Spring
categories: 技术
---
### 概念
Spring Batch 是一款轻量级地适合企业级应用的批处理框架，值得注意的是，不同于其他调度框架，Spring Batch不提供调度功能。

---

### 批处理过程
批处理可以分为以下几个步骤：
1. 读取数据
2. 按照业务处理数据
3. 归档数据的过程

---

### Spring Batch给我们提供了什么？

 1. 统一的读写接口 
 2. 丰富的任务处理方式
 3. 灵活的事务管理及并发处理 
 4. 日志、监控、任务重启与跳过等特性 

---

<!--more-->


### 基础组件

| 名称        | 用途   |
| --------   | -----:  |
| JobRepository     | 	用于注册和存储Job的容器 |  
| JobLauncher     | 	用于启动Job |  
| Job     | 	实际要执行的作业，包含一个或多个step |  
| step        |  步骤，批处理的步骤一般包含ItemReader, ItemProcessor, ItemWriter|  
| ItemReader        |    从给定的数据源读取item   | 
| ItemProcessor        |    在item写入数据源之前进行数据整理  | 
| ItemWriter        |    把Chunk中包含的item写入数据源。  | 
| Chunk        |    数据块，给定数量的item集合，让item进行多次读和处理，当满足一定数量的时候再一次写入。| 
| TaskLet        |    子任务表， step的一个事务过程，包含重复执行，同步/异步规则等。  | 


---

### job, step, tasklet 和 chunk 关系

一个job对应至少一个step，一个step对应0或者1个TaskLet，一个taskLet对应0或者1个Chunk
![我的头像](http://static.bookstack.cn/projects/SpringBatchReferenceCN/01_introduction/fig3-chunks.png)

---

### 实战：批处理excel插入数据库


#### 定义数据仓库

```

  <!-- 内存仓库  -->
    <!--<bean id="jobRepository" class="org.springframework.batch.core.repository.support.MapJobRepositoryFactoryBean"/>-->

    <!-- 数据库仓库  -->
    <batch:job-repository id="jobRepository" data-source="dataRepDruidDataSource"
                          isolation-level-for-create="SERIALIZABLE" transaction-manager="transactionManager"
                          table-prefix="BATCH_" max-varchar-length="1000" />

```

---

#### 定义启动器

```

    <!-- 作业调度器，用来启动job,引用作业仓库 -->
    <bean id="jobLauncher"
          class="org.springframework.batch.core.launch.support.SimpleJobLauncher">
        <property name="jobRepository" ref="jobRepository"/>
    </bean>

```

---

#### 定义JOB

```

    <batch:job id="userBatchJobName" restartable="true">
        <batch:step id="userStep">
            <batch:tasklet allow-start-if-complete="false"
                           start-limit="1" task-executor="taskExecutor" throttle-limit="5">
                <batch:chunk reader="userReader" writer="userWriter"
                             processor="userProcessor" commit-interval="5" retry-limit="10">
                    <batch:retryable-exception-classes>
                        <batch:include class="org.springframework.dao.DuplicateKeyException"/>
                        <batch:include class="java.sql.BatchUpdateException"/>
                        <batch:include class="java.sql.SQLException"/>
                    </batch:retryable-exception-classes>
                </batch:chunk>
            </batch:tasklet>
        </batch:step>
    </batch:job>

    <bean id="taskExecutor"
          class="org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor">
        <!-- 线程池维护线程的最少数量 -->
        <property name="corePoolSize" value="100"/>
        <!-- 线程池维护线程所允许的空闲时间 -->
        <property name="keepAliveSeconds" value="30000"/>
        <!-- 线程池维护线程的最大数量 -->
        <property name="maxPoolSize" value="300"/>
        <!-- 线程池所使用的缓冲队列 -->
        <property name="queueCapacity" value="100"/>
    </bean>
	
```

---

#### 定义ItemReader

```

     <bean id="userReader" class="org.springframework.batch.item.file.FlatFileItemReader">
        <property name="lineMapper" ref="lineMapper"/>
        <property name="resource" value="classpath:message/batch-data-source.csv"/>
    </bean>
	
```

```

 <!-- 将每行映射成对象 -->
    <bean id="lineMapper" class="org.springframework.batch.item.file.mapping.DefaultLineMapper">
        <property name="lineTokenizer">
            <bean class="org.springframework.batch.item.file.transform.DelimitedLineTokenizer">
                <property name="delimiter" value=","/><!-- 根据某种分隔符分割 -->
                <property name="names" value="id,name" />
            </bean>
        </property>
        <property name="fieldSetMapper"><!-- 将拆分后的字段映射成对象 -->
            <bean class="com.hcw.core.batch.UserFieldSetMapper" />
        </property>
    </bean>
	
```

---
#### 定义ItemWriter

```

     <bean id="userWriter" class="com.hcw.core.batch.MyBatchItemWriter" scope="step">
        <property name="statementId" value="com.hcw.core.batch.dao.UserToMapper.batchInsert"/>
        <property name="sqlSessionFactory" ref="sqlSessionFactoryTo"/>
    </bean>
	
```
---

#### 定义ItemProcessor

```

    <bean id="userProcessor" class="com.hcw.core.batch.UserItemProcessor"/>
	
```
---

#### 定义jobRepository的数据源

```

   <bean id="dataRepDruidDataSource" class="com.alibaba.druid.pool.DruidDataSource"
		  init-method="init" destroy-method="close">
		<property name="url" value="${jdbc.mysql.rep.connection.url}" />
		<property name="username" value="${jdbc.mysql.rep.connection.username}" />
		<property name="password" value="${jdbc.mysql.rep.connection.password}" />
		<property name="filters" value="${jdbc.mysql.rep.connection.filters}" />
		<property name="maxActive" value="${jdbc.mysql.rep.connection.maxActive}" />
		<property name="initialSize" value="${jdbc.mysql.rep.connection.initialSize}" />
		<property name="maxWait" value="${jdbc.mysql.rep.connection.maxWait}" />
		<property name="minIdle" value="${jdbc.mysql.rep.connection.minIdle}" />
		<property name="timeBetweenEvictionRunsMillis"
				  value="${jdbc.mysql.rep.connection.timeBetweenEvictionRunsMillis}" />
		<property name="minEvictableIdleTimeMillis"
				  value="${jdbc.mysql.rep.connection.minEvictableIdleTimeMillis}" />
		<property name="validationQuery"
				  value="${jdbc.mysql.rep.connection.validationQuery}" />
		<property name="testWhileIdle"
				  value="${jdbc.mysql.rep.connection.testWhileIdle}" />
		<property name="testOnBorrow" value="${jdbc.mysql.rep.connection.testOnBorrow}" />
		<property name="testOnReturn" value="${jdbc.mysql.rep.connection.testOnReturn}" />
		<property name="poolPreparedStatements"
				  value="${jdbc.mysql.rep.connection.poolPreparedStatements}" />
		<property name="maxPoolPreparedStatementPerConnectionSize"
				  value="${jdbc.mysql.rep.connection.maxPoolPreparedStatementPerConnectionSize}" />
	</bean>
	
```

#### 启动JOB

```

启动tomcat,打开启动页面

```

 ![我的头像](https://upload-images.jianshu.io/upload_images/3666580-7ef9722ce9bed1bf.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 
---


### 源码地址
[batch-framework](https://github.com/huangchunwu/batch-framework)

---

### 参考资料
[SpringBatch 中文文档](https://www.bookstack.cn/read/SpringBatchReferenceCN/README.md)