---
title: 概述
---

## 代码质量评价

代码质量的评价有很强的主观性，描述代码质量的词汇也有很多，比如可读性、可维护性、灵活性、优雅、简洁等，这些词汇是从不同的维度去评价代码质量的。它们之间互相作用，并不是独立的，比如，代码的可读性好、可扩展性好就意味着代码的可维护性好。代码质量高低是一个综合各种因素得到的结论。我们并不能通过单一的维度去评价一段代码的好坏。

## 代码质量评价标准

最常用到的几个评判代码质量的标准是：可维护性、可读性、可扩展性、灵活性、简洁性、可复用性、可测试时性。其中，可维护性、可读性、可扩展性是最重要的三个评价标准。

## 如何写出高质量的代码

要写出高质量的代码，我们就需要掌握一些更加细化、更加能落地的编程方法论，这就包含面向对象设计思想、设计原则、设计模式、编码规范、重构技巧等。

### 面向对象

主流的编程范式或者是编程风格有三种，它们分别是面向过程、面向对象和函数式编程。面向对象是这其中最主流的，是很多设计原则、设计模式编码实现的基础。

面向对象需要掌握的知识点如下：

* 面向对象的四大特征：封装、抽象、继承、多态
* 面向对象编程与面向过程编程的区别与联系
* 面向对象分析、面向对象设计、面向对象编程
* 接口和抽象类的区别以及各自的应用场景
* 基于接口而非实现编程的设计思想
* 多用组合少用继承的设计思想
* 面向过程的贫血模型和面向对象的充血模型

### 设计原则

设计原则是指导编码设计的一些经验总结

* SOLID 原则 —— SRP 单一职责原则
* SOLID 原则 —— OCP 开闭原则
* SOLID 原则 —— LSP 里氏替换原则
* SOLID 原则 —— ISP 接口隔离原则
* SOLID 原则 —— DIP 依赖倒置原则
* DRY 原则 、KISS 原则 、YAGNI 原则、LOD 法则

### 设计模式

设计模式是针对软件开发中经常遇到的一些设计问题，总结出来的一套解决方案或者设计思路。大部分设计模式解决的都是代码的**可扩展性**问题。

经典的设计模式有 23 种。它们可以分为三大类：创建型、结构型、行为型。

#### 1. 创建型

常用的有：单例模式、工厂模式（工厂方法和抽象工厂）、建造者模式
不常用的有： 原型模式

#### 2. 结构性

常用的有： 代理模式、桥接模式、装饰器模式、适配器模式
不常用的有：门面模式、组合模式、享元模式

#### 3. 行为型

常用的有：观察者模式、模板模式、策略模式、职责链模式、迭代器模式、状态模式。
不常用的有：访问者模式、备忘录模式、命令模式、解释器模式、中介模式

### 编程规范

编程规范主要解决的是代码的可读性问题。编程规范相对于设计原则、设计模式，更加具体、更加注重细节。

### 代码重构

在软件开发中，只要软件在不停地迭代，就没有一劳永逸的设计。随着需求的变化，代码不停堆砌，原有的设计必定会存在这样那样的问题，针对这些问题，我们就需要进行代码重构。

重构是软件开发中非常重要的一个环节。持续重构是保持代码质量不下降的有效手段，能有效避免代码腐化到无可救药的地步。

而重构的工具就是面向对象思想、设计原则、设计思想、编码规范。

设计思想、设计原则、设计模式一个最重要的应用场景就是重构的时候。但过度不恰当地使用，也会z更加代码的复杂度，影响代码的可读性。

对于重构，需要掌握：
* 重构的目的（why）、对象（what）、时机（when）、方法（how）;
* 保证重构不出错的技术手段：单元测试和代码的可测试性;
* 两种不同规模的重构：大重构（大规模高层次）和小重构（小规模低层次）;
## 总结
* 面向对象因为其具有丰富的特性（封装、抽象、继承、多态），可以实现很多复杂的设计思路模式很多设计原则、设计模式等编码实现的基础。
* 设计原则是指导我们代码设计时的一些经验总结，对于某些场景下，是否应该应用某种设计模式，具有指导意义。比如，“开闭原则”是很多设计模式（策略、模板等）的指导原则。
* 设计模式是针对软件开发中经常遇到的一些设计问题，总结出来的一套解决方案或者设计思路。应用设计模式的主要目的是提高代码可扩展性。从抽象程度上来讲，设计原则比设计模式更抽象。设计模式更加具体、更加可执行。
* 编程规范主要解决的是代码的可读性问题。编程规范相对于设计原则、设计模式，更加具体、更加偏重代码细节、更加能落地。持续的小重构依赖的理论基础主要就是编程规范。
* 重构作为保持代码质量不下降的有效手段，利用的就是面向对象、设计原则、设计模式、编程规范这些理论。

面向对象、设计原则、设计模式、编程规范、代码重构都是保持或者提高代码质量的方法论，本质上都是服务于编写高质量代码这一件事的。

看清本质后，那很多事情怎么做、很多选择怎么选就都清楚了。
比如在某个场景下，该不该用这个设计模式，那就看能不能提高代码的可扩展性；要不要重构，那就看重代码是否存在可读、可维护性问题等。

![image-20220922214543097](https://img.wkq.pub/hexo/image-20220922214543097.png)
