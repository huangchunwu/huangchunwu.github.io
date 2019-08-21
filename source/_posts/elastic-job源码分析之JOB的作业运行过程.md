---
title: elastic-job源码分析之JOB的作业运行过程
date: 2019-07-21 08:33:55
tags: 
- elastic-job
- 源码分析
categories: 技术
---
上一篇分析了elastic-job与quartz怎么结合，启动作业。那么作业是怎么执行的呢？我猜想是quartz启动作业后，会起个线程，根据cron表达式的规则去执行作业，翻了一下源码验证一下，quartz使用JobRunShell运行作业：

    public void run() {
        ```省略```
        OperableTrigger trigger = (OperableTrigger) jec.getTrigger();
        JobDetail jobDetail = jec.getJobDetail();
        ```省略```
        job.execute(jec);// execute the job
        ````省略```
    }

上面的代码，执行实现Job接口的类的execute方法：

    public interface Job {
        void execute(JobExecutionContext context) throws JobExecutionException;
    }

那么elastic-job实现Job接口实现liteJob,也就是说quartz执行的liteJob这个类：

    /**
     * Lite调度作业.
     *
     * @author zhangliang
     */
    public final class LiteJob implements Job {
        
        @Setter
        private ElasticJob elasticJob;
        
        @Setter
        private JobFacade jobFacade;
        
        @Override
        public void execute(final JobExecutionContext context) throws JobExecutionException {
            JobExecutorFactory.getJobExecutor(elasticJob, jobFacade).execute();
        }
    }

到此为止，就把quartz的JOB执行过程与elastic-job的作业联系到一起了。
那么，litejob的elasticJob，jobFacade二个属性值是什么时候塞进去的呢?
还是找源码，这里比较隐秘，回到quartz中JobRunShell的initialize（）方法：

    public void initialize(QuartzScheduler sched)throws SchedulerException {
        this.qs = sched;

        Job job = null;
        JobDetail jobDetail = firedTriggerBundle.getJobDetail();

        try {
            job = sched.getJobFactory().newJob(firedTriggerBundle, scheduler);//初始化JOB
        } catch (SchedulerException se) {
            ···
        }
        this.jec = new JobExecutionContextImpl(scheduler, firedTriggerBundle, job);//初始化JOB的一些上下文参数
    }

job = sched.getJobFactory().newJob(firedTriggerBundle, scheduler)这个方法获取jobFactory,这里使用的是PropertySettingJobFactory extend SimpleJobFacotry，再通过反射实例化了实现JOB接口的liteJob，看下是怎么实现的：

    public class PropertySettingJobFactory extends SimpleJobFactory {
      ...
        @Override
    public Job newJob(TriggerFiredBundle bundle, Scheduler scheduler) throws SchedulerException {

        Job job = super.newJob(bundle, scheduler);//反射实例化Job
        
        JobDataMap jobDataMap = new JobDataMap();
        jobDataMap.putAll(scheduler.getContext());
        jobDataMap.putAll(bundle.getJobDetail().getJobDataMap());
        jobDataMap.putAll(bundle.getTrigger().getJobDataMap());
        /**
         * 上面的LiteJob.class,其中有两个成员变量,
         * elasticJob和jobFacade就是这里来初始化的。
         * 通过反射
         */
        setBeanProps(job, jobDataMap);
        
        return job;
    }
    
    public class SimpleJobFactory implements JobFactory {
    ...
    /**
     * 根据JobDetail中的JobClass类来生成一个实例。
     */
    public Job newJob(TriggerFiredBundle bundle, Scheduler Scheduler) throws SchedulerException {
        JobDetail jobDetail = bundle.getJobDetail();
        Class<? extends Job> jobClass = jobDetail.getJobClass();
        try {
            if(log.isDebugEnabled()) {
                log.debug(
                    "Producing instance of Job '" + jobDetail.getKey() + 
                    "', class=" + jobClass.getName());
            }
            
            return jobClass.newInstance();
        } catch (Exception e) {
            SchedulerException se = new SchedulerException(
                    "Problem instantiating class '"
                            + jobDetail.getJobClass().getName() + "'", e);
            throw se;
        }
      }
    }
    
liteJob.class是从jobDetail里面get的，上一节中，提到了作业启动过程中，JobScheduler中init（）调用了createJobDetail（）这个方法：
    
     private JobDetail createJobDetail(final String jobClass) {
        JobDetail result = JobBuilder.newJob(LiteJob.class).withIdentity(liteJobConfig.getJobName()).build();//告诉quartz的JOB类型是liteJob
        result.getJobDataMap().put(JOB_FACADE_DATA_MAP_KEY, jobFacade);//liteJob的属性值jobFacade初始化，put到jobDetail的jobdataMap
        Optional<ElasticJob> elasticJobInstance = createElasticJobInstance();
        if (elasticJobInstance.isPresent()) {
            result.getJobDataMap().put(ELASTIC_JOB_DATA_MAP_KEY, elasticJobInstance.get());//liteJob的属性值elasticJob初始化，put到jobDetail的jobdataMap
        } else if (!jobClass.equals(ScriptJob.class.getCanonicalName())) {
            try {
                result.getJobDataMap().put(ELASTIC_JOB_DATA_MAP_KEY, Class.forName(jobClass).newInstance());
            } catch (final ReflectiveOperationException ex) {
                throw new JobConfigurationException("Elastic-Job: Job class '%s' can not initialize.", jobClass);
            }
        }
        return result;
    }
    
  至此，liteJob 什么时候初始化，以及他的属性jobFacade，elasticJob是什么地方set进去的，就清楚了。