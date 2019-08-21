---
title: elastic-job源码分析之位运算
date: 2019-07-20 18:20:11
tags: 
- elastic-job
- 源码分析
categories: 技术
---
最近在看elastic-job源码，每个技术点，都是自己的盲点，没办法进行下去了，先上第一个。

JobSettings类中：

    private Map<String, String> jobProperties = new LinkedHashMap<>(JobPropertiesEnum.values().length, 1);

看到这个声明map的方法，让我想起之前学的[HashMap的源码](https://huangchunwu.github.io/2019/05/09/HashMap%E7%9A%84%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90/)，我们知道HashMap扩容性能比较差，所以声明Map的时候指定initialCapacity默认容量大小，这不足为奇，但是这里指定loadFactor加载因子为1（默认0.75），估计也是为了减少扩容的触发条件吧。elasticjob声明的容量大小为2，那么我开始理解的意思是，当jobProperties最多put 2个值就会触发HashMap的扩容，如果容量为10，则最多put 10个值就会触发...结果却大跌眼镜，我写了一个测试用例：
public class MapTest {

    //创建hashmap设置默认大小，与加载因子，防止过度扩容
    private static Map<String, String> jobProperties = new LinkedHashMap<>(10, 1);

    public static void main(String[] args) {
        for (int i=0 ;i<11;i++){
            jobProperties.put("test_"+i,"val_"+i);
        }
    }

dubug发现没有扩容；然后我翻了下源码，发现map里的扩容条件不是我想的那样。

    //扩容触发的条件，Map的size>threshold
    if (++size > threshold)
            resize();
            

继而找到了threshold的计算方法tableSizeFor，说这个之前，还是先温习下计算机的位运算

    3 + 2 = 5 ，计算机转成二进制运算：
    
    00000011
    00000010
    ——————
    00000101  =  5
    
    ***************************************
    
    2*2 = 4，则
    
    00000010 *2
    ——————
    00000100  =  4
    
    2*4=8
    00000010 *4
    ——————
    00001000  =  8
    
    2*8=16
    00000010 *8
    ——————
    01000000  =  16


通过上面运算可以总结一下规律：

> a*b,当b满足2^N,则结果为a左移N位，2*2=2<<1,2*4=2<<2,28=2<<3
> 那么当b不满足2^N的时候，编译器会将b转为多个满足2^N的数相加，
> 即23*13=23*(16+4+2+1)=23<<4+23<<2+23

减法类似加法，只是加的是个负值，除法与乘法相似，只是改成了右移。


有了如上基础，在看HashMap的tableSizeFor（）方法

    /**
    * Returns a power of two size for the given target capacity.
    * 翻译一下：返回给定值的2次幂。
    */
    static final int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }


总结下tableSizeFor的功能（不考虑大于最大容量的情况）是返回大于输入参数且最近的2的整数次幂的数。比如10，则返回16。上面大牛写的位运算巧妙的实现了这样的运算，位运算属于计算机的运算语言，速度极快。那么上面的计算要怎么理解呢，还是举个例子，好理解：
假如我初始化的容量cap=10，则

    int n = cap-1=9,对应的二进制为：  
    0000 1001
    ===================
    n |=n>>>1，计算过程如下;               
    0000 1001   =n
    0000 0100   =n>>>1          
    ——————————
    0000 1101   =n
    ====================    
    n |= n >>> 2,计算过程如下; 
    0000 1101   =n
    0000 0011   =n>>>2
    ——————————
    0000 1111   =n
    ==================== 
    n |= n >>> 8,计算过程如下;
    0000 1111   =n
    0000 0000   =n>>>8
    ——————————
    0000 1111   =n
    =====================
    n |= n >>> 16,计算过程跟上面一样。
    最终n = 0000 1111 转成十进制就是15
    最后函数中return n + 1；则返回的是16.而10的最小2的整数幂就是16。	