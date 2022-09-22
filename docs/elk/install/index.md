---
title: 安装上手
---
## Elasticsearch的安装与简单配置
### 安装 Java
* 运行 Elasticsearch ，需安装并配置 JDK ， 设置好 JAVA_HOME 
* 各个版本对 Java 的依赖
  * Elasticsearch 5 需要 Java 8 以上的版本
  * Elasticsearch 从 6.5 开始支持 Java 11
  * https://www.elastic.co/support/matrix#matrix_jvm
  * 7.0 开始，内置了 Java 环境
### 下载运行
* 下载，https://www.elastic.co/cn/downloads/elasticsearch
  * 支持 Docker 运行
* 运行 `bin/elasticsearch.bat`在Windows上
* 访问 `http://localhost:9200` ,看到 json 描述信息，则表示 es 已启动
### Elasticsearch 的文件目录结构

| 目录    | 配置文件          | 描述                                           |
| ------- | ----------------- | ---------------------------------------------- |
| bin     |                   | 脚本文件，包括启动es，安装插件。运行统计数据等 |
| config  | elasticsearch.yml | 集群配置文件，user，role based 相关配置        |
| JDK     |                   | Java 运行环境                                  |
| data    | path.data         | 数据文件                                       |
| lib     |                   | Java类库                                       |
| logs    | path.log          | 日志文件                                       |
| modules |                   | 包含所有 ES 模块                               |
| plugins |                   | 包含所有以安装插件（ES 可以通过插件扩展）      |

### JVM 配置

* 修改 JVM - config/jvm.options
  * 7.1 下载的默认设置是 1 GB
* 配置的建议
  * Xmx 和 Xms 设置成一样的
  * Xmx 不要超过机器内存的 50 %
  * 不要超过 30 GB

### 查看与安装插件

```shell
# 查看已安装的插件
elasticsearch-plugin list
# 安装国际化的分词插件
elasticsearch-plugin install analysis-icu
```

通过浏览器也可以查看已安装的插件。

![查看已安装的插件](https://img.wkq.pub/hexo/image-20220907204004062.png)

### 如何运行多个Elasticsearch 实例

* `elasticsearch -E  node.name=node1 -E cluster.name=es -E path.data=node1_data -d`
* `elasticsearch -E  node.name=node2 -E cluster.name=es -E path.data=node2_data -d`
* `elasticsearch -E  node.name=node3 -E cluster.name=es -E path.data=node3_data -d`

:::tip

es 也提供了一个 `_cat/nodes`的 API ，可以查看集群中有哪些节点。

![image-20220907204856797](https://img.wkq.pub/hexo/image-20220907204856797.png)

:::



## Kibana 安装及预览

1. 下载 kibana ，要求和 ES 版本一致

2. 在编辑器中打开 `config/kibana.yml`，设置 elasticsearch.url 指向 ES  实例

3. 运行 `bin/kibana`

4. 浏览器访问 http://localhost:5601

5. kibana 准备了 3 种类型的样例数据

   ![image-20220907213031462](https://img.wkq.pub/hexo/image-20220907213031462.png)

### Kibana Console

* Dev Tool

* Search Profiler

* Help + 一些快捷键

  * cmd + / (查看API 帮助文档)
  * cmd + option + l
  * cmd + option +0
  * cmd + option + shift + 0

  

### Kibana Plugins

* kibana-plugin list
* kibana remove
* kibana-plugin install plugin_location

## Docker 容器运行 ES 、Kibana、Cerebro

* 下载安装 Docker 与 Docker Compose

  * www.docker.com
  * https://docs.docker.com/compose/
  * https://docs.docker.com/machine/install-machine/

* Docker-compose 相关命令

  * 运行 docker-compose up
  * docker-compose down
  * docker-compose down -v
  * docker stop / rm  containerID

* 运行 Docker-compose

  ```yaml
  version: '2.2'
  services:
    cerebro:
      image: lmenezes/cerebro:0.8.3
      container_name: cerebro
      ports:
        - "9000:9000"
      command:
        - -Dhosts.0.host=http://elasticsearch:9200
      networks:
        - es7net
    kibana:
      image: docker.elastic.co/kibana/kibana:7.1.0
      container_name: kibana7
      environment:
        - I18N_LOCALE=zh-CN
        - XPACK_GRAPH_ENABLED=true
        - TIMELION_ENABLED=true
        - XPACK_MONITORING_COLLECTION_ENABLED="true"
      ports:
        - "5601:5601"
      networks:
        - es7net
    elasticsearch:
      image: docker.elastic.co/elasticsearch/elasticsearch:7.1.0
      container_name: es7_01
      environment:
        - cluster.name=geektime
        - node.name=es7_01
        - bootstrap.memory_lock=true
        - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
        - discovery.seed_hosts=es7_01,es7_02
        - cluster.initial_master_nodes=es7_01,es7_02
      ulimits:
        memlock:
          soft: -1
          hard: -1
      volumes:
        - es7data1:/usr/share/elasticsearch/data
      ports:
        - 9200:9200
      networks:
        - es7net
    elasticsearch2:
      image: docker.elastic.co/elasticsearch/elasticsearch:7.1.0
      container_name: es7_02
      environment:
        - cluster.name=geektime
        - node.name=es7_02
        - bootstrap.memory_lock=true
        - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
        - discovery.seed_hosts=es7_01,es7_02
        - cluster.initial_master_nodes=es7_01,es7_02
      ulimits:
        memlock:
          soft: -1
          hard: -1
      volumes:
        - es7data2:/usr/share/elasticsearch/data
      networks:
        - es7net
  
  
  volumes:
    es7data1:
      driver: local
    es7data2:
      driver: local
  
  networks:
    es7net:
      driver: bridge
  ```

* 集成 Cerebro，方便查看集群状态

## Logstash 安装与导入数据

1. 下载并解压 Logstash

2. 准备 logstash.conf 配置文件

3. 运行 `logstash -f logstash.conf`

   ```conf
   input {
     file {
       path => "C:\Users\王开琦\Documents\server\es\logstash-7.1.0\movies.csv"
       start_position => "beginning"
       sincedb_path => "/dev/null"
     }
   }
   filter {
     csv {
       separator => ","
       columns => ["id","content","genre"]
     }
   
     mutate {
       split => { "genre" => "|" }
       remove_field => ["path", "host","@timestamp","message"]
     }
   
     mutate {
   
       split => ["content", "("]
       add_field => { "title" => "%{[content][0]}"}
       add_field => { "year" => "%{[content][1]}"}
     }
   
     mutate {
       convert => {
         "year" => "integer"
       }
       strip => ["title"]
       remove_field => ["path", "host","@timestamp","message","content"]
     }
   
   }
   output {
      elasticsearch {
        hosts => "http://47.94.9.237:9200"
        index => "movies"
        document_id => "%{id}"
      }
     stdout {}
   }
   ```

4. 到 Movielens 下载测试数据

