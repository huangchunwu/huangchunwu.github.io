---
title: Linux磁盘不足排查过程
date: 2019-10-23 14:32:23
tags: Linux
categories: 技术
---

今天，群里面有人@我服务挂了，群里都是公司那些老资格的大佬，心里一揪，还好是开发环境。我故作镇定的说，我看看，我打开Linux服务器，shell里面敲了服务状态命令，的确是挂了。于是我先重启，报错提示no space left on device。看这意思是没有空间了，不知道是内存没有空间了还是磁盘没有空间了，英语不好，于是只能轮流试一下

```shell
[root@storm bin] free -m
             total       used       free     shared    buffers     cached
Mem:         7983        4943       3039          0     132        183
-/+ buffers/cache:       4628       3354
Swap:         2015       1409       606
```

可见内存还剩3G。排除了内存，十有八九是磁盘了。于是敲下命令

```shell
[root@storm bin] df -h
Filesystem            Size  Used Avail Use% Mounted on
/ttt/pda1              47G   47G   0M  100% /
```

的确是磁盘满了，那么是哪里的文件占用了大量的磁盘空间呢?估计是应用日志。还是敲命令定位一下,因/为我们服务放在/opt/app下，所以从这个目录找起

```shell
[root@storm bin] du -sh /opt/app |grep G
38G /opt/app
[root@storm bin] du -sh /opt/app/* |grep G
20G /opt/app/message_plateform
11G /opt/app/question-h-cache
```

到此，占据内存的罪魁祸首找到了。磁盘总共47G，message_plateform，question-h-cache这2个服务就占据了31G。联系系统owner解决掉。那么问题来了，如何防止此类问题？

第一个就是运维写个脚步本，定期清理过期日志文件；

第二个logback提供自动压缩归档日志文件，自动清除旧的日志归档文件。

另外，可能出现磁盘空间足够，导致文件生成失败还有另一个原因，就是文件索引节点inode已满

```shell
[root@storm bin] df -i
Filesystem                    Inodes   IUsed  IFree IUse% Mounted on
/dev/mapper/dev01-root       4964352 4964352      0  100% /
udev                          503779     440 503339    1% /dev
tmpfs                         506183     353 505830    1% /run
none                          506183       5 506178    1% /run/lock
none                          506183       2 506181    1% /run/shm
/dev/sda1                     124496     255 124241    1% /boot
```

inodes 占用100%
