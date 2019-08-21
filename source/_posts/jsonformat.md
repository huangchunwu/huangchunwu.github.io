---
title: 关于@JsonFormat(pattern = "yyyy-MM-dd HH:mm") 时区差8小时的踩坑记录
date: 2019-07-30 15:59:11
tags: 
- 避坑指南
categories: 技术
---

今天遇到有个项目使用jackson的注解@JsonFormat，用于格式化时间输出，eg:

```java

	@DateTimeFormat(pattern="yyyy-MM-dd HH:mm")
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	public Date getProBidOpent() {
		return proBidOpent;
	}
```

然而上线后，才发现时间比用户录入的少了8个小时，查询源码发现，JsonFormat默认的时区是国际化本地，而不是东8时区（也就是北京时间），我们看下源码:



~~~java
@Target({ElementType.ANNOTATION_TYPE, ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER,
    ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotation
public @interface JsonFormat{
    ````
    public final static String DEFAULT_TIMEZONE = "##default";
    
            /**
         * @since 2.9
         */
        public Value(String p, Shape sh, String localeStr, String tzStr, Features f,
                Boolean lenient)
        {
            this(p, sh,(localeStr == null || localeStr.length() == 0 || DEFAULT_LOCALE.equals(localeStr)) ?null : new Locale(localeStr),  (tzStr == null || tzStr.length() == 0 || DEFAULT_TIMEZONE.equals(tzStr)) ?
                            null : tzStr,
                    null, f, lenient);
        }

}
~~~

默认时区是new Locale(localeStr)。默认转换时区为"GMT"，即格林尼治时间，北京时间是GMT+8

所以以后使用这个注解要注意避雷，eg：

```java
@DateTimeFormat(pattern="yyyy-MM-dd HH:mm")
@JsonFormat(pattern = "yyyy-MM-dd HH:mm",timezone="GMT+8")
public Date getProBidOpent() {   
    return proBidOpent;
}
```