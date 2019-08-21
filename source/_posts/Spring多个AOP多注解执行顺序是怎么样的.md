---
title: Spring多个AOP多注解执行顺序是怎么样的
date: 2019-05-07 18:31:22
tags: Spring
categories: 技术
---


今天去了杉德面试，整体感觉还好。就spring AOP，对方问了下AOP事务失效的场景有哪些？幸亏之前做了一篇文章，刚好用到了这块的知识[spring声明式事务失效的分析过程](https://huangchunwu.github.io/2018/12/16/aop/)。另外还问了多个AOP的执行顺序是怎么样的，比如一个方法，有二个AOP注解，那么这2个注解的before，after方法的执行顺序是什么？我脑子是空白的，只是拼着三寸不烂之舌，“这个我平时没注意过，不过是我遇到的话，我会结合当时的业务需求，看执行顺序是否影响再做下一步处理"。回来网上查了下资料，原来答案这样简单，实现order接口，order越小的先执行，当然越小的order的AOP最后才能完成任务。


	@Component
	@Aspect
	@Slf4j
	public class MessageQueueAopAspect1 implements Ordered{@Override
		public int getOrder() {
			// TODO Auto-generated method stub
			return 2;
		}
		
	}


order越小越是最先执行，也是最后一个执行完成。可以借助下面这张图理解。
![我的头像](/images/aop.png)

由此得出：spring aop就是一个同心圆，要执行的方法为圆心，最外层的order最小。从最外层按照AOP1、AOP2的顺序依次执行doAround方法，doBefore方法。然后执行method方法，最后按照AOP2、AOP1的顺序依次执行doAfter、doAfterReturn方法。也就是说对多个AOP来说，先before的，一定后after。

    如果我们要在同一个方法事务提交后执行自己的AOP，那么把事务的AOP order设置为2，自己的AOP order设置为1，然后在doAfterReturn里边处理自己的业务逻辑。
        
 附录
 [spring多个AOP执行先后顺序](https://blog.csdn.net/qqxhwwqwq/article/details/51678595#)