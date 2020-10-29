---
title: jdk13新特性
date: 2019-12-11 16:48:52
tags: Java新特性
categories: 技术
---

2019年09月17日，JCP如期半年一更的约定，jdk迎来了新的版本jdk13.这里记录下新特性中比较亮眼的2个特性，方便后续查阅。详细的新特性参考[jdk13](https://openjdk.java.net/projects/jdk/13/)。 

- text block 省去了很多转义

  

  ```java
   @Test 
   public void textBlock(){
       String sql = """
                select * from system_user
                where user_id = '543255'
                and age >12
                and birth>'1991'
        """;
  
        String html = """
  ..............<html>
  ..............    <body>
  ..............        <p>Hello, world</p>
  ..............    </body>
  ..............</html>
  ..............""";
           
        System.out.println(html);
        System.out.println(sql);
    }
  ```

- 增强switch,支持yield设置返回

  ```Java
    /**
     * jdk12
     * @throws IOException
     */
    @Test
    public void switchFeature() throws IOException {
        switch ("A") {
            case "A" -> System.out.println("you is A");
            case "B" -> System.out.println("you is B");
        }
    }
  
    /**
     * jdk13
     * @throws IOException
     */
    @Test
    public void switchFeature2() throws IOException {
        String a = "A";
       var result =  switch (a) {
           case "A" :yield "1";
           case "B": yield "2";
           default:
               throw new IllegalStateException("Unexpected value: " + a);
       };
       System.out.println(result);
    }
  ```