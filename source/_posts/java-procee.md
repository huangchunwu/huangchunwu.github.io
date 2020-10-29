---
title: Java7,8,9,10,11,12新特性
date: 2019-09-30 13:54:58
tags: Java新特性
categories: 技术
---

Java9之后，JCP执行委员会提出将Java的发布频率改为每六个月一次。现在Java已经更新到Java 12了，可是我还停留在Java8上，不得不感慨程序员要保持学习，才能不会被淘汰啊。

---

版本 | 发布时间 | 特性
---|---|---
Java7 |2011年7月28日| NIO，捕获多个异常，jcmd替代jps，fork/join，Java Mission Control（类似JVisualVm），Files
Java8 |2014年3 月18日| **Lambda 表达式** − Lambda允许把函数作为一个方法的参数（函数作为参数传递进方法中），**Stream API**，**HashMaps性能提升（红黑树）**，**Date Time API**，StampedLock，**Optional**，**默认方法** − 默认方法就是一个在接口里面有了一个实现的方法；**方法引用** − 方法引用提供了非常有用的语法，可以直接引用已有Java类或对象（实例）的方法或构造器。与lambda联合使用，方法引用可以使语言的构造更紧凑简洁，减少冗余代码；**Nashorn, JavaScript 引擎** − Java 8提供了一个新的Nashorn javascript引擎，它允许我们在JVM上运行特定的javascript应用；**静态方法** 
Java9 |2017年9 月22日| **模块系统**：模块是一个包的容器，Java 9 最大的变化之一是引入了模块系统（Jigsaw 项目），**REPL (JShell)**：交互式编程环境；G1成为默认垃圾回收器，**HTTP 2 客户端**，同时改进httpclient的api，支持异步模式，jshell，docker方面支持，集合工厂方法（list,map,set）加入of，**改进的 Javadoc**：Javadoc 现在支持在 API 文档中的进行搜索。另外，Javadoc 的输出现在符合兼容 HTML5 标准；**私有接口方法**：在接口中使用private私有方法。我们可以使用 private 访问修饰符在接口中编写私有方法。**轻量级的 JSON API**：内置了一个轻量级的JSON API；**响应式流（Reactive Streams) API**: Java 9中引入了新的响应式流 API 来支持 Java 9 中的响应式编程；**进程 API**: 改进的 API 来控制和管理操作系统进程。引进 java.lang.ProcessHandle 及其嵌套接口 Info 来让开发者逃离时常因为要获取一个本地进程的 PID 而不得不使用本地代码的窘境。 
Java10 |2018年3 月21日| 局部变量类型推断支持var 局部变量，GC改进，线程本地握手
Java11 |2018年9 月25日| lombda表达式增强，string增加若干方法，纳入httpclient纳入Java的net包，将java9标记废弃的Java EE及CORBA模块移除掉，httpclient正式启用改为java.net.http模块，允许lambda表达式使用var变量,ZGC可扩展的低延迟垃圾收集器
Java12 |2019年3 月19日|Shenandoah：一个低停顿垃圾收集器（实验阶段），Switch 表达式扩展，改善 G1 垃圾收集器

---

总结下，Java8目前企业使用较多，其次是Java 11，其他版本没有特殊变化。Java10 之后，可以使用Java，像JavaScript一样声明局部变量，极大的简化了开发编写速度。 如下：

```
public class TestJava11 {


    @Test
    public void test1(){
        var words = List.of("a", "b", "c"); //初始化list
        var tempMap = Map.of("a",12,"b",14); //初始化MAP
        var tempSet = Set.of("1","2","4"); //初始化set
    }
}
```

Java11 将httpclient正式归于net包中,同时支持异步调用，以及http/2 最新的http协议

```java
 @Test
    public void test() throws Exception {

        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(20))
               // .proxy(ProxySelector.of(new InetSocketAddress("www.baidu.com", 80)))
                //.authenticator(Authenticator.getDefault())
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.baidu.com"))
                .timeout(Duration.ofMinutes(2))
                .header("Content-Type", "text/html")
                //.POST(HttpRequest.BodyPublishers.ofString("", StandardCharsets.UTF_8))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.statusCode());
        System.out.println(response.body());


        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenAccept(System.out::println);

        System.in.read();
    }
```





不多说了，后面用起来。