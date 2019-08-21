---
title: 自定义属性编辑器实现分发器在Spring和SpringBoot的不同实现方式
date: 2019-07-05 12:34:37
tags: 
- SpringBoot
- Spring
- 设计模式
categories: 技术
---
最近在写一个项目，需要借助spring的自定义属性编辑器，实现一个分发器的功能，将踩过的坑记录下来，方便下次查阅。



> 为什么这里提到spring4+呢?
> customEditors在spring4.0以下的是Map类型，，key的类型必须是Class类型，而value是一个注入的bean；在spring4.0中，
> key和value的类型必须是Class类型，也就是说配置信息中的 customEditors 中的value值不能在是bean，而应该修改成class



---

## Spring4的自定义属性编辑器实现分发器

1. MatchBean


	public interface MatchingBean<T> {
		boolean matching(T factor);
	}


2. FactoryList


	public interface FactoryList<E extends MatchingBean<K>, K> extends List<E> {
		E getBean(K factor);
	}



3. FactoryArrayList


	public class FactoryArrayList<E extends MatchingBean<K>, K> extends ArrayList<E> 
	implements FactoryList<E, K>, InitializingBean {

		private static final long serialVersionUID = 5705342394882249201L;

		public FactoryArrayList() {
			super();
		}

		public FactoryArrayList(int size) {
			super(size);
		}

		public E getBean(K factor) {
			Iterator<E> itr = iterator();
			while(itr.hasNext()) {
				E beanMatch = itr.next();
				if(beanMatch.matching(factor)) {
					return beanMatch;
				}
			}
			return null;
		}

		public void afterPropertiesSet() throws Exception {
			if (!isEmpty()) {
				Object[] a = toArray();
				OrderComparator.sort(a);
				ListIterator i = listIterator();
				for (int j=0; j<a.length; j++) {
					i.next();
					i.set(a[j]);
				}
			}
		}

	}



4. CustomEditorRegistrar


	public class CustomEditorRegistrar implements PropertyEditorRegistrar {

		private Map<Class<?>, PropertyEditor> customEditors;

		public void registerCustomEditors(PropertyEditorRegistry registry) {
			if (customEditors != null) {
				Set<Map.Entry<Class<?>, PropertyEditor>> entries = customEditors.entrySet();
				for (Map.Entry<Class<?>, PropertyEditor> entry : entries) {
					registry.registerCustomEditor(entry.getKey(), entry.getValue());
				}
			}
		}

		public void setCustomEditors(Map<Class<?>, PropertyEditor> customEditors) {
			this.customEditors = customEditors;
		}
	}



5. 配置文件


	<bean class="org.springframework.beans.factory.config.CustomEditorConfigurer">
		<property name="customEditors">
			<map>
				<entry key="com.huangcw.utils.bean.FactoryList">
					<ref bean="factoryListEditor"/>
				</entry>
			</map>
		</property>
	</bean>

	<bean id="factoryListEditor" class="org.springframework.beans.propertyeditors.CustomCollectionEditor">
		<constructor-arg name="collectionType" value="com.huangcw.utils.bean.FactoryArrayList" type="java.lang.Class"></constructor-arg>
	</bean>



6. 调用



	@Autowired
	private FactoryList<IGiftReceiveService,Long> giftReceiveServiceIntegerFactoryList;


	ActivityGiftReceviedCondition condition = ActivityGiftReceviedCondition.newBuilder()
				.giftId(Long.parseLong(giftId))
				.num(num)
				.activityId(activityId)).build();
		return Result.getResult(giftService.receiveGift(condition));
		



## SpringBoot版

思路就是 将上面的xml翻译为spring的注解方式即可，其他的matchBean,facotyList都跟上面一样，直接上源码：

1. 自定义属性配置


	@Configuration
	public class BeanConfig {

		@Bean
		public CustomCollectionEditor customCollectionEditor() {
			CustomCollectionEditor cce =new CustomCollectionEditor(FactoryArrayList.class);
			return cce;
		}

		@Bean
		public CustomEditorRegistrar customEditorRegistrar() {
			CustomEditorRegistrar cec =new CustomEditorRegistrar();
			Map<Class<?>, PropertyEditor> map  = new HashMap();
			map.put(FactoryList.class,customCollectionEditor());
			cec.setCustomEditors(map);
			return cec;
		}

		@Bean
		public CustomEditorConfigurer customEditorConfigurer(){
			CustomEditorConfigurer cec = new CustomEditorConfigurer();
			CustomEditorRegistrar[] propertyEditorRegistrars = new CustomEditorRegistrar[]{
					customEditorRegistrar()
			};
			cec.setPropertyEditorRegistrars(propertyEditorRegistrars);
			return cec;
		}
	}




2. 继承MatchingBean的业务接口DispatchService


	public interface DispatchService extends MatchingBean<String> {

	}




3. 实现DispatchService接口的类，重写matching匹配方法


	@Service
	public class ADispatchServiceImpl implements DispatchService {


		@Override
		public boolean matching(String factor) {
			return "A".equals(factor);
		}
	}





4. 调用方式



	@RestController
	public class DispatchController {

		@Resource
		private FactoryList<DispatchService,String> factoryDispatchList;

		@RequestMapping("/{a}/cancel/{params}")
		public String dispatch(@PathVariable("a") String airline, @PathVariable("params") String params){

			String result = factoryDispatchList.getBean(a).cancel(params);

			return a+result;
		}

	}



这种设计方法，可以简单的实现转发器，我经常在项目里面使用，并且我的同事从前家公司离开之后，也很爱用这种方法,
因为这样写是你的代码很整洁，也符合开闭原则，可扩展性强。