---
聚合: Aggregation
---
## 什么是聚合（Aggregation）
* Elasticsearch 除搜索以外，提供的针对 ES 数据进行统计分析的功能。
  * 实时性高
  * Hadoop（T+1）
* 通过聚合，我们会得到一个数据的概览，是分析和总结全套的数据，而不是寻找单个文档
* 高性能，只需要一条语句，就可以从 Elasticsearch 得到分析结果
  * 无需在客户端自己去实现分析逻辑
## 聚合的分类
* Bucket Aggregation ： 一些列满足特定条件的文档的集合
* Metric Aggregation ： 一些数学运算，可以对文档字段进行统计分析
* Pipeline Aggregation ： 对其它的聚合结果进行二次聚合
* Metric Aggregation : 支持对多个字段的操作并提供一个结果矩阵

![image-20220912143054231](https://img.wkq.pub/hexo/image-20220912143054231.png)

### Bucket 

* 一些例子
  * 杭州术语浙江 / 一个演员属于 男 或 女
  * 嵌套关系，杭州属于浙江属于中国属于亚洲
* Elasticsearch 提供了很多类型 的 Bucket ，帮助你用多种方式划分文档
  * Term & Range（时间 / 年龄区间 / 地理位置）

### Metric

* Metric 会基于 数据集计算结果，除了支持在字段上进行计算，同样也支持在脚本（painless script） 产生的结果之上进行计算
* 大多数 Metric 是数学运算，仅输出一个值
  * min / max / sum / avg / cardinality
* 部分 Metric 支持输出多个数值
  * stats / percentiles / percentile_ranks

#### 一个 bucket 的例子

![查看航班目的地的统计信息](https://img.wkq.pub/hexo/%E6%9F%A5%E7%9C%8B%E8%88%AA%E7%8F%AD%E7%9B%AE%E7%9A%84%E5%9C%B0%E7%9A%84%E7%BB%9F%E8%AE%A1%E4%BF%A1%E6%81%AF.png)

#### 加入 Metric Aggregation

![查看航班目的地的统计信息-加入metric](https://img.wkq.pub/hexo/%E6%9F%A5%E7%9C%8B%E8%88%AA%E7%8F%AD%E7%9B%AE%E7%9A%84%E5%9C%B0%E7%9A%84%E7%BB%9F%E8%AE%A1%E4%BF%A1%E6%81%AF-%E5%8A%A0%E5%85%A5metric.png)

#### 嵌套

![image-20220912145151356](https://img.wkq.pub/hexo/image-20220912145151356.png)

## Bucket & Metric 聚合分析及嵌套聚合

![image-20220913190945718](https://img.wkq.pub/hexo/image-20220913190945718.png)

* Metric : 一些系列的统计方法
* Bucket ： 一组满足条件的文档

### Aggregation 的语法

Aggregation 属于 Search 的一部分。一般情况下，建议将其 size 指定为 0.

![image-20220913191257147](https://img.wkq.pub/hexo/image-20220913191257147.png)

### Metric Aggragation 

* 单值分析：只输出一个分析结果
  * min，max，avg，sum，Cardinality（类似 distinct Count）


## Pipeline 

> 对聚合分析再做一次聚合分析

* 管道的概念：支持对聚合分析的结果，再次进行聚合分析
* Pipeline 的分析结果会输出到原结果中，根据 位置不同，分为两类
  * Sibling —  结果和现有分析结果同级
    * Max，Min，Avg & Sum Bucket
    * Stats ， Extended Status Bucket
    * Percentiles Bucket
  * Parent— 结果内嵌到现有的聚合分析结果之中
    * Derivative （求导）
    * Cumultive Sum （累计求和）
    * Moving Funcation（滑动窗口）
