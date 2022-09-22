---
title: Mapping
---

## 什么是Mapping
* Mapping 类似数据库中的 schema 的定义，作用如下
  * 定义索引中的字段的名称
  * 定义字段的数据类型，例如字符串、数字、布尔
  * 字段，倒排索引的相关配置（Analyzed or Analyzed,Analyzer）
* Mapping  会把 JSON 文档映射成 Lucene 所需要的扁平格式
* 一个 Mapping 属于一个索引的 Type
  * 每个文档都属于一个 Type
  * 一个 Type 有 一个 Mapping 定义
  * 7.0 开始，不需要在 Mapping 定义中指定 Type 字段

## 字段的数据类型

* 简单类型
  * Text /Keyword
  * Date 
  * Integer / Floating
  * Boolean
  * IPv4 & IPv6
* 复杂类型 - 对象和嵌套对象
  * 对象类型 / 嵌套类型
* 特殊类型
  * geo_point & geo_shape /percolator

## 什么是 Dynamic Mapping

* 在写入文档时，如果索引不存在，会自动创建索引
* Dynamic Mapping 的机制，使得我们无需手动定义 Mappings，Elasticsearch 会自动根据文档信息，推算出字段的类型。
* 但是有时候会推算的不对，例如地理位置信息
* 当类型如果设置不对时，会导致一些功能无法正常运行，例如 Range 查询

### 类型的自动识别

| JSON类型 | Elasticsearch 类型                                           |
| -------- | ------------------------------------------------------------ |
| 字符串   | 匹配日期格式，设置成Date；匹配数字设置为float或者 long，该选项默认关闭；设置为text，并且增加 keyword 子字段 |
| 布尔型   | boolean                                                      |
| 浮点数   | float                                                        |
| 整数     | long                                                         |
| 对象     | Object                                                       |
| 数组     | 由第一个非空数值的类型所决定                                 |
| 空值     | 忽略                                                         |

```json
## Dynamic Mapping
### 写入文档，查看 Mapping
PUT mapping_test2/_doc/2
{
  "firstname":"Wang",
  "lastname":"Kaiqi",
  "loginDate":"2022-07-24T20:22:11Z"
}
### 查看mapping
GET mapping_test/_mapping
 
### Delete index
DELETE mapping_test*

### dynamic mapping 推断字段的类型
PUT mapping_test/_doc/1
{
  "uid":"123",
  "isVip":false,
  "isAdmin":"true",
  "age":25,
  "height":180
}
```

### 更改 Mapping 的字段类型

* 新增加字段

  * Dynamic 设为 true 时，一旦有新增字段的文档写入，Mapping 也同时被更新

  * Dynamic 设为 false ,Mapping 不会被更新，新增字段的数据无法被索引，但是信息会出现在 _source 中

  * Dynamic 设置为 Strict ，文档写入失败

* 对已有字段，一旦已经有数据写入，就不再支持修改字段定义
  * Lucene 实现的倒排索引，一旦生成后，就不允许修改
* 如果希望改变字段类型，必须 Reindex API，重建索引
* 原因
  * 如果修改了字段的数据类型，会导致已被索引的部分无法被搜索
  * 但是如果是增加新的字段，就不会有这样的影响

### 控制 Dynamic Mappings

|                    | true | false | strict |
| ------------------ | ---- | ----- | ------ |
| 文档可索引（搜索） | YES  | YES   | NO     |
| 字段可索引         | YES  | NO    | NO     |
| Mapping被更新      | YES  | NO    | NO     |

* 当 dynamic 被设置成false时，存在新增字段的数据写入，该数据可以被索引，但是新增字段被丢弃
* 当设置成 Strict 模式的时候，数据写入直接报错

```json
### 默认 Mapping 支持 dynamic ，写入的文档中加入新的字段
PUT dynamic_mapping_test/_doc/1
{
  "new Field":"someValue"
}
POST dynamic_mapping_test/_search
{
  "query": {
    "match": {
      "new Field": "someValue"
    }
  }
}
### 修改 dyncmic false
PUT dynamic_mapping_test/_mapping
{
  "dynamic":false
}
### 新增 anotherField
PUT dynamic_mapping_test/_doc/2
{
  "anotherFiled":"someValue"
}
### 该字段不可以被搜索，因为 dynamic 已经被设置 为 false
POST dynamic_mapping_test/_search
{
  "query": {
    "match": {
      "anotherFiled": "someValue"
    }
  }
}
GET dynamic_mapping_test/_mapping
### 但是数据存储 了
GET dynamic_mapping_test/_doc/2

### 修改为 strict
PUT dynamic_mapping_test/_mapping
{
  "dynamic":"strict"
}

### 写入数据出错
PUT dynamic_mapping_test/_doc/12
{
  "lastField":"value"
}
DELETE dynamic_mapping_test
```

## 定义一个 Mapping

```json
PUT  movies
{
    "mappings":{
        //define your mappings here
    }
}
```

* 可以参考 API 手册，纯手写
* 为了减少输入的工作量，减少出错概率，可以依据以下步骤
  * 创建一个临时的 index，写入一个样本数据
  * 通过访问 Mapping API 获得 该临时文件的动态 Mapping 定义
  * 修改后使用该配置创建需要的索引
  * 删除临时索引

### 控制当前字段是否被索引

* index - 控制当前字段是否被索引。默认为 true 。如果设置成 false ，该字段不可被搜索

* 四种不同级别的 Index Options 配置，可以控制倒排索引记录的内容
  * docs —  记录 doc id
  * freqs — 记录 doc id  和 term frequencies
  * positions —  记录 doc id / term frequencies  / term position
  * offsets — doc id /term frequencies / term position /character offects
* Text 类型默认记录 positions，其它默认为 docs
* 记录内容越多，占用存储空间越大

```json
PUT users
{
  "mappings": {
    "properties": {
      "firstName": {
        "type": "text",
        "index": true
      },
      "lastName": {
        "type": "text",
        "index": false
      },
      "mobile": {
        "type": "text",
        "index_options": "offsets"
      }
    }
  }
}
```

### null_value

* 需要对 NULL 值实现搜索
* 只有Keyword 字段支持设定 Null_Value

```json
### null value
GET users/_search?q=mobile:NULL
PUT users
{
  "mappings": {
    "properties": {
      "firstName": {
        "type": "text",
        "index": true
      },
      "lastName": {
        "type": "text"
      },
      "mobile": {
        "type": "keyword",
        "null_value": "NULL"
      }
    }
  }
}
PUT users/_doc/1
{
  "firstName":"Ruan",
  "lastName":"Yiming",
  "mobile":null
}
```

### copy_to

* _all 在 7 中被copy_to所替代
* 满足一些特定的搜索需求，字段组装。
* copy_to 将字段拷贝到目标字段，实现类似 _all 的作用
* copy_to 的目标字段不出现在 _source 中，只在查询的时候使用

```json
### copy_to
PUT users
{
  "mappings": {
    "properties": {
      "firstName":{
        "type": "text",
        "copy_to": "fullName"
      },
      "lastName":{
        "type": "text",
        "copy_to": "fullName"
        
      }
    }
  }
}
GET users/_search?q=fullName:(Wang Kaiqi)
```

## 数组类型

* Elasticsearch 中并不提供专门的数组类型。但是任何字段，都可以包含相同类型的数值

```json
### 数组
PUT users/_doc/1
{
  "name":"onebird",
  "interests":"reading"
}
PUT users/_doc/2
{
  "name":"twobird",
  "interests":["reading","music"]
}
GET users/_search
{
  "query": {
    "match": {
      "interests": "music"
    }
  }
}
```

## 多字段类型

* 厂商名字实现精确匹配
  * 增加一个 keyword 字段
* 使用不同的 analyzer 
  * 不同语言
  * pingyin 字段的搜索
  * 还支持为搜索和索引 指定不同的 analyzer

```json
### 多字段类型
PUT products
{
  "mappings": {
    "properties": {
      "company": {
        "type": "text",
        "fields": {
          "keyword":{
            "type":"keyword",
            "ignore_above":256
          }
        }
      },
      "commant":{
        "type":"text",
        "fields": {
          "english_comment":{
            "type":"text",
            "analyzer":"english",
            "search_analyzer":"english"
          }
        }
      }
      
    }
  }
}
```

## Exact Values VS Full Text

* Exact Value : 包括数字 / 日期 / 具体的一个字符串（例如 Apple Store）
  * Elasticsearch 中的 keyword
* 全文本，非结构化的文本数据
  * Elasticsearch 中的 text

### Exact Values 不需要被分词

* Elasticsearch 为每一个字段创建一个倒排索引
* Exact Value 在索引时，不需要做额外的分词处理

![image-20220910202929263](https://img.wkq.pub/hexo/image-20220910202929263.png)

### 自定义分词

*  当 Elasticsearch 自带的分词器无法满足时，可以自定义分词器。通过自己组合不同的组件实现
  * Character  Filter
  * Tokenizer
  * Token Filter

#### Character Filters

* 在多个 Tokenizer 之前对文本进行处理，例如增加删除及替换字符。可以配置多个 Character Filter 。会影响 Tokenizer 的 position 和 offset 信息。

* 一些自带的 Character  Filters

  * HTML strip - 去除 html 标签，处理网络爬出抓取的数据时可以使用

    ```json
    ###  _analyze
    POST _analyze
    {
      "tokenizer": "keyword",
      "char_filter": [
        "html_strip"
      ],
      "text": "<b>hello world<b/>"
    }
    ```

  * Mapping - 字符串替换

     ```json
     ### 使用char filter 进行替换
     POST _analyze
     {
       "tokenizer": "standard",
       "char_filter": [
         {
           "type": "mapping",
           "mappings": [
             "- => _"
           ]
         }
       ],
       "text": "124-456,I-test! test-900 650-555-1235"
     }
     ```

  * Pattern replace - 正则匹配替换



#### Tokenizer

*  将原始的文本按照一定的规则，切分为词（term or token）
* Elasticsearch 内置的 Tokenizers
  * whitespace / standard / uax_url_email /pattern /keyword /path hierarchy
* 可以用 Java 开发插件，实现自己的 Tokenizer

#### Token Filters

* 将 Tokenizer 输出的单词（term）,增加，删除，修改
* 自带的 Token  Filters 
  * Lowercase / stop /synonym (添加近义词)

#### 自定义 Custom  Analyzer

