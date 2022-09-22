---
title: 日志系统
description: 一条 SQL 更新语句是如何执行的？
---

## 前言

创建一张表 T，这张表有一个主键 ID 和一个整型字段 c。

```mysql
mysql> create table T(ID int primary key,c int);
mysql> insert into T (ID,c) values (1,1),(2,2),(3,3),(4,4);
```

如果要将 ID = 2 这一行的值加 1 ，SQL 就会这么写：

```mysql
mysql> update T set c=c+1 where ID=2;
```

首先，查询语句的那一套流程（连接器、分析器、优化器、执行器、存储引擎），更新语句也是同样会走一遍。

![MySQL的逻辑架构图](https://img.wkq.pub/hexo/0d2070e8f84c4801adbfa03bda1f98d9.webp)

执行语句前要先连接数据库。接下来，分析器会通过词法和分析知道这是一条更新语句。优化器决定要使用 ID
这个索引。然后，执行器负责具体执行，找到这一行，然后更新。

与查询流程不同的是，更新流程还涉及两个重要的日志模块，redo log（重做日志）和binlog（归档日志）。

## 日志模块：redo log

如果每一次的更新操作都需要写进磁盘，然后磁盘也要找到对应的那条记录，然后进行更新，整个过程的 IO 成本、查找成本都很高。

WAL （Write-Ahead-Logging）技术的目的之一就是解决这个问题，它的关键点就是先写日志（redo），再写磁盘。先写日志也是写入磁盘，但先写日志是顺序IO，速度很快。

具体来说，当有一条记录需要更新的时候， InnoDB 引擎就会先把记录写到 redo log 里面，并更新内存，这个时候的更新就算完成了。同时，InnoDB
引擎会在适当的时候，将这个操作记录更新到磁盘里面（比如系统比较空闲或事务提交时）。

InnoDB 的 redo log 是固定大小的，用类似循环队列的方式实现，write pos 是记录当前位置，一边写一边后移，checkpoint
是当前要擦除的位置，也是往后推移并且循环的，擦除记录前要先把记录更新到数据文件。

如果 write pos 追上 checkpoint ，这时候不能再执行新的操作，得停下来先擦掉一些记录，把 checkpoint 推进一下。

有了 redo log ，InnoDB 就可以保证即使数据库发生异常重启，之前提交的记录都不会丢失，这个能力称为 **crash-safe**

![16a7950217b3f0f4ed02db5db59562a7](https://img.wkq.pub/hexo/16a7950217b3f0f4ed02db5db59562a7.webp)

## 日志模块：binlog

MySQL 从整体来看，其实就两块：一块是 Server 层，它主要做的是 MySQL 功能层面的事情；还有一块是存储引擎层，负责存储相关的具体事宜。

redo log 是 InnoDB 引擎特有的日志，而 Server 层也有自己的日志，称为 binlog （归档日志）

为什么会有两份日志呢？

因为最开始 MySQL 里并没有 InnoDB 引擎。MySQL 自带的引擎是 MyISAM ，但是 MyISAM 没有 crash-safe 的能力，binlog
日志只能用于归档。而InnoDB 是另一个公司以插件形式引入 MySQL 的，既然只依靠 binlog 是没有 crash-safe 能力的，所以 InnoDB
使用另一套日志系统 — 也就是 redo log 来实现 crash-safe 能力。

这两种日志有以下三点不同：

1. redo log 是 InnoDB 引擎特有的；binlog 是 MySQL 的 Server 层实现的，所有的引擎都可以使用。
2. redo log 是物理日志，记录的是“在某个数据页上做了什么修改”；binlog 是逻辑日志，记录的是这个语句的原始逻辑，比如“给 ID = 2
   这一行的 c 字段加 1”.
3. redo log 是循环写的，空间固定会用完；binlog 是追加写的。“追加写”指的是 binlog 文件写到一定大小后会切换到下一个，并不会覆盖以前的日志。

执行器和 InnoDB 引擎在执行上述简单 update 语句时的内部流程如下：

1. 执行器先找引擎取 ID = 2 这一行。ID 是主键，引擎直接用树搜索直接找到这一行。如果 ID = 2
   这一行的数据页本来就是在内存中，就直接返回给执行器；否则，需要先从磁盘读入内存，然后再返回。
2. 执行器拿到引擎给的行数据，把这个值加上 1 ，得到新的一行数据，再调用引擎接口写入这行新数据。
3. 引擎将这行新数据更新到内存中，同时将这个更新操作记录到 redo log 里面，此时redo log 处于 prepare
   状态，然后告知执行器执行完成了，随时可以提交事务。
4. 执行器生成这个操作得 binlog ，并把 binlog 写入磁盘。
5. 执行器调用引擎的提交事务接口，把各个写入的 redo log 改成提交（commit）状态，更新完成。

下图是这个 update 语句的执行流程图，浅色框表示的是在 InnoDB 内部执行的，深色框表示是在执行器中执行的。

![2e5bff4910ec189fe1ee6e2ecc7b4bbe](https://img.wkq.pub/hexo/2e5bff4910ec189fe1ee6e2ecc7b4bbe.webp)

redo log 的写入拆成了两个步骤： prepare 和 commit ，这就是两阶段提交。 redo log 和 binlog
都可以用于表示事务的提交状态，两阶段提交就是让这两个状态保持逻辑上的一致，
两阶段提交也是跨系统维护数据逻辑一致性时常用的一个方案。

redo log 用于保证 crash-safe 能力，innodb_flush_log_at_trx_commit 这个参数设置成 1 的时候，保证每次事务的 redo log
都直接持久化到磁盘。这个参数可以保证 MySQL 异常重启之后数据不丢失。

sync_binlog 这个参数设置成 1 的时候，表示每次事务的 binlog 都持久化到磁盘，这个参数可以保证 MySQL 异常重启后 binlog 不丢失。

:::tip
1. redo log 只有 InnoDB 引擎有，别的引擎没有
2. redo log 是循环写的，不吃就保存，不具备 bin log 的归档功能。备份恢复时，是以 bin log 为基础的。
:::

