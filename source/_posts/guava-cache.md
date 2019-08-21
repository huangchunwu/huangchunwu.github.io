---
title: Guava Cache 学习记录
date: 2019-01-15 23:26:12
tags: 
- 缓存 
- Guava
categories: 技术
---
## 为什么使用Guava Cache？

guava cache属于JVM内存的缓存,其实JAVA本地缓存框架有ecache，简单点有HashMap作为缓存容器,那么，为什么推荐用guava cache呢,比如以下：
1、设置缓存的过期时间,遵循LRU原则移除过期KEY
2、缓存的定期刷新
3、如何防止缓存穿透

LRU原则是指 Least Recently Used  最近最少使用,即活性不高的缓存会被淘汰掉


如果自己实现起来难度较大，谷歌开发对缓存操作作了封装，方便研发的重心集中在业务处理，无需关心底层实现，无需重复造轮子。

我们常用的是redis可以实现分布式缓存，为什么推荐用guava cache呢
1、同时造成了业务系统 强依赖于网络和redis服务器的稳定性
2、网络请求的效率远远没有本地内存快。



---

## 哪些场景适合使用Guava cache

通常缓存的用法，先请求本地缓存，如果本地缓存未命中，则去请求DB。
Guava cache 是本地缓存，所以适合数据量小的数据量的情况下使用。

---

## Guava cache特性
1、缓存不会自动刷新，需满足2个条件，`过期了`，`有get请求`
```
	static ListeningExecutorService executorService =
            MoreExecutors.listeningDecorator(Executors.newSingleThreadExecutor());

    // remove listener
    static RemovalListener<String, Integer> removalListener = new RemovalListener<String, Integer>() {
        public void onRemoval(RemovalNotification<String, Integer> removal) {
            System.out.println(DateUtils.time() +"cause:" + removal.getCause() + " key:" + removal.getKey() + " value:"
                    + removal.getValue());
        }
    };

    final static LoadingCache<String, Integer> loadingCache = CacheBuilder.newBuilder()
            .maximumSize(10)  //最多存放十个数据
         // .expireAfterWrite(3, TimeUnit.SECONDS)  //缓存200秒
            .refreshAfterWrite(1, TimeUnit.SECONDS)
            .removalListener(removalListener)
            .recordStats()   //开启 记录状态数据功能
            .build(new CacheLoader<String, Integer>() {
                //数据加载，默认返回-1,也可以是查询操作，如从DB查询
                @Override
                public Integer load(String key) throws Exception {
                    System.out.println(DateUtils.time() + ">>>>>>>>>>>>>>>>load>>>>>>>>>>>>>>>>");
                    return -1;
                }

                //有些键不需要刷新，并且我们希望刷新是异步完成的
                @Override
                public ListenableFuture<Integer> reload(final String key, final Integer oldValue) {
                    System.out.println(DateUtils.time() + ">>>>>>>>>>>>>>>>reload>>>>>>>>>>>>>>>>");
                    // we need to load new values asynchronously, so that calls to read values from the cache don't block
                    ListenableFuture<Integer> listenableFuture = executorService.submit(new Callable<Integer>() {
                        @Override
                        public Integer call() throws Exception {
                            try {
                                Integer value = load(key);
                                return value;
                            } catch (Exception ex) {
                                return oldValue;
                            } finally {
                            }
                        }
                    });
                    return listenableFuture;
                }
            });

```
执行结果
```
Sun Jan 20 18:55:46 CST 2019>>>>>>>>>>>>>>>>put>>>>>>>>>>>>>>>>
Sun Jan 20 18:55:50 CST 2019>>>>>>>>>>>>>>>>get>>>>>>>>>>>>>>>>
Sun Jan 20 18:55:50 CST 2019>>>>>>>>>>>>>>>>reload>>>>>>>>>>>>>>>>
Sun Jan 20 18:55:50 CST 2019>>>>>>>>>>>>>>>>load>>>>>>>>>>>>>>>>
Sun Jan 20 19:11:37 CST 2019>>>>>>>>>>>>>>>>cause:REPLACED key:1 value:1
```
由上述程序执行结果，可以看出，cache的key进行put后4S没有reload，第5S的时候get请求后，reload才开始。

2、Guava Cache的load方法不能返回null，否则抛异常，Guava Cache的get方法先在本地缓存中取，如果不存在，则会触发load方法。但load方法不能返回null。 

---

## Guava cache 有什么替代品
Caffeine 宣称拥有比 Guava Cache 高几倍的读写效率

---

## Guava cache使用步骤
 
### 引入maven的POM
```
<dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
       <version>19.0</version>
</dependency>
```
### Guava Cache初始化

#### Cache Callable
```
 final static Cache<Integer, String> cache = CacheBuilder.newBuilder()
            //设置cache的初始大小为10，要合理设置该值
            .initialCapacity(10)
            //设置并发数为5，即同一时间最多只能有5个线程往cache执行写入操作
            .concurrencyLevel(5)
            //设置cache中的数据在写入之后的存活时间为10秒
            .expireAfterWrite(10, TimeUnit.SECONDS)
            //构建cache实例
            .build();
 
```
#### LoadingCache

```
 final static LoadingCache<String, Integer> cache = CacheBuilder.newBuilder()
            .maximumSize(10)  //最多存放十个数据
            .expireAfterWrite(10, TimeUnit.SECONDS)  //缓存200秒
            .recordStats()   //开启 记录状态数据功能
            .build(new CacheLoader<String, Integer>() {
                //数据加载，默认返回-1,也可以是查询操作，如从DB查询
                @Override
                public Integer load(String key) throws Exception {
                    return -1;
                }
            });
                
```


### Guava Cache常用方法

```
/** 
 * 该接口的实现被认为是线程安全的，即可在多线程中调用 
 * 通过被定义单例使用 
 */  
public interface Cache<K, V> {  

  /** 
   * 通过key获取缓存中的value，若不存在直接返回null 
   */  
  V getIfPresent(Object key);  

  /** 
   * 通过key获取缓存中的value，若不存在就通过valueLoader来加载该value 
   * 整个过程为 "if cached, return; otherwise create, cache and return" 
   * 注意valueLoader要么返回非null值，要么抛出异常，绝对不能返回null 
   */  
  V get(K key, Callable<? extends V> valueLoader) throws ExecutionException;  

  /** 
   * 添加缓存，若key存在，就覆盖旧值 
   */  
  void put(K key, V value);  

  /** 
   * 删除该key关联的缓存 
   */  
  void invalidate(Object key);  

  /** 
   * 删除所有缓存 
   */  
  void invalidateAll();  

  /** 
   * 执行一些维护操作，包括清理缓存 
   */  
  void cleanUp();  
}

```

## 缓存回收

`基于容量回收` 

CacheBuilder.maximumSize(long)

`定时回收`   

expireAfterAccess(long, TimeUnit) -> KEY在一定时间内没有读写，则失效，下次读取直接load（）中取

expireAfterWrite(long, TimeUnit) -> 避免了缓存穿透的问题，保证了数据的实时性，牺牲的是性能，当数据expire的时候，大量get请求过来的时候，只有一个请求会去load（）数据，而没有更新完成之前，其他全部请求会被block（每个线程都要轮询的判断lock状态）
               
`基于引用回收` 

			   CacheBuilder.weakKeys()：使用弱引用存储键
               CacheBuilder.weakValues()：使用弱引用存储值
               CacheBuilder.softValues()：使用软引用存储值。

---

## 缓存刷新

refreshAfterWrite(long, TimeUnit) -> 机制是并非超时时间到就自动刷新，而是请求 get的时候才会触发refresh，默认refresh是同步请求新值，可以重写refresh方法改成异步。如果有大量并发请求的时候，只会有一个请求get->reload同步执行，其他线程返回旧值.

- 弊端
吞吐量低的应用，在超过过期时间时，大量并发get请求时，大部分拿到的是很久前的旧值，导致数据脏读。

- 如何解决？
可以同时使用expireAfterWrite设置key过期时间，比如每2s刷新一次新值，设置expireAfterWrite为5s为过期时间，则当key值5s没有访问的话，则第5s的时候强制取load新值，解决了脏读问题，也同时避免了缓存穿透问题。


## 扩展

Guava是如何实现，当缓存过期，只有一个请求去DB捞取数据的？

在《JAVA并发编程的艺术》里面有提到过这个方案，使用concurrentHashMap与futureTask,
futureTask的特点就是 当一个线程需要等待某一个线程的计算结果的场景。


---

## 附录
[Caffeine github](https://github.com/ben-manes/caffeine)
[示例代码](https://github.com/huangchunwu/own)