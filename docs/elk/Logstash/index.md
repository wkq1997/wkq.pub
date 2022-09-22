---
title: Logstash 数据同步
description: Logstash是elastic技术栈中的一个技术。它是一个数据采集引擎，可以从数据库采集数据到es中。
---

## 介绍

Logstash 是 Elastic 技术栈中的一个技术。它是一个数据采集引擎，可以从数据库采集数据到 es 中。我们可以通过设置自增 id
主键或者时间来控制数据的自动同步，这个 id 或者时间就是用于给 logstash 识别的。

* id：假设现在有1000条数据，Logstatsh识别后会进行一次同步，同步完会记录这个id为1000，以后数据库新增数据，那么id会一直累加，Logstatsh会有定时任务，发现有id大于1000了，则增量加入到es中

* 时间：同理，一开始同步1000条数据，每条数据都有一个字段，为time，初次同步完毕后，记录这个time，下次同步的时候进行时间比对，如果有超过这个时间的，那么就可以做同步，这里可以同步新增数据，或者修改元数据，因为同一条数据的时间更改会被识别，而id则不会。
* 真实删除数据不会在es中删除


:::tip

需要预先创建索引。

:::

## 安装配置

:::info 准备工作

1. 安装 jdk
2. mysql-connector-java-8.0.18.jar
3. Logstash 需要和 ES 版本一致

:::

官方链接： https://www.elastic.co/cn/downloads/past-releases/logstash-8-4-0

1. 解压 Logstash ，改名为 logstash，移动到指定目录，这里存放到 `/usr/local/` 下。
    ```shell
    tar -zxvf logstash-8.4.0-linux-x86_64.tar.gz
    mv logstash-8.4.0 /usr/local/logstash
    cd /usr/local/logstash
    [root@iZ2ze0mehvqbjwr4emtqz7Z logstash]# ll
    total 696
    drwxr-xr-x 2 root root    4096 Sep  5 21:53 bin
    drwxr-xr-x 2 root root    4096 Sep  5 21:53 config
    -rw-r--r-- 1 root wheel   2276 Aug 20 03:24 CONTRIBUTORS
    drwxr-xr-x 2 root wheel   4096 Aug 20 03:24 data
    -rw-r--r-- 1 root wheel   4072 Aug 20 03:24 Gemfile
    -rw-r--r-- 1 root wheel  29329 Aug 20 03:24 Gemfile.lock
    drwxr-xr-x 9 root root    4096 Sep  5 21:53 jdk
    -rw-r--r-- 1 root wheel     16 Aug 20 03:24 JDK_VERSION
    drwxr-xr-x 6 root root    4096 Sep  5 21:53 lib
    -rw-r--r-- 1 root wheel  13675 Aug 20 03:24 LICENSE.txt
    drwxr-xr-x 4 root root    4096 Sep  5 21:53 logstash-core
    drwxr-xr-x 3 root root    4096 Sep  5 21:53 logstash-core-plugin-api
    drwxr-xr-x 4 root root    4096 Sep  5 21:53 modules
    -rw-r--r-- 1 root wheel 604540 Aug 20 03:24 NOTICE.TXT
    drwxr-xr-x 3 root root    4096 Sep  5 21:53 tools
    drwxr-xr-x 4 root root    4096 Sep  5 21:53 vendor
    drwxr-xr-x 9 root root    4096 Sep  5 21:53 x-pack
    ```
2. 在安装目录创建文件夹 `sync` ,用于存放配置；并创建 `logstash-db-sync.conf` 作为数据采集的配置文件。将对应的数据库驱动文件放置到当前目录下。
    ```shell
    mkdir sync
    cd sync
    vim logstash-db-sync.conf
    mv mysql-connector-java-8.0.18.jar /usr/local/logstash/sync/
    ```
3. 在 `logstash-db-sync.conf` 文件中添加配置。
    ```conf
    input {
       jdbc {
           # 设置 MySql/MariaDB 数据库url以及数据库名称
           jdbc_connection_string => "jdbc:mysql://47.94.9.237:3306/tmes_test?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true"
           # 用户名和密码
           jdbc_user => "root"
           jdbc_password => "Qwe2022!"
           # 数据库驱动所在位置，可以是绝对路径或者相对路径
           jdbc_driver_library => "/usr/local/logstash/sync/mysql-connector-java-8.0.18.jar"
           # 驱动类名
           jdbc_driver_class => "com.mysql.cj.jdbc.Driver"
           # 开启分页
           jdbc_paging_enabled => "true"
           # 分页每页数量，可以自定义
           jdbc_page_size => "10000"
           # 执行的sql文件路径
           statement_filepath => "/usr/local/logstash/sync/sln.sql"
           # 设置定时任务间隔  含义：分、时、天、月、年，全部为*默认含义为每分钟跑一次任务
           schedule => "* * * * *"
           # 索引类型
           type => "_doc"
           # 是否开启记录上次追踪的结果，也就是上次更新的时间，这个会记录到 last_run_metadata_path 的文件
           use_column_value => true
           # 记录上一次追踪的结果值
           last_run_metadata_path => "/usr/local/logstash/sync/track_time"
           # 如果 use_column_value 为true， 配置本参数，追踪的 column 名，可以是自增id或者时间,因为没有更新时间，这里选择创建时间。
           tracking_column => "c_create_time"
           # tracking_column 对应字段的类型
           tracking_column_type => "timestamp"
           # 是否清除 last_run_metadata_path 的记录，true则每次都从头开始查询所有的数据库记录
           clean_run => false
           # 数据库字段名称大写转小写
           lowercase_column_names => false
       }
    }
    output {
       elasticsearch {
       # es地址
       hosts => ["47.94.9.237:9200"]
       # 同步的索引名
       index => "tmes-sln"
       # 设置_docID和数据相同
       document_id => "%{id}"
    }
    # 日志输出
    stdout {
        codec => json_lines
    }}
    
    ```
4. 在 `sync` 文件夹下创建 sql 同步脚本
    ```sql
    SELECT
	s.c_id,
	s.c_code,
    CASE
    s.c_element_types
    WHEN 'i_beam' THEN
    '工字钢拱架'
    WHEN 'h_beam' THEN
    'H型钢拱架'
    WHEN 'grid' THEN
    '格栅钢拱架'
    WHEN 'anchor' THEN
    '锚杆'
    WHEN 'lining' THEN
    '衬砌钢筋'
    WHEN 'mesh' THEN
    '网片'
    WHEN 'pipe' THEN
    '小导管' ELSE ''
    END c_element_type,
    CASE
    s.c_material_type
    WHEN 'anchor' THEN
    '锚杆'
    WHEN 'anchorPlate' THEN
    '锚垫板'
    WHEN 'angleIron' THEN
    '角钢'
    WHEN 'auxh' THEN
    '辅助筋'
    WHEN 'auxi' THEN
    '辅助筋'
    WHEN 'auxRebar' THEN
    '辅助筋'
    WHEN 'relRebar' THEN
    '联系筋'
    WHEN 'h_beam' THEN
    'H型钢'
    WHEN 'i_beam' THEN
    '工字钢'
    WHEN 'mainLining' THEN
    '主筋'
    WHEN 'mainRebar' THEN
    '主筋'
    WHEN 'pipe' THEN
    '导管'
    WHEN 'plate' THEN
    '连接板'
    WHEN 'auxLining' THEN
    '联系筋'
    WHEN 'wire' THEN
    '网片'
    WHEN 'u_bar' THEN
    '槽钢' ELSE ''
    END c_material_type,
    s.c_name,
    s.c_produce_team,
    sum( c.c_number ) c_number,
    round( s.c_weight / 1000000000, 3 ) c_weight,
    round( s.c_material_weight / 1000000000, 3 ) c_material_weight,
    DATE_FORMAT( s.c_finish_time, '%Y/%m/%d %H:%i' ) c_finish_time,
    c.c_standard
    FROM
    tmes_sln AS s
    INNER JOIN tmes_sln_card AS c ON s.c_id = c.c_sln_id
    WHERE
    s.c_STATUS = 5
    AND s.c_tenant_id = 14
    s.c_create_time >= :sql_last_value
    GROUP BY
    s.c_code
    ```

## 创建索引

同步数据到 ES 中， 前提是需要有索引，这个需要手动先去创建，比如：

![](https://img.wkq.pub/hexo/创建logstash所需索引.png)

## 启动 logstash
```shell
./logstash -f /usr/local/logstash/sync/logstash-db-sync.conf
```
启动成功后，出现如下信息

![logstash启动成功](https://img.wkq.pub/hexo/logstash启动成功.png)

查看 kibana ，可以看到如下信息：

![](https://img.wkq.pub/hexo/logstash创建索引.png)