---
title: 通过Analyzer进行分词
description: Analysis -分本分析是把全文本转换成一系列单词的过程，也叫分词
---
## Analysis和Analyzer
* Analysis 文本分析是把全文本转换成一系列单词（term / token） 的过程，也叫分词
* Analysis 是通过 Analyzer 来实现的
  * 可使用 Elasticsearch 内置的分析器/或者按需定制化分析器
* 除了在数据写入的时转换词条，匹配 Query 语句的时候也需要用相同的分析器对查询语句进行分析。
## Analyzer
* 分词器是专门处理分词的组件，Analyzer由三部分组成
  * Character Filter （针对原始文本处理，例如去除 html）/ Tokenizer （按照规则切分为单词） / Token Filter （将切分的单词进行加工，小写，删除 stopwords，增加同义词）

![image-20220909192438314](https://img.wkq.pub/hexo/image-20220909192438314.png)

## Elasticsearch 的内置分词器

* Standard Analyzer：默认分词器，按词切分，小写处理
* SImple Analyzer： 按照分字母切分（符号被过滤），小写处理
* Stop Analyzer： 小写处理，停用词过滤
* Whitespace Analyzer： 按照空格切分，不转小写
* Keyword Analyzer：部分此，直接将输入当作输出
* Patter Analyzer：正则表达式，默认 \W+（非字符分割）
* Language： 提供了 30 多种常见语言的分词器
* Custom Analyzer：自定义分词器

## _analyzer  API

* 直接指定 Analyzer 进行测试
* 指定索引的字段进行测试
* 自定义分词进行测试

```json
## 分词
### 直接指定 Analyzer 进行测试
GET /_analyze
{
  "analyzer": "standard",
  "text": "Mastering Elasticsearch，elasticsearch in Action"
}
### 指定索引的字段进行测试
POST users/_analyze
{
  "field": "user"
  , "text": "Mastering Elasticsearch"
}
### 自定义分词进行测试
POST /_analyze
{
  "tokenizer": "standard",
  "filter": ["lowercase"],
  "text": "Mastering Elasticsearch"
}
```

## Sandard Analyzer

* 默认分词器
* 按词切分
* 小写处理

![image-20220909193617326](https://img.wkq.pub/hexo/image-20220909193617326.png)

## Simple Analyzer

* 按照非字母切分，非字母的都被去除
* 小写处理

![image-20220909193921592](https://img.wkq.pub/hexo/image-20220909193921592.png)

## Whitespace Analyzer

![image-20220909194125991](https://img.wkq.pub/hexo/image-20220909194125991.png)

* 按照空格切分

## Stop Analyzer

![image-20220909194331627](https://img.wkq.pub/hexo/image-20220909194331627.png)

* 相比 Simple Analyzer
* 多了 stop filter
  * 会把 the ，a ， is 等修饰性词语去除

## Keyword Analyzer

![image-20220909194523756](https://img.wkq.pub/hexo/image-20220909194523756.png)

* 不分词，直接将输入当一个 term 输出

## Pattern Analyzer

![image-20220909194647492](https://img.wkq.pub/hexo/image-20220909194647492.png)

* 通过正则表达式进行分词
* 默认是 \W+，非字符的符号进行分割

## Language Analyzer

* 中文分词器 ： icu_analyzer

### 中文分词的难点

* 中文句子，切分成一个一个词（不是一个字）
* 因为中，单词有自然的空格作为分割
* 一句中文，在不同的上下文，有不同的理解
  * 这个苹果，不大好吃 / 这个苹果，不大，好吃！
  * 他说的确实在理/ 这事确定不下来

### ICU Analyzer

* 需要安装 plugin 
  1. 进入 es 的容器并启动  bash，`docker exec -it es7_01 bash`
  2. 此时已经处于容器内部，es 的安装目录，此处可输入插件安装命令 `bin/elasticsearch-plugin install analysis-icu`，等待插件安装完毕
  3. 输入 exit 退出容器 bash
  4. 如法炮制修改 es7_02
  5. docker-compose restart 
* 提供了 Unicode 的支持，更好的支持亚洲语言

![image-20220909195421587](https://img.wkq.pub/hexo/image-20220909195421587.png)
