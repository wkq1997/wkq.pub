---
title: Search API
---
ElasticSearch 的搜索 API 可以分为两大类，第一类是 URL Search，第二类是 Request Body Search
* URL Search： 在 URL 中使用查询参数
* Request Body Search ： 使用 Elasticsearch 提供的，基于 JSON 格式的更加完备的 Query Domain Specific Language(DSL)

## 指定查询的索引

| 语法                   | 范围                |
| ---------------------- | ------------------- |
| /_search               | 集群上所有的索引    |
| /index1/_search        | index1              |
| /index1,index2/_search | index1 和 index2    |
| /index*/_search        | 以 index 开头的索引 |

## URL 查询

* 使用 “q",指定查询字符串
* query string syntax，KV 键值对

```json
###
GET kibana_sample_data_ecommerce/_search?q=customer_first_name:Eddie
```

* df 默认字段，不指定时，会对所有字段进行查询
* Sort：排序   /  form 和 size 用于分页
* Profile 可以查看查询是如何被执行的 

```json
GET /movies/_search?q=2012&df=title&sort=year:desc&from=0&size=10&timeout=1s
{
  "profile": true
}
```

* 指定字段 VS 泛查询
  * q=title：2012   /  q = 2012

* Term VS  Phrase(需要将查询的句子用引号引起来)
  * Beautiful Mind 等效于 Beautiful  OR  Mind 
  * Beautiful Mind 等效于 Beautiful AND Mind  。Phrase 查询，还要求前后顺序保持一致。
* 分组与引号
  * title：（Beautiful AND Mind），当查询一个 Term Query 的时候，一定要用括号把查询条件括起来。
  * title： “Beautiful Mind”，如果是一个 Phrase Query 的时候，就使用引号括起来。

```json
### 使用引号,Phrase 查询
GET /movies/_search/?q=title:"Beautiful Mind"
{
  "profile": true
}
### 泛查询
GET /movies/_search?q=title:Beautiful Mind
{
  "profile": true
}
### 分组,Bool 查询
GET  /movies/_search?q=title:(Beautiful Mind)
{
  "profile": true
}
```

* 布尔操作
  * AND / OR /NOT 或者 && / || / !
    * 必须大写
    * title：（matrix NOT reloaded）
* 分组
  * `+`代表 must
  * `-`代表 must_not
  * title: (+matrix - reloaded)

```json
### 包含 Beautiful 和 Mind
GET /movies/_search?q=title:(Beautiful AND mind)
{
  "profile": true
}
### 包括 beautiful ，但是不能包含 mind 
GET /movies/_search?q=title:(2012 Beautiful NOT mind)
{
  "profile": true
}
### 可以有Beautiful 必须有Mind
GET /movies/_search?q=title:(Beautiful %2BMind)
{
  "profile": true
}
```

* 范围查询
  * 区间表示：[] 闭区间，{} 开区间
    * year ： {2019 TO 2018}
    * year：[* TO 2018]
* 算数运算
  * year： >2010
  * year： （>2010 && <=2018）
  * year: (+>2010 +<= 2018)
* 通配符查询，不建议使用（查询效率低），即使使用也要放在最后面
  * ？ 代表 1 个字符，* 代表 0 或多个字符
    * title：mi?d
    * title: be*
* 正则表达
  * title:[bt]oy
* 模糊匹配和近似查询
  * title：beautiful~1
  * title: "lord rings"~2

```json
### 范围查询，区间写法  / 数学写法
GET /movies/_search?q=year:>=1980
{
  "profile": true
}
### 
GET /movies/_search?q=year:{2000 TO 2018]
{
  "profile": true
}
### 通配符查询,只要有 Term 满足条件就会被查到
GET /movies/_search?q=title:b*
{
  "profile": true
}
### 模糊查询 & 近似度匹配
GET /movies/_search?q=title:beautifl~1
{
  "profile": true
}
### 近似度匹配,可以不相邻
GET /movies/_search?q=title:"Lord Rings"~2
{
  "profile": true
}
```

### Request Body Search

高阶的使用方法只能在 Request Body Search 里面去做

* 将查询语句通过 HTTP Request Body 发送给 Elasticsearch
* Query DSL

```json
POST /movies,404_idx/_search?ignore_unavailable=true
{
  "profile": true,
  "query": {
    "match_all": {}
  }
}
```

#### 分页

* From 从 0 开始，默认返回 10 个结果
* 获取靠后的翻页成本较高

```json
POST /movies,404_idx/_search?ignore_unavailable=true
{
  "profile": true,
  "query": {
    "match_all": {}
  },
  "from": 1, "size": 2
}
```

#### 排序

1. 最好在“数字型” 与 日期型字段上排序
2. 因为对于多值类型或分析过的字段排序，系统会选一个值，无法得知该值。

```json
### 排序
POST /kibana_sample_data_ecommerce/_search
{
  "profile": true,
  "from": 0,
  "sort": [
    {
      "order_date": {
        "order": "desc"
      },
      "products.base_price": {
        "order": "desc"
      }
    }
  ]
}
```

#### _source filtering

*  如果 _source  没有存储，那就只返回匹配的文档的元数据
* _source 支持使用通配符，_source["name*","desc*"]

```json
### _source fultering
GET /kibana_sample_data_ecommerce/_search
{
  "_source": ["order_date","order_date","products.*"],
  "from": 10,
  "size": 3,
  "query": {
    "match_all": {}
  }
}
```

#### 脚本字段

* 用例：订单中有不同的汇率，需要结合汇率对，订单价格进行排序

```json
### 脚本字段
GET kibana_sample_data_ecommerce/_search
{
  "script_fields": {
    "new_fileld": {
      "script": {
        "lang": "painless",
        "source": "doc['order_date'].value+'hello'"
      }
    }
  },
  "from": 10,
  "size": 5,
  "query": {
    "match_all": {}
  }
}
```

#### 使用查询表达式 - Match

```json
### 查询表达式 - match,默认是 or 的关系
GET movies/_search
{
  "query": {
    "match": {
      "title": "Last Christmas"
    }
  }
}
### 必须都出现，and ，让搜索结果变得更加精确
POST movies/_search
{
  "profile": true, 
  "query": {
    "match": {
      "title": {
        "query": "Last Christmas",
        "operator": "and"
      }
    }
  }
}
```

#### 短语查询 - Match Phrase 

必须按照顺序出现，slop =1 表示中间可能会有一个其它的字。

```json
### 短语查询
POST movies/_search
{
  "query": {
    "match_phrase": {
      "title": {
        "query": "one love",
        "slop": 1
      }
    }
  }
}
```

## Query String 

* 类似于 URL Query

```
### Query String
PUT /users/_doc/1
{
  "name":"Wang Kaiqi",
  "about":"java react elasticsearch mysql"
}
PUT /userss/_doc/1
{
  "name":"Wang Kaitong",
  "about":"Network"
}

POST users/_search
{
  "query": {
    "query_string": {
      "default_field": "name",
      "query": "Wang Kaiqi"
    }
  }
}
POST users/_search
{
  "query": {
    "query_string": {
      "fields":["name","about"],
      "query": "(Wang AND kaiqi) OR (java AND elasticsearch)"
    }
  }
}
```

##  Simple Query String

* 类似于 Query Query,但是会忽略掉错误的语法，同时支持部分查询语法
* 不支持 AND OR  NOT ，会只当作字符串处理
* Term 之间默认的关系是 OR ，可以指定 Operator
* 支持部分逻辑
  * `+` 替代 AND
  * | 替代 OR
  * `-` 替代 NOT

## 基于词项和基于全文的搜索

* 两者最大的区别是 Term 查询是不会做分词处理的。但全文本查询会做分词处理。

### 基于Term的查询
* Term 的重要性
  * Term 是表达语义的最小单位。搜索和利用统计语言模型进行自然语言处理都需要处理 Term
* 特点
  * Term Level Query ： Term Query | Range Query | Exists Query | Prefix Query | Wildcard Query
  * 在 ES 中， Term 查询，对输入不做分词处理。会将输入作为一个整体，在倒排索引中查找准确的词项，并且使用相关度算分公式为每个包含该词项的文档进行相关度算分——例如“Apple Store“
  * 可以通过 Constant Score 将查询转换成一个 Filtering ，避免算分，并利用缓存，提升性能。
```json
DELETE products
## 关于 Term 查询的例子
POST /products/_bulk
{"index":{"_id":1}}
{"productID":"XHDK-A-1293-#fJ3","desc":"iPhone"}
{"index":{"_id":2}}
{"productID":"KDKE-B-9947-#kL5","desc":"iPad"}
{"index":{"_id":3}}
{"productID":"JODL-X-1937-#pV7","desc":"MBP"}
GET products
POST /products/_search
{
  "query": {
    "term": {
      "desc": {
        "value": "iPhone"
      }
    }
  }
}
POST /products/_search
{
  "query": {
    "term": {
      "productID": {
        "value": "XHDK-A-1293-#fJ3"
      }
    }
  }
}
### 上述两个查询的结果是 [ ]
### 这是因为 Term 查询不会对输入做任何分词处理，这就意味着你搜索的是带大写 P  的iPhone,而 ES 在做索引的时候，会默认对 内容做分词处理，这就是上述查询不会返回内容真正的原因
POST /products/_search
{
  "query": {
    "term": {
      "desc.keyword": "iPhone"
    }
  }
}
### 复合查询 Constant Score 转为 Filter
#### 将 Query 转为 Filter，忽略 TF-IDF计算，避免相关度算分的消耗
#### Filter 可以有效利用缓存
POST /products/_search
{
  "explain": true
  , "query": {
    "constant_score": {
      "filter": {
        "term": {
          "productID.keyword": "XHDK-A-1293-#fJ3"
        }
      }
    }
  }
}
```
### 基于全文的查询
* 基于全文的查询
  * Match Query | Match Phrase Query | Query String Query
* 特点
  * 索引和搜索时都会进行分词，查询字符串会先传递到一个合适的分词器，然后生成一个供查询的词项列表。
  * 默认的查询条件是 OR， 如果想对查询条件做一个精准度的控制，可以通过加入 `"operator":"AND"`,这样结果当中就包含了  Matrix 和 reload。
  * 查询时候，先会对输入的查询进行分词，然后每个词项逐个进行底层的查询，最终将结果进行合并。并且为每个文档生成一个算分。——例如查 "Matrix reloaded" ,会查到 Matrix 或者 reload 的所有结果

![image-20220912170621685](https://img.wkq.pub/hexo/image-20220912170621685.png)

## 结构化搜索

### 结构化数据

* 结构化搜索（Structured search）是指对结构化数据的搜索
  * 日期、布尔类型和数字都是结构化的。
* 文本也可以是结构化的
  * 如彩色笔可以有离散的颜色集合：红（red）、绿（green）、蓝（blue）
  * 一个博客可能被标记了标签，例如，分布式（distributed）和 搜索（search）
  * 电商 网站上的商品都有 UPCs（通用产品码 Universal Product Codes）或其它的唯一标识，它们都需要遵从严格规定的、结构化的格式。

#### ES 中的结构化查询

* 布尔、时间、日期和数字这类结构化数据：有精确的格式，我们可以对这些格式进行逻辑操作。包括比较数字或时间的范围，或判定两个值得大小。
* 结构化的文本可以做精确匹配或者部分匹配
  * Term 查询 | Prefix 前缀查询
* 结构化结果只有 ”是“ 或 ”否“ 两个值
  * 根据场景需要，可以决定结构化搜索是否需要打分

```json
## 结构化搜索，精确匹配
DELETE products
POST /products/_bulk
{"index":{"_id":1}}
{"price":10,"avaliable":true,"date":"2022-09-11","productId":"XHDK-A-1293-#fJ3"}
{"index":{"_id":2}}
{"price":20,"avaliable":true,"date":"2022-09-12","productId":"KDKE-B-9947-#kL3"}
{"index":{"_id":3}}
{"price":30,"avaliable":true,"productId":"JODL-X-1973-#pV7"}
{"index":{"_id":4}}
{"price":40,"avaliable":false,"productId":"QQPX-R-3956-#aD8"}
GET products
## 对布尔值 match 查询，有算分
POST products/_search
{
  "profile": true,
  "explain": true,
  "query": {
    "term": {
      "avaliable": {
        "value": "true"
      }
    }
  }
}
## 对 布尔值，通过 constant score 转成 filtering ，没有算分
POST products/_search
{
  "profile": true,
  "explain": true,
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "avaliable": true
        }
      },
      "boost": 1.2
    }
  }
}
## 数字类型 Term
POST products/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "price": {
            "gte": 10,
            "lt": 30
          }
        }
      },
      "boost": 1.2
    }
  }
}
## 日期 range ,查询前一天的
POST products/_search
{
  "query": {
    "constant_score": {
      "filter": {"range": {
        "date": {
          "lte": "now-1d"
        }
      }},
      "boost": 1.2
    }
  }
}
## Null 数值| exists
POST products/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "exists": {
          "field": "date"
        }
      },
      "boost": 1.2
    }
  }
}
## 处理多值字段
POST /movie/_bulk
{"index":{"_id":1}}
{"title":"Father of the Bridge Part II","year":1995,"genre":"Comedy"}
{"index":{"_id":2}}
{"title":"Dave","year":1993,"genre":["Comedy","Romance"]}

## 处理多值字段，term 查询时包含，而不是等于
POST movie/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "genre.keyword": "Comedy"
        }
      },
      "boost": 1.2
    }
  }
}
```





:::tip

Term 查询是包含，不是完全相等。针对多值字段查询要尤其注意。

:::

#### Date Math Expression

| 符号  | 含义 |
| ----- | ---- |
| y     | 年   |
| M     | 月   |
| w     | 周   |
| d     | 天   |
| H / h | 小时 |
| m     | 分钟 |
| s     | 秒   |

```json
## 日期 range ,查询前一天的
POST products/_search
{
  "query": {
    "constant_score": {
      "filter": {"range": {
        "date": {
          "lte": "now-1d"
        }
      }}
    }
  }
}
```

## 相关度和相关性算分

* 相关性 —  Relevance
  * 搜索的相关性算分，描述了一个文档和查询语句的匹配的程度。ES 会对每个匹配的查询条件的结果进行算分 _score
  * 打分的本质是排序，需要把最符合用户需求的文档排到前面。ES 5 之前，默认的相关度算分采用 TF-IDF ，现在采用 BM 25

| 词（Term） | 文档（Doc Id）                                  |
| ---------- | ----------------------------------------------- |
| 区块链     | 1，2，3                                         |
| 的         | 2，3，4，5，6，7，8，10，12，13，15，18，19，20 |
| 应用       | 2，3，8，9，10，13，15                          |

### 词频 TF

* Term Frequency：检索词在一篇文档中出现的频率
  * 检索词出现的次数除以文档的总字数

* 度量一条查询和结果文档相关性的简单方法：简单将搜索中的每个词的 TF 进行相加
  * TF（区块链）+ TF （的） + TF（应用）
* Stop Word 
  * “的”在文档中出现了很多次，但是对贡献相关度几乎没有用户，不应该考虑它们的 TF

### 逆文档频率 IDF

* DF ： 检索词在所有文档中出现的频率
  * 区块链在相对比较少的文档中出现
  * 应用在相对比较多的文档中出现
  * Stop Word 在大量的文档中出现
* Inverse Document Frequency：简单说 = log（全部文档数 / 检索词出现过的文档总数）
* TF - IDF 本质就是将 TF 求和变成了加权求和
  * TF（区块链）* IDF（区块链）+ TF（的）* IDF（的）+ TF（应用）* IDF（应用）

|        | 出现的文档数 | 总文档数 | IDF           |
| ------ | ------------ | -------- | ------------- |
| 区块链 | 200万        | 10亿     | log(500)=8.95 |
| 的     | 10亿         | 10亿     | log(1) = 0    |
| 应用   | 5亿          | 10亿     | log(2)=1      |

### TF-IDF

* TF-IDF 被公认为是信息检索领域最重要的发明
* 除了在信息检索，在文献分类和其它相关邻域有着非常广泛的作用

* 现代搜索引擎，对 TF-IDF 进行了大量的优化

![image-20220912201536033](https://img.wkq.pub/hexo/image-20220912201536033.png)



### BM 25

* 从 ES 5 开始，默认算法改为 BM 25
* 和经典的 TF - IDF 相比，当 TF 无限增加时，BM 25 的算分会趋于一个数值

![image-20220912201717869](https://img.wkq.pub/hexo/image-20220912201717869.png)

### Bootsting Relevance

* Boosting 是控制相关度的一种手段
  * 索引，字段或者查询子条件
* 参数 bootst 的含义
  * 当 boost > 1 时， 打分的相关度相对性提升。
  * 当 0 < boost <1 时，打分的权重相对性降低
  * 当 boost < 0 时，贡献负分



## Query & Filtering 与多字符串多字段查询

### Query Context & Filter Context

* 高级搜索的功能，支持多项文本输入，针对多个字段进行搜索
* 搜索引擎一般也提供基于时间，价格等条件的过滤
* 在 Elasticsearch 中，有Query 和 Filter 两种不同的 Context
  * Query Context ：相关度算分
  * Filter Context ：不需要算分（Yes or No）,可以利用 Cache ，获得更好的性能

### 条件组合

* 假设要搜索一本电影，包含了以下一些条件
  * 评论中包含了 Guitar，用户打分高于 3 分，同时上映日期要在 1993 与 2000 年之间
* 这个搜索其实包含了 3 段逻辑，针对不同的字段
  * 评论字段中要包含 Guitar / 用户评分大于3 / 上映日期要在给定的范围
* 同时包含这三个逻辑，并且有比较好的性能
  * 复合查询：bool Query

### bool 查询

* 一个 bool 查询，是一个或者多个查询子句的组合
  * 总共包括两种子句。其中两种会影响算分，两种不影响算分
* 相关性并不只是全文本检索的专利。也适用于 yes | no 的子句，匹配的子句越多，相关性评分越高。如果多条查询子句被合并为一条复合查询语句，比如 bool 查询，则每个查询子句计算得出的评分会被合并到总的相关度评分中。

| 子句     | 描述                                     |
| -------- | ---------------------------------------- |
| must     | 必须匹配。贡献算分                       |
| should   | 选择性匹配。贡献算分                     |
| must_not | Filter Context，查询子句，必须不能匹配   |
| filter   | Filter Context，必须匹配，但是不贡献算分 |

#### bool 查询语法

* 子查询可以任意顺序出现
* 可以嵌套多个查询，可以实现 should not 等逻辑
* 如果 bool 查询中，没有 must  条件，should 中必须至少满足一条查询

```json
POST /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "price": {
              "value": "30"
            }
          }
        }
      ],
      "filter": [
        {
          "term": {
            "avaliable": true
          }
        }
      ],
      "must_not": [
        {
          "range": {
            "price": {
              "lte": 10
            }
          }
        }
      ],
      "should": [
        {
          "term": {
            "productId.keyword": {
              "value": "XHDK-A-1293-#fJ3"
            }
          }
        },
        {
          "term": {
            "productId.keyword": {
              "value": "JODL-X-1937-#pV7"
            }
          }
        },
        {
          "bool": {
            "must_not": [
              {"term": {
                "avaliable": {
                  "value": false
                }
              }}
            ]
          }
        }
      ],
      "minimum_should_match": 1
    }
  }
}
```

#### 查询语句的结构，会对相关度算分产生影响

![image-20220912211028077](https://img.wkq.pub/hexo/image-20220912211028077.png)

* 同一层级下的竞争字段，具有相同的权重。
* 通过嵌套 bool 查询，可以改变对算分的影响。

#### 控制字段的 Boosting

* Boosting 是控制相关度的一种手段
  * 索引，字段或查询条件
* 参数 boost 的含义
  * 当boost >1 时，打分的相关性相对性提升。
  * 当 0 < boost <1 ,打分的权重相对性降低
  * 当 boost < 0 ,贡献负分

```json
POST /blogs/_bulk
{"index":{"_id":1}}
{"title":"Apple iPad","content":"Apple iPad,Apple iPad"}
{"index":{"_id":2}}
{"title":"Apple iPad,Apple iPad","content":"Apple iPad"}

POST blogs/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "title": {
              "query": "apple,ipad",
              "boost": 1.1
            }
          }
        },
        {
          "match": {
            "content": {
              "query": "apple,ipad",
              "boost": 1
            }
          }
        }
      ]
    }
  }
}
```



## 单字符串多字段查询

:::tip

单字符串多字段查询其实非常常见，比如搜索引擎只允许你输入一个字段。

:::

### 单字符串查询的实例

```json
# 单字符串多字段查询 Dis Max Query
PUT /blogs/_bulk
{"index":{"_id":1}}
{"title":"Quick brown rabbits","body":"Brown rabbits are commonly seen."}
{"index":{"_id":2}}
{"title":"Keeping pets healthy","body":"My Quick brown for eats rabbits on a regular basic"}

POST blogs/_search
{
  "explain": true,
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "title": "Brown fox"
          }
        }, 
        {
          "match": {
            "body": "Brown fox"
          }
        }
      ]
    }
  }
}
```

### Disjunction Max Query

* 将任何与任意查询匹配的文档作为结果返回。采用字段上最匹配的评分为最终评分返回。

```json
### Dis MAX Query
POST blogs/_search
{
  "query": {
    "dis_max": {
      "tie_breaker": 0.7,
      "boost": 1.2,
      "queries": [
        {
          "match": {
            "title": "Quick fox"
          }
        },
        {"match": {
          "body": "Quick fox"
        }}
      ]
    }
  }
}
```

### Multi Match

#### 三种场景

* 最佳字段（Best Fields）
  * 当字段之间相互竞争，又相互关联。例如 title 和 body 这样的字段，评分来自最匹配字段
* 多数字段（Most Fields）
  * 处理英文字段时：一种创建的手段是，在主字段（English Analyzer） ，抽取词干，加入同义词，以匹配更多的文档。相同的文本，加入子字段（Standard Analyzer），以提供更加精确的匹配。其它字段作为匹配文档提高相关度的信号

* 混合字段（Cross Field）
  * 对于某些实体，例如人名，地址，图书信息。需要在多个字段中确定信息，单个字段只能作为整体的一部分。希望在任何这些列出的字段中找到尽可能多的词。

#### Multi Match Query

* Best Fields是默认类型，可以不用指定
* Minimum should match 等参数可以传递到生成的 query 中。



