---
title: 如何用POI导出100W的数据到EXCEL
date: 2019-07-24 20:13:21
categories: 技术
tags: 
- POI
- 大数据
---

> POI导出EXCEL功能，是JAVA程序员入门的功能。一个同事问我，有没有什么好的性能高的方法，可以导出大数据量的Excel方法，据说他们公司之前的同事写的导出Excel，只有一万行记录，导致JVM直接OOM了，看来导出Excel这个功能，还是得重新梳理下，重视一下。



Google了一下，学习了一下excel各个版本，容纳的最大行数与列数还是不一样的。

> 早期的Office套件使用二进制格式，这里面包括以`.doc`、`.xls`、`.ppt`为后缀的文件；直到2007这个划时代的版本将基于XML的压缩格式作为默认文件格式，也就是相应以`.docx`、`.xlsx`、`.pptx`为后缀的文件



03版二进制Excel能支持的最大行数为65536,2007版本的是1048575。所以对于大数据量，建议使用xlsx格式。



做Excel的导出，POI就足够了，其他工具也是基于这个来开发的,比如easyExcel。然后操作大文件写入建议使用`SXSSFWorkbook`  ，顺便提一句大文件写入使用基于SAX的  `XSSFReader`。

基于上述原理，我在网上找到了一个开源框架，经过试验，我试着导出100W的数据到Excel，只花了`48s`，效果很好，源码简单看了一下，就是一些基础的封装，调用SXSSWorkbook操作的Excel，源码如下：

[huto的EXCEL大文件导出](https://github.com/huangchunwu/huto)。

当然，如果考虑到交互，用户体验好的话，还是避免让用户等待太久时间，建议如下：

页面发出导出请求，然后服务端收到请求后，异步处理导出，然后服务器将文件导出成功后上传到文件服务器，引导用户去文件服务器列表找。
