---
title: elastic-job源码分析之JOB的作业启动过程
date: 2019-07-20 23:12:31
tags: 
- elastic-job
- 源码分析
categories: 技术
---

elastic-job是由zk做分布式存储,结合quartz做的调度任务，下面我来找找是怎么跟quartz结合起来的？

运行elastic-job提供的例子`elastic-job-example`，可以找到JOB的启动入口
    
    public static void main(final String[] args) throws IOException {
        //第一步： 启动ZK
        CoordinatorRegistryCenter regCenter = setUpRegistryCenter();
        //第二步： 作业数据库事件配置，用于记录JOB执行状态
        JobEventConfiguration jobEventConfig = new JobEventRdbConfiguration(setUpEventTraceDataSource());

        //第三步：  开启三种类型JOB
        setUpSimpleJob(regCenter, jobEventConfig);
        setUpDataflowJob(regCenter, jobEventConfig);
        setUpScriptJob(regCenter, jobEventConfig);
    }

接着上面，看setUpSimpleJob方法

    private static void setUpSimpleJob(final CoordinatorRegistryCenter regCenter, final JobEventConfiguration jobEventConfig) {
        // JOB的核心配置初始化
        JobCoreConfiguration coreConfig = JobCoreConfiguration.newBuilder("javaSimpleJob", "0/5 * * * * ?", 3).shardingItemParameters("0=Beijing,1=Shanghai,2=Guangzhou").build();
        // 执行JOB类型为SimpleJob
        SimpleJobConfiguration simpleJobConfig = new SimpleJobConfiguration(coreConfig, JavaSimpleJob.class.getCanonicalName());
        // JOB调度器 启动JOB
        new JobScheduler(regCenter, LiteJobConfiguration.newBuilder(simpleJobConfig).build(), jobEventConfig).init();
    }

JobScheduler 是JOB调度器，执行init()启动JOB,如下

     /**
         * 初始化作业.
         */
        public void init() {
            LiteJobConfiguration liteJobConfigFromRegCenter = schedulerFacade.updateJobConfiguration(liteJobConfig);
            JobRegistry.getInstance().setCurrentShardingTotalCount(liteJobConfigFromRegCenter.getJobName(),liteJobConfigFromRegCenter.getTypeConfig().getCoreConfig().getShardingTotalCount());
            JobScheduleController jobScheduleController = new JobScheduleController(createScheduler(),createJobDetail(liteJobConfigFromRegCenter.getTypeConfig().getJobClass()),liteJobConfigFromRegCenter.getJobName());
            JobRegistry.getInstance().registerJob(liteJobConfigFromRegCenter.getJobName(), jobScheduleController, regCenter);
           // 选主
            schedulerFacade.registerStartUpInfo(!liteJobConfigFromRegCenter.isDisabled());
            // 启动quartz JOB执行作业
            jobScheduleController.scheduleJob(liteJobConfigFromRegCenter.getTypeConfig().getCoreConfig().getCron());
        }

上面代码里jobScheduleController的作用就是elastic-job操作quartz API的封装类。

     /**
         * 调度作业.
         * 
         * @param cron CRON表达式
         */
        public void scheduleJob(final String cron) {
            try {
                if (!scheduler.checkExists(jobDetail.getKey())) {
                    scheduler.scheduleJob(jobDetail, createTrigger(cron));
                }
                scheduler.start();//quartz的方法
            } catch (final SchedulerException ex) {
                throw new JobSystemException(ex);
            }
        }
        
由此，elastic-job与quartz完美的结合起来的，其中createJobDetail(liteJobConfigFromRegCenter.getTypeConfig().getJobClass())，后面会谈到quartz怎么用到的，JobDetail是quartz的类。  