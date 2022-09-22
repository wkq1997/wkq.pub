---
title: 基本概念
description: 索引、文档、节点、集群、分片、REST API
---

## 分布式系统的可用性与扩展性

* 高可用性
    * 服务可用性 - 允许有节点停止服务
    * 数据可用性 - 部分节点丢失，不会丢失数据
* 可扩展性
    * 请求量提升/ 数据的不断增长（将数据分布到所有节点上）

## ES分布式特性

* Elasticsearch 的分布式架构的好处
    * 存储的水平扩容
    * 提高系统的可用性，部分节点停止服务，整个集群的服务不受影响
* Elasticsearch 的分布式架构
    * 不同的集群通过不同的名字来区分，默认名字 “elasticsearch”
    * 通过配置文件的修改，或者在命令行中 -E  cluster.name = es 进行设定
    * 一个集群可以有一个或者多个节点

## 基本概念

### 索引

![image-20220908191707384](https://img.wkq.pub/hexo/image-20220908191707384.png)

* index :索引是文档的容器，是一类文档的集合
    * Index 体现了逻辑空间的概念：每个索引都有自己的 Mapping 定义，用于定义包含的文档的字段名和字段类型。
    * Shard 体现了物理空间的概念： 索引中的数据最后会分散在 Shard 上
* 索引的 Mapping 与 Settings
    * Mapping 定义文档字段的类型
    * Setting 定义不同的数据分布

#### 索引的不同语义

![image-20220908192317703](https://img.wkq.pub/hexo/image-20220908192317703.png)

* 名词：一个 Elasticsearch 集群中，可以创建很多不同的索引
* 动词：保存一个文档到 Elasticsearch 的过程也叫索引 （indexing）
    * ES 中，创建一个倒排索引的过程
* 名称：一个 B 数索引，一个倒排索引

#### 抽象与类比

| RDBMS  | Elasticsearch |
| ------ | ------------- |
| Table  | Index(Type)   |
| Row    | Document      |
| Colume | Filed         |
| Schema | Mapping       |
| SQL    | DSL           |

1. 在 7.0 之前，一个 Index 可以设置多个 Types
2. 7.0 后，一个 索引只能创建一个 Type  "_doc"
3. 传统关系型数据库和 Elasticsearch 的区别
    1. ELasticsearch - Schemaless / 相关性 / 高性能全文检索
    2. RDMS - 事务性 / Join

### 文档（Document）

* Elasticsearch 是面向文档的，文档是所有可搜索数据的最小单位。
    *  日志文件里的日志项
    *  一部电影的具体信息/一张唱片的详细信息
    *  MP3 播放器里的一首歌 / 一篇PDF 文档中的具体内容

* 文档会被序列化成 JSON 格式，保存在  Elasticsearch 中

    * JSON 对象由字段组成
    * 每个字段都由对应的字段类型，（字符串/数值/布尔/日期/二进制/范围类型）

* 每个文档都有一个 Unique ID

    * 可以自己指定 ID
    * 也可以通过 Elasticsearch 自动生成


#### JSON文档

* 一篇文档包含了一系列的字段。类似数据库中的一条记录
* JOSN 文档，格式灵活，不需要预先定义格式
    * 字段的类型可以指定或者通过 Elasticsearch 自动推算
    * 支持数组 / 支持嵌套

![image-20220908191110300](https://img.wkq.pub/hexo/image-20220908191110300.png)

#### 文档的元数据

用于标注文档的相关信息

![文档的元数据](https://img.wkq.pub/hexo/image-20220908191204615.png)

* _index : 文档所属的索引名
* _type : 文档所属的类型名
* _id : 文档唯一  ID
* _source：文档的原始 JSON 数据
* _version： 文档的版本信息，当有大量数据并发读写的时候，版本信息可以解决文档冲突的问题。
* _score ： 相关性打分



### REST API

很容易被各种语言调用。

![image-20220908192957721](https://img.wkq.pub/hexo/image-20220908192957721.png)

```http
GET /movies/_search
{
  "query": {
    "match_all": {}
  }
}

### 查看索引相关信息
GET kibana_sample_data_ecommerce

### 查看索引的文档总数
GET kibana_sample_data_ecommerce/_count


### 查看前 10 条文档，了解文档格式
POST kibana_sample_data_ecommerce/_search


### _cat indices API
### 查看 indices
GET /_cat/indices/kibana*?v&s=index

### 查看状态为绿色的索引
GET /_cat/indices?v&health=green

### 按照文档个数排序
GET /_cat/indices?v&s=docs.count:desc

### 查看具体的字段
GET /_cat/indices/kibana*?pri&v&h=health,index,pri,rep,docs,count,mt

### 
GET /_cat/indices?v&h=i,tm&s=tm:desc
```

## 节点

* 节点是一个 Elasticsearch 的实例
    * 本质上就是一个 Java 进程
    * 一台机器上可以运行多个 Elasticsearch 进程，但是生产环境一般建议一台机器只运行一个 Elasticsearch 实例
* 每一个节点都有名字，通过配置文件配置，或者启动时候 —E node.name=node1 指定
* 每一个节点在启动之后，会分配一个 UID，保存在  data 目录下

### Master-eligible nodes 和 Master Node

* 每个节点启动后，默认就是一个  Master eligible 节点
    * 可以设置 node.master: false 禁止
* Master-eligible 节点可以参加选中流程，成为 Master 节点
* 当第一个节点启动的时候，它会将自己选举为 Master 节点
* 每个节点 上都保存 了集群的状态，只有Master节点才能修改集群的状态信息
    * 集群状态（Cluster State），维护了一个集群中，必要的信息
        * 所有的节点信息
        * 所有的索引和其相关的 Mapping 与 Setting 信息
        * 分片的路由信息
    * 任意节点都能修改信息会导致数据的不一致性。

### Data Node 和 Coordinating Node

* Data Node
    * 可以保存数据的节点，叫做 Data Node。负责保存分片数据。在数据扩展上起到了至关重要的作用。
* Coordinating Node
    * 负责接受 Client 的请求，将请求分发到合适的节点，最终把数据汇集在一起
    * 每个节点默认都起到了 Coordinating Node 的职责

### 其它节点

* Hot & Warm Node
    * 不同硬件配置的 Data Node ，用来实现 Hot & Warm 架构，降低集群部署的成本
* Machine Learning Node
    * 负责跑集群学习的 Job ，用来做异常检测

### 配置节点类型

* 开发环境中一个节点可以承担多种角色
* 生产环境中，应该设置单一角色的节点（dedicated node）

| 节点类型          | 配置参数    | 默认值                                                       |
| ----------------- | ----------- | ------------------------------------------------------------ |
| master eligible   | node.master | ture                                                         |
| data              | node.data   | true                                                         |
| ingest            | node.ingest | true                                                         |
| coordination only | 无          | 每个节点默认都是 coordination 节点，设置其它类型全部为 false |
| machine learning  | node.ml     | true(需 enable x-pack)                                       |

## 分片

* 主分片（Primary Shard）,用于解决数据水平扩展的问题。通过主分片，可以将数据分布到集群内的所有节点之上。
    * 一个分片是一个运行的 Lucene 的实例
    * 主分片数在索引创建时指定，后续不允许修改。除非 Reindex

* 副本（Replica Shard），用以解决数据高可用的问题。分片是主分片的拷贝

    * 副本分片数，可以动态调整
    * 增加副本数，还可以在一定程度上提高服务的可用性（读取的吞吐）

* 一个三节点的集群中，blogs 索引的分片分布情况

  ![image-20220908203618359](https://img.wkq.pub/hexo/image-20220908203618359.png)

### 分片的设定

* 对于生产环境中分片的设定，需要提前做好容量规划
    * 分片数设置过小
        * 导致后续无法增加节点实现水平扩展
        * 单个分片的数据量太大，导致数据重新分配耗时
    * 分片数设置过大，7.0，默认主分片设置成1 ，解决了 over - sharding 的问题
        * 影响搜索结果的相关性打分，影响统计结果的准确性
        * 单个节点上过多的分片，会导致资源浪费，同时也会影响性能

### 集群的健康状态

```http
### 查看集群的健康状况
GET _cluster/health
{
  "cluster_name" : "es",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 2,
  "number_of_data_nodes" : 2,
  "active_primary_shards" : 8,
  "active_shards" : 16,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 100.0
}
```

* Green - 主分片与副本分片都正常分配
* Yellow - 主分片全部正常分配，有副本分片未能正常分配
* Red - 有主分片未能分配
    * 例如，当服务器的磁盘超过 85% 时，去创建一个新的索引

## 正排索引和倒排索引

![image-20220908215841809](https://img.wkq.pub/hexo/image-20220908215841809.png)

* 在搜索引擎中，正排索引指的是文档 id 到文档内容单词的关联
* 倒排索引，就是文档中单词到文档 Id 的关联

### 倒排索引的核心组成

* 倒排索引包含两部分
  * 单词词典（Term Dictionary），记录所有文档的单词，记录单词到倒排列表的关联关系
    * 单词词典一般比较大，可以通过 B + 树 或 哈希拉链法实现，以满足高性能的插入与查询
  * 倒排列表（Posting List）- 记录了单词对应的文档组合，由倒排索引项组成
    * 倒排索引项（Posting）
      * 文档 Id
      * 词频 TF - 该单词在文档中出现的次数，用于相关度评分
      * 位置（Positing） - 单词在文档中分词的位置。用于语句搜索（phrase query）
      * 偏移（Offset） - 记录单词的开始结束位置，实现高亮显示

#### 例子

![image-20220908220831484](https://img.wkq.pub/hexo/image-20220908220831484.png)

### Elasticsearch 的倒排索引

* Elasticsearch 的 JSON 文档中的每个字段，都有自己的倒排索引
* 可以指定对某些字段不做倒排索引
  * 优点：节省存储空间
  * 缺点：字段无法被搜索
