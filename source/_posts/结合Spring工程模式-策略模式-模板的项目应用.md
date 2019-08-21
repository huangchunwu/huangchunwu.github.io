---
title: 结合Spring工程模式+策略模式+模板的项目应用
date: 2019-07-05 11:04:18
tags: 设计模式
categories: 技术
---

市场提出需求，产品分析出业务模型，我们再根据业务模型，抽象出领域模型，设计类图与时序图，将共同的功能，利用设计模式设计低耦合，高内聚，易扩展的代码，在工作中，我经常用到的就是工程模式，模板模式，策略模式，比如我最近遇到的这样的场景，市场部时不时就变着法子做营销活动，每次的活动形式有略微的差别，总结出来，只有四部分功能：活动的查询，参加活动，领取奖品，奖品的计算。那么领域对象可以归纳为以下几种：

- 活动主体
- 活动分发器
- 活动规则
- 活动奖品
- 活动规则引擎

其中活动分发器为了应对以后需求的扩展，比如有抽奖活动，有进阶拿奖品的活动..,所以抽离出来用策略模式分发到不同的活动中是有必要的.

分发器

	@Service
	public class DispatcherService implements IDispatcherService {

		@Autowired
		private FactoryList<IActivityHandlerService,Integer> factoryList;

		public <T extends ActivityResponse> ExecResult<T> joinAct(ContextParam contextParam) {
			long t1 = System.currentTimeMillis();
			T response;
			String beanName = contextParam.getRequest().getClass().getName();
			LogUtil.log(ActivityLoggerFactory.BUSINESS, ActivityLoggerMarker.BUSINESS, Level.INFO, "执行" + beanName + "开始" +
					" " + "context:" + JSON.toJSONString(contextParam));
			try {
				response = factoryList.getBean(contextParam.getActivityType()).joinAct(contextParam);
			} catch (BusinessRuntimeException e) {
				LogUtil.log(ActivityLoggerFactory.EXCEPTION_HANDLER, ActivityLoggerMarker.BUSINESS, Level.ERROR,
						LogUtil.formatLog(KVJsonFormat.title("业务处理BusinessRuntimeException异常")
								.add("beanName", beanName)
								.add("context", contextParam)
								.add("errMsg", e.getMsg())));
				return ExecResult.newInstance(e.getCode(), e.getMessage());
			} catch (Exception e) {
				LogUtil.log(ActivityLoggerFactory.EXCEPTION_HANDLER, ActivityLoggerMarker.BUSINESS, Level.ERROR,
						LogUtil.formatLog(KVJsonFormat.title("系统Exception异常")
								.add("beanName", beanName)
								.add("context", contextParam)), e);
				return ExecResult.newInstance(ResultCodeEnum.SYSTEM_ERROR.getCode(), "系统Exception异常");
			} catch (Throwable e) {
				LogUtil.log(ActivityLoggerFactory.EXCEPTION_HANDLER, ActivityLoggerMarker.BUSINESS, Level.ERROR,
						LogUtil.formatLog(KVJsonFormat.title("系统Throwable异常")
								.add("beanName", beanName)
								.add("context", contextParam)), e);
				return ExecResult.newInstance(ResultCodeEnum.SYSTEM_ERROR.getCode(), "系统Throwable异常");

			}
			LogUtil.log(ActivityLoggerFactory.BUSINESS, ActivityLoggerMarker.BUSINESS, Level.INFO, "执行" + beanName + "结束 time:" + (System.currentTimeMillis()
					- t1) + " context:" + JSON.toJSONString(contextParam) + "response:" + JSON.toJSONString(response));
			return ExecResult.getSuccesussResult(response);
		}

	}


上述代码中：

	@Autowired
	private FactoryList<IActivityHandlerService,Integer> factoryList;

这个是FactoryList利用spring的自定义属性编辑器实现的，防止篇幅太长，我还是放在下一篇吧。[自定义属性编辑器实现分发器在Spring和SpringBoot的不同实现方式](https://huangchunwu.github.io/2019/07/05/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B1%9E%E6%80%A7%E7%BC%96%E8%BE%91%E5%99%A8%E5%AE%9E%E7%8E%B0%E5%88%86%E5%8F%91%E5%99%A8%E5%9C%A8Spring%E5%92%8CSpringBoot%E7%9A%84%E4%B8%8D%E5%90%8C%E5%AE%9E%E7%8E%B0%E6%96%B9%E5%BC%8F/)


所有的活动都有一些共性：像参加活动的规则校验，活动参加成功后执行的action。不同的活动，规则不一样，执行成功后要触发的动作也不一样，比较适合用模板模式。
模板模式ActivityHandlerService

    @Override
    public <T extends ActivityResponse> T joinAct(ContextParam contextParam) {

        // 获取活动的特定解析器，获取规则列表
        BaseActivityPartDTO activityDTO = (BaseActivityPartDTO) activityDTOParserFactory.getBean(contextParam.getActivityType())
                .buildDTO(contextParam.getRequest());
        contextParam.setActivityDTO(activityDTO);

        //校验活动规则
        doRuleCheck(contextParam,activityDTO.getRules());

        //校验通过，执行之后的活动逻辑
        doAction(contextParam);

        //组装反馈结果
        return (T) buildResponse(contextParam);
    }
    
    
    /**
     * 构造响应对象
     * @param contextParam
     * @return
     */
    private <T extends ActivityResponse> T buildResponse(ContextParam contextParam) {
        ActivityResponse activityResponse = activityDTOParserFactory.getBean(contextParam.getActivityType()).buildResponse(contextParam);
        if (activityResponse == null) {
            throw new BusinessRuntimeException(1, "");
        }
        return (T) activityResponse;
    }

    /**
     * 活动规则检验
     *
     * @param rules
     */
    private void doRuleCheck(ContextParam contextParam, List<Rule> rules) {
        //没有规则直接返回
        if (CollectionUtils.isEmpty(rules)) {
            return;
        }
        //检查参数
        ExecResult<List<String>> paramCheck = activityRuleEngine.check(rules);
        if (!ResultUtil.isResultSuccess(paramCheck)) {
            throw new BusinessRuntimeException(paramCheck.getCode(), paramCheck.getMessage());
        }
        if (!CollectionUtils.isEmpty(paramCheck.getResult())) {
            throw new BusinessRuntimeException(ResultCodeEnum.RULE_PARAM_ERROR.getCode(), JSON.toJSONString(paramCheck.getResult()));
        }
        rules.sort(Comparator.comparing(Rule::getSort));
        ActivityPartRuleRequest activityPartRuleRequest = new ActivityPartRuleRequest();
        activityPartRuleRequest.setContextParam(contextParam);
        ExecResult<String> result = activityRuleEngine.validate(activityPartRuleRequest, rules);
        if (!ResultUtil.isResultSuccess(result)) {
            throw new BusinessRuntimeException(result.getCode(), result.getMessage());
        }
        if (StringUtils.isNotBlank(result.getResult())) {
            throw new BusinessRuntimeException(ResultCodeEnum.RULE_CHECK_FAIL.getCode(), result.getResult());
        }
        return;
    }

    /**
     * 执行操作
     * 各子类自行实现，完成各种动作
     *
     * @param contextParam
     */
    protected abstract void doAction(ContextParam contextParam);



