---
title: 文档基本CRUD与批量操作
description: 文档基本CRUD与批量操作
---

## 文档的 CRUD

| 操作   | 语句                                                         | 描述                                                            |
| ------ | ------------------------------------------------------------ |---------------------------------------------------------------|
| Index  | PUT my_index/_doc/1<br/>{"user":"mike","comment":"You know，for search"} | 如果ID不存在，创建新的文档。否则，先删除现有的文档，再创建新的文档，版本会增加。                     |
| Create | PUT my_index/_create/1<br/>{"user":"mike","comment":"You know,for search"}<br/>POST my_index/_doc(不指定 ID，自动生成)<br/>{"user":"mike","comment":"You know,for search"} | Index与Create 不一样的地方：如果文档不存在，就索引新的文档。否则现有文档会被删除，新的文档被索引，版本信息+1 |
| Read   | GET my_index/_doc/1                                          |                                                               |
| Update | POST my_index/_update/1<br/>{"doc":{"user":"mike","comment":"You know,for search"}} | Update 方法不会删除原有的文档，而是实现真正的数据更新<br/>POST方法，Payload 需要包含在 doc 中 |
| Delete | DELETE my_index/_doc/1                                       |                                                               |

```json5 操作示例
#create document. 自动生成 _id
POST users/_doc
{
	"user" : "Mike",
    "post_date" : "2019-04-15T14:12:12",
    "message" : "trying out Kibana"
}

#create document. 指定Id。如果id已经存在，报错
PUT users/_doc/1?op_type=create
{
    "user" : "Jack",
    "post_date" : "2019-05-15T14:12:12",
    "message" : "trying out Elasticsearch"
}

#create document. 指定 ID 如果已经存在，就报错
PUT users/_create/1
{
     "user" : "Jack",
    "post_date" : "2019-05-15T14:12:12",
    "message" : "trying out Elasticsearch"
}

### Get Document by ID
#Get the document by ID
GET users/_doc/1


###  Index & Update
#Update 指定 ID 
GET users/_doc/1

PUT users/_doc/1
{
	"user" : "Mike"

}


#GET users/_doc/1
#在原文档上增加字段
POST users/_update/1/
{
    "doc":{
        "post_date" : "2019-05-15T14:12:12",
        "message" : "trying out Elasticsearch"
    }
}



### Delete by Id
# 删除文档
DELETE users/_doc/1


### Bulk 操作
#执行两次，查看每次的结果

#执行第1次
POST _bulk
{ "index" : { "_index" : "test", "_id" : "1" } }
{ "field1" : "value1" }
{ "delete" : { "_index" : "test", "_id" : "2" } }
{ "create" : { "_index" : "test2", "_id" : "3" } }
{ "field1" : "value3" }
{ "update" : {"_id" : "1", "_index" : "test"} }
{ "doc" : {"field2" : "value2"} }


#执行第2次
POST _bulk
{ "index" : { "_index" : "test", "_id" : "1" } }
{ "field1" : "value1" }
{ "delete" : { "_index" : "test", "_id" : "2" } }
{ "create" : { "_index" : "test2", "_id" : "3" } }
{ "field1" : "value3" }
{ "update" : {"_id" : "1", "_index" : "test"} }
{ "doc" : {"field2" : "value2"} }

### mget 操作
GET /_mget
{
    "docs" : [
        {
            "_index" : "test",
            "_id" : "1"
        },
        {
            "_index" : "test",
            "_id" : "2"
        }
    ]
}


#URI中指定index
GET /test/_mget
{
    "docs" : [
        {

            "_id" : "1"
        },
        {

            "_id" : "2"
        }
    ]
}


GET /_mget
{
    "docs" : [
        {
            "_index" : "test",
            "_id" : "1",
            "_source" : false
        },
        {
            "_index" : "test",
            "_id" : "2",
            "_source" : ["field3", "field4"]
        },
        {
            "_index" : "test",
            "_id" : "3",
            "_source" : {
                "include": ["user"],
                "exclude": ["user.location"]
            }
        }
    ]
}

### msearch 操作
POST kibana_sample_data_ecommerce/_msearch
{}
{"query" : {"match_all" : {}},"size":1}
{"index" : "kibana_sample_data_flights"}
{"query" : {"match_all" : {}},"size":2}


### 清除测试数据
#清除数据
DELETE users
DELETE test
DELETE test2
```

* 支持自动生成文档 Id 和指定文档 Id 两种方式
* 通过调用 `POST /users/_doc`,系统会自动生成 document id
* 使用 HTTP  `PUT user/_create/1` 创建时，URL 中显示指定 _create , 此时如果该 id 的文档已经存在，则操作失败。
* mget 是通过文档 ID 列表得到文档信息
* msearch 是根据查询条件，搜索到相应文档。

:::tip

PUT 方法要求是幂等的，POST 方式不是幂等的，POST 方法修改资源状态时，URL 指示的该资源是父级资源，待修改资源的信息在请求体中携带。而 PUT 方法修改资源状态时，URL直接指示待修改资源。

所以，对于 ES 的PUT 请求，URL上需明确到  document ID ，即可以新增又可以更新整个文档（ES的更新都是 get ，有就delete-再创建），但无论如何都是这一个 document。由于PUT 请求既可以新增又可以更新的特性，为了提供 put-if-absent 特性，即没有时新增，增加了 op_type=create  的选项（op_type 只有 create、index）

而POST 请求 URL 是不需要指定 ID 的，每次都会创建一个新的文档，就不是幂等的，（其实 PUT 执行的操作，把PUT换成 POST 也是可以的，但这个官方没说，是实验出来的。）

上面是根据 HTTP 请求来区分，如果根据 ES API 来区分

index： 针对整个文档，既可以新增又可以更新

create： 只是新增操作，已有报错，可以用 PUT 指定 ID，或 POST 不指定 ID
update：指的是部分更新，官方只是说用 POST，请求 body 里用 script 或doc 里包含文档要更新的部分；

delete 和 read ： 就是 delete 和 get 请求了，比较简单。

:::

| 问题         | 原因               |
| ------------ | ------------------ |
| 无法连接     | 网络故障或集群挂了 |
| 连接无法关闭 | 网络故障或节点出错 |
| 429          | 集群过于繁忙       |
| 4xx          | 请求体格式有错     |
| 500          | 集群内部错误       |

