---
title: 钉钉H5微应用开发总结
date: 2019-03-17 23:37:40
tags: 钉钉
categories: 技术
---
今年，我又做了一个钉钉微应用的项目，第一次接触钉钉，把踩过的坑，记录下来，为后人乘凉所用。

---

## 准备工作


- 开放平台注册申请权限
- 选择钉钉应用类型，创建应用，获取AppKey，AppSecret，CORP_ID，
- 准备开发环境 静态页面、JS，CSS放在ngnix，本地接口用tomcat。
- 内网穿透，用于开发时候调试钉钉应用



> 减少代码耦合度，我采用前后端分离，没有采用freemaker等模板引擎工具，我将页面与接口放在不同服务器上，那么就有跨域问题，解决方案是ngnix，配置反向代理同个host不同端口，则可以解决JS跨域问题。


>  钉钉下，有E应用（不成熟），微应用（较成熟）。我用的是相对成熟的微应用。另外应用还分，第三方企业内部应用，企业内部应用，第三方个人应用，移动应用接入。由于我的业务方需求，我选择的企业内部应用，注意看对应的文档，钉钉功能太混杂容易混淆。

## 开发过程

### 引入JS
common.js
``` javascript
<script type="text/javascript" src="//g.alicdn.com/dingding/dingtalk-jsapi/2.0.57/dingtalk.open.js"></script>
```

### JSAPI免登授权码
获取当前钉钉登录用户的账号信息，需要通过免登授权码换取

``` javascript
  //获取免登授权码
    dd.ready(function() {
        dd.runtime.permission.requestAuthCode({
            corpId: _config.corpId,
            onSuccess: function(info) {

                var _params = {"code":info.code};
                tools.getReqData('/api/dd/getCurrentLoginUser', _params, getUserCall);//通过免登授权码获取用户详细信息
            },
            onFail : function(err) {
                alert('fail: ' + JSON.stringify(err));
            }

        });

        dd.error(function(error){
            alert('dd error: ' + JSON.stringify(err));
        });
    });
```

### JSAPI鉴权
需要用到钉钉的日历控件，组织机构多选弹出框等控件，所以需要鉴权
``` javascript
 //鉴权验证
    dd.config({
        agentId : _config.agentid,
        corpId : _config.corpId,
        timeStamp : _config.timeStamp,
        nonceStr : _config.nonceStr,
        signature : _config.signature,
        jsApiList : [ 'runtime.info', 'biz.contact.choose',
            'device.notification.confirm', 'device.notification.alert',
            'device.notification.prompt', 'biz.ding.post','biz.contact.complexPicker',
            'biz.util.openLink','biz.util.datepicker' ]
    });
```

### 获取TOKEN

``` javascript
     /*
     * 在此方法中，为了避免频繁获取access_token，
     * 在距离上一次获取access_token时间在两个小时之内的情况，
     * 将直接从持久化存储中读取access_token
     *
     * 因为access_token和jsapi_ticket的过期时间都是7200秒
     * 所以在获取access_token的同时也去获取了jsapi_ticket
     * 注：jsapi_ticket是在前端页面JSAPI做权限验证配置的时候需要使用的
     * 具体信息请查看开发者文档--权限验证配置
     */
    public static String getAccessToken() throws OApiException {
        long curTime = System.currentTimeMillis();
        JSONObject accessTokenValue = (JSONObject) FileUtils.getValue("accesstoken", Env.APP_KEY);
        String accToken = "";
        JSONObject jsontemp = new JSONObject();
        if (accessTokenValue == null || curTime - accessTokenValue.getLong("begin_time") >= cacheTime) {
            try {
                ServiceFactory serviceFactory = ServiceFactory.getInstance();
                CorpConnectionService corpConnectionService = serviceFactory.getOpenService(CorpConnectionService.class);
                accToken = corpConnectionService.getCorpToken(Env.APP_KEY, Env.APP_SECRET);
                // save accessToken
                JSONObject jsonAccess = new JSONObject();
                jsontemp.clear();
                jsontemp.put("access_token", accToken);
                jsontemp.put("begin_time", curTime);
                jsonAccess.put(Env.APP_KEY, jsontemp);
                //真实项目中最好保存到数据库中
                FileUtils.write2File(jsonAccess, "accesstoken");

            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            return accessTokenValue.getString("access_token");
        }

        return accToken;
    }

```



### 获取当前用户信息

``` javascript
    /**
     * 根据免登授权码查询免登用户userId
     * @param accessToken
     * @param code
     * @return
     * @throws Exception
     */
    public static CorpUserBaseInfo getUserInfo(String accessToken, String code) throws Exception {
        CorpUserService corpUserService = ServiceFactory.getInstance().getOpenService(CorpUserService.class);
        return corpUserService.getUserinfo(accessToken, code);
    }

```

### 钉钉日历控件

``` javascript
   $("#proBidOpent").click(function(){
    var t = this;
    var curDate = (new Date().getFullYear()) + '-' + (new Date().getMonth()) + '-' + (new Date().getDay);
    dd.biz.util.datepicker({
        format: 'yyyy-MM-dd',//注意：format只支持android系统规范，即2015-03-31格式为yyyy-MM-dd
        value: curDate, //默认显示日期
        onSuccess : function(result) {
            $(t).val(result.value);
            //onSuccess将在点击完成之后回调
            /*{
             value: "2015-02-10"
             }
             */
        },
        onFail : function(err) {
            alert(JSON.stringify(err));
        }
    })
});

```

### 钉钉滑动选择人员控件

``` javascript
  $('#recorderName').click(function(){
    var tx = this;

    dd.biz.contact.complexPicker({
        title:"备案人员",            //标题
        corpId:_config.corpId,              //企业的corpId
        multiple:true,            //是否多选
        limitTips:"超出了",          //超过限定人数返回提示
        maxUsers:100,            //最大可选人数
        pickedUsers:[],            //已选用户
        pickedDepartments:[],          //已选部门
        disabledUsers:[],            //不可选用户
        disabledDepartments:[],        //不可选部门
        requiredUsers:[],            //必选用户（不可取消选中状态）
        requiredDepartments:[],        //必选部门（不可取消选中状态）
        appId:_config.agentid,              //微应用的Id
        permissionType:"xxx",          //可添加权限校验，选人权限，目前只有GLOBAL这个参数
        responseUserOnly:true,        //返回人，或者返回人和部门
        startWithDepartmentId:0 ,   //仅支持0和-1
        onSuccess: function(result) {
            if(result.selectedCount>0){
                var empIds = "";
                var empNames = "";
                for(var i=0;i< result.selectedCount;i++){
                    empIds = empIds + result.users[i].emplId+",";
                    empNames = empNames + result.users[i].name+",";
                }
                empIds = empIds.substring(0,empIds.length-1);
                empNames = empNames.substring(0,empNames.length-1);
                $(tx).val(empNames);
                var attr_hidden = $(tx).attr("attr_hidden");
                $("#"+attr_hidden).val(empIds);
            }
           
        },
        onFail : function(err) {
            alert(JSON.stringify(err));
        }
    });
});

```

## 附录

[开源代码](https://github.com/huangchunwu/myDingding)