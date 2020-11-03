---
title: hexo+GitHub搭建个人博客
date: 2018-12-01 21:04:58
categories: 技术
tags: hexo
---



------

做IT的没有一个自己的博客，不像话，于是现学现卖搭建了这个博客，记录下来，种下大树，便于后人乘凉

## 准备工作
> * 电脑一台，本文以win7为例
> * 给电脑安装git
> * 安装node.js
> * 申请GitHub 



## 安装hexo

在我的电脑里面建一个文件夹blog
然后进入blog文件夹，右击选择“Git Bash”
输入命令

```python
npm install -g cnpm --registry=https://registry.npm.taobao.org#安装npm
cnpm install -g hexo-cli
cnpm install hexo --save
hexo -v #安装完成后，在输入命令，验证是否安装正确
```
## 启动hexo

```python
hexo init #初始化hexo
	
cnpm install #安装生成器

hexo s -g #运行hexo,以后要在本地运行博客只要输入该命令即可
```
打开浏览器，输入localhost:4000,就可以在本地看到你的个人博客了
停止运行
按住Ctrl+C键即可停止

## 配置博客

使用notepad++编辑器打开blog/_config.yml文件，进行配置
```python
#博客名称
title: 我的博客
#副标题
subtitle: 一天进步一点
#简介
description: 记录生活点滴
#博客作者
author: John Doe
#博客语言
language: zh-CN
#时区
timezone:
#博客地址,与申请的GitHub一致
url: http://elfwalk.github.io
root: /
#博客链接格式
permalink: :year/:month/:day/:title/
permalink_defaults:
source_dir: source
public_dir: public
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: downloads/code
i18n_dir: :lang
skip_render:
new_post_name: :title.md # File name of new posts
default_layout: post
titlecase: false # Transform title into titlecase
external_link: true # Open external links in new tab
filename_case: 0
render_drafts: false
post_asset_folder: false
relative_link: false
future: true
highlight:
  enable: true
  line_number: true
  auto_detect: true
  tab_replace:
default_category: uncategorized
category_map:
tag_map:
#日期格式
date_format: YYYY-MM-DD
time_format: HH:mm:ss
#分页，每页文章数量
per_page: 10
pagination_dir: page
#博客主题
theme: landscape
#发布设置
deploy: 
  type: git
  #elfwalk改为你的github用户名
  repository: https://github.com/huangchunwu/huangchunwu.github.io.git
  branch: master
```

## 编写文章

```python
hexo new "new article"
```
之后在source/_posts目录下面，多了一个new-article.md的文件
打开之后我们会看到：
```python
title: new article
date: 2014-11-01 20:10:33
tags:
---
```
文件的开头是属性，采用统一的yaml格式，用三条短横线分隔。下面是文章正文。
文章的正文支持markdown格式，建议你先学习一下它的语法。markdown不像html似的一大堆标签，很简单，只有几个符号。
新建、删除或修改文章后，不需要重启hexo server，刷新一下即可预览。
```python
hexo clean # 删除已经生成的静态页面
hexo generate #生成静态网页
hexo deploy #部署到GitHub

hexo g -d #也可简写为（一起执行上边两个命令）
```