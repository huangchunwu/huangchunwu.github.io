---
title: SQL优化神器explain
date: 2019-04-20 20:20:06
tags:
- Mysql
categories: 技术
---

SQL优化，离不开explain。这里记下explain的常用列，方便以后查询。



这里提2个关键关于查询效率的列

---


### type列


``` javascript

|  ALL              |  全表扫描
|  index            |  索引全扫描
|  range            |  索引范围扫描，常用语<,<=,>=,between等操作
|  ref                |  使用非唯一索引扫描或唯一索引前缀扫描，返回单条记录，常出现在关联查询中
|  eq_ref           |  类似ref，区别在于使用的是唯一索引，使用主键的关联查询
|  const/system  |  匹配单条记录，系统会把匹配行中的其他列作为常数处理，如主键或唯一索引查询
|  null                |  MySQL不访问任何表或索引，直接返回结果

```
sql效率从上到下逐渐增高

---




### Extra列


``` javascript

| Using index | 表示使用索引

如果只有 Using index，说明他没有查询到数据表，只用索引表就完成了这个查询，这个叫覆盖索引。如果同时出现Using where，代表使用索引来查找读取记录，也是可以用到索引的，但是需要查询到数据表。

| Using where | 表示条件查询

不读取表的所有数据，或不是仅仅通过索引就可以获取所有需要的数据，则会出现 Using where。

| Using filesort |  排序语句ORDER BY的时候，会出现该信息。  

| Using temporary | 使用了临时表，多表联合查询，结果排序的场合。

```
sql效率从上到下逐渐增高
