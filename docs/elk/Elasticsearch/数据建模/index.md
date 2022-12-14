---
title: 数据建模
---
## 文档的父子关系

### Parent / Child

* 对象和 Nested 对象的局限性
  * 每次更新，需要重新索引整个对象（包括根对象和嵌套对象）
* ES 提供了类似关系型数据库中 join 的实现。使用 Join 数据类型实现，可以通过维护 Parent /Child 的关系，从而分离两个对象。
  * 父文档和子文档是两个独立的文档
  * 更新父文档无需重新索引子文档。子文档被添加，更新或删除也不会影响到父文档和其它的子文档。

### 定义父子关系的几个步骤

1. 设置索引的 Mapping
2. 索引父文档
3. 索引子文档
4. 按需查询文档

#### 设置 Mapping

## 数据建模

### 什么是数据建模？

* 数据建模（Data Modeling） ，是创建数据模型的过程
  * 数据模型是对真实世界进行抽象描述的一种工具和方法，实现对现实世界的映射。
    * 博客 / 作者 / 用户评论
  * 三个过程：概念 => 逻辑模型 => 数据模型（第三范式）
    * 数据模型：结合具体的数据库，在满足业务读写性能等需求的前提下，确定最终的定义。

数据建模： 功能需求+性能需求

![image-20220913215432718](https://img.wkq.pub/hexo/image-20220913215432718.png)

### 如何对字段进行建模

![image-20220913215454749](https://img.wkq.pub/hexo/image-20220913215454749.png)

#### 字段类型：Text vs Keyword

* Text
  * 用于全文本字段，文本会被 Analyzer 分词
  * 默认不支持聚合分析及排序。需要设置 fielddata 为 true
* Keyword 
  * 用于 id，枚举及不需要分词的文本。例如电话号码，email地址，手机号码，邮政编码，性别等
  * 适用于 Filter（精确匹配），Sorting 和 Aggregations
* 设置多字段类型
  * 默认会为文本类型设置为 text ，并且设置一个 keyword 字段
  * 在处理人类语言时，通过增加”英文“，”拼音“和”标准“分词器，提高搜索结构

#### 字段类型：结构化数据

* 数值类型
  * 尽量选择贴近的类型。例如可以用 byte，就不要用 long
* 枚举类型
  * 设置为 keyword。即使是数字，也应该设置成 keyword，获取更好的性能。
* 其它
  * 日期 / 布尔 /地理信息

#### 检索

* 如不需要检索，排序和聚合分析
  * Enable 设置成 false
* 如不需要检索
  * Index 设置成 false
* 对需要检索的字段，可以通过如下配置，设定存储粒度
  * Index_options / Norms ：不需要归一化数据时，可以关闭

#### 聚合及排序

* 如不需要检索，排序和聚合分析
  * Enable 设置为 false
