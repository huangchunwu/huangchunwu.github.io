---
title: hexo主题优化
date: 2019-01-11 22:58:44
tags: hexo
categories: 技术
---

hexo搭建好博客后，需要给博客的装扮下，记录一下一些主题优化技巧


## 安装文章计数插件WordCount
第一步：在blog根目录下，执行以下命令
```
npm install hexo-wordcount --save
```

---


第二步：修改配置文件
```
# 开启字数统计
word_count: true
```
---


第三步：修改主题 swig 布局

找到`themes/next/layout/_macro/post.swig`文件，修改【字数统计】，找到如下代码：
```
<span title="{{ __('post.wordcount') }}">
    {{ wordcount(post.content) }}字
</span>
```
同理，我们修改【阅读时长】，修改后如下：
```
<span title="{{ __('post.min2read') }}">
    {{ min2read(post.content) }} 分钟
</span>
```

## 增加站内搜索
第一步：在blog根目录下，执行以下命令
```
npm install hexo-generator-search --save
```

第二步：编辑站点配置文件，新增以下内容到任意位置：
```
search:
  path: search.xml
  field: post
  format: html
  limit: 10000
```

第三步：接着修改主题配置文件_config.yml为
```
local_search:
enable: true
```