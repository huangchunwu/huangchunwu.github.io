---
title: Redis incr做接口访问频率的坑
date: 2019-04-29 20:27:33
tags:
- Redis
categories: 技术
---

## 背景
在互联网高并发的分布式系统中，我们需要对接口限流，我会用Redis的incr命令，如果是单机的话，用Guava的RateLimiter就可以了。

## 前置知识

INCRBY key increment

```
redis> SET page_view 20
OK

redis> INCR page_view
(integer) 21

redis> GET page_view    # 数字值在 Redis 中以字符串的形式保存
"21"
```

这里需要注意的是:
为键 key 储存的数字值加上增量 increment 。
如果键 key 不存在， 那么键 key 的值会先被初始化为 0 ， 然后再执行 INCRBY 命令。。

```
redis> TTL key
```

当 key 不存在时，返回 -2 。 当 key 存在但没有设置剩余生存时间时，返回 -1 。 否则，以秒为单位，返回 key 的剩余生存时间。




## 现象

我实现一个功能，限制一分钟内，接口的访问频率是100次，于是写出如下的代码

```
Jedis redis = getRedis();
try {
    Long count = redis.incrBy(key, 1);
    redis.expire(key,60);
    if (count > maxAllowedTimes) {
			return false;
	}else{
	   return true;
	}
} finally {
    redis.close();
}
```
这里设置KEY过期时间为60s内，KEY由1开始递增，当KEY超过阈值，则请求不给通过，看起来，没有问题。其实这里的问题出在上一篇[Redis执行expire命令失败引发的坑](https://huangchunwu.github.io/2019/04/28/Redis%E6%89%A7%E8%A1%8Cexpire%E5%91%BD%E4%BB%A4%E5%A4%B1%E8%B4%A5%E5%BC%95%E5%8F%91%E7%9A%84%E5%9D%91/)提到的，如果redis.expire(key,60)执行失败了，那么KEY就遗留在内存里面，失去了“60s内限流的作用”。

网上Google了下“Redis 坑”，列举了好几页，redis要慎用啊。
比如：
```
Jedis redis = getRedis();
try {
    redis.set(SafeEncoder.encode(key), SafeEncoder.encode(def + ""), "nx".getBytes(),
    "ex".getBytes(), exp);
    Long count = redis.incrBy(key.getBytes(), val);
} finally {
    redis.close();
}
```
这段代码，如果KEY在失效时间内执行set,发现KEY已经存在，则不设置过期时间，
刚好在执行set, incrBy 之间过期了，那么这个KEY就一直存在了。

还有一位老兄这样写：

```
Jedis jedis = RedisUtils.getJedis();
String requestKey = Times + ":" + ID + ":" + getId();
if (jedis.exists(requestKey)) {
    //如果这里KEY过期
	jedis.incr(requestKey);
	String times = jedis.get(requestKey);
	if (StringUtil.strIsNotEmpty(times)){
		if (Long.parseLong(times) > maxAllowedTimes) {
			jedis.del(requestKey);
			return true;
		}
	}
} else {
	jedis.set(requestKey, "1");
	jedis.pexpire(requestKey,REQUEST_EXIT_MILLISECONDS);
```

如果上述代码在KEY有效期执行，在标注的地方刚好失效，则执行incr，设置KEY为0，永久有效。

## 解决方案
TTL校验过期时间，如果没set expire成功重新重试6次，还是失败，则发给MQ，后续再做处理
```
try (Jedis redis = getRedis()) {
	Long count = redis.incrBy(key.getBytes(), val);
	if (count == val) {
             try{
                 redis.expire(key, exp);
              }catche(Exception e){ 
                  redis.expire(key, exp);
              }finally{
                   if(redis.ttl(key)==-1){
                       try{   
                         redis.expire(key, exp);
                      }finally{
                          sendMQ(key);##发送给MQ，接着消费处理
                        }
                   }
              }
	   
	}
}
```