---
title: maven多继承父pom
date: 2019-09-23 18:58:37
tags: maven
categories: 技术
---


maven工程在管理项目模块关系方面，提供了方便。比如定义一个pom文件，作为父级pom，管理多个模块module，这样的好处，可以用pom管理子模块的jar的版本号，子模块不需要声明jar的版本，假如后期升级jar版本只需要修改pom的版本号即可，配置如下：

定义父POM
```
    <groupId>cn.hasfun</groupId>
    <artifactId>hasfun-pom</artifactId>
    <packaging>pom</packaging>
    <version>1.0.0-SNAPSHOT</version>
    <name>hasfun-pom</name>
    
    
     <modules>
        <module>hasfun-common</module>
        <module>hasfun-web</module>
        <module>hasfun-question</module>
        <module>hasfun-db</module>
        <module>hasfun-page</module>
        <module>hcw-netty-springmvc</module>
        <module>hcw-net-framework</module>
        <module>test</module>
    </modules>
    
    
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <junit.version>4.12</junit.version>
        <spring-webmvc.version>4.1.4.RELEASE</spring-webmvc.version>
        <spring-context.version>4.1.4.RELEASE</spring-context.version>
        <spring-web.version>4.1.4.RELEASE</spring-web.version>
        <spring-test.version>4.1.4.RELEASE</spring-test.version>
    </properties>
    
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>junit</groupId>
                <artifactId>junit</artifactId>
                <version>${junit.version}</version>
                <scope>test</scope>
            </dependency>

            <!-- SpringMVC 配置开始-->
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-webmvc</artifactId>
                <version>${spring-webmvc.version}</version>
            </dependency>
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-context</artifactId>
                <version>${spring-context.version}</version>
            </dependency>
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-web</artifactId>
                <version>${spring-web.version}</version>
            </dependency>
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-test</artifactId>
                <version>${spring-test.version}</version>
            </dependency>
...
        </dependencies>
    </dependencyManagement>
```

子模块

```
   <parent>
        <artifactId>hasfun-pom</artifactId>
        <groupId>cn.hasfun</groupId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>
    
    
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
        </dependency>
        ...
</dependencies>
```

如上，是定义了一个父pom，与子模块的单继承关系。今天遇到项目里面需要继承公司的底层pom，可是我又想继承自定义pom，又如何实现多继承？父POM，自定义POM继承父POM，子模块再继承自定义pom。今天研究了一下，只需要这样写：
```
<dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>1.5.2.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
<dependencyManagement>
```