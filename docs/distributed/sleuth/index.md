---
title: 服务调用链追踪-Sleuth
---
## 目录
* 服务调用链追踪是干什么的
* Sleuth 核心功能和体系结构
    * 调用链路数据模型 - Trace 、Span、Annotation
* 链路追踪原理介绍+源码解读
* Zipkin
    * 搭建 Zipkin 服务端
    * Sleuth 集成 Zipkin
* Sleuth 集成 ELk 实现日志搜索
* 阿里系列分布式追踪技术 - 鹰眼系统

## 链路追踪在微服务中的应用

微服务之间的调用关系图一

![大型项目中的微服务调用关系](https://img.wkq.pub/hexo/image-20220908224750411.png)

* 分布式环境下的链路追踪
* Timing 信息
* 定位链路
* 信息的收集和展示

## Sleuth 核心功能和体系架构

Sleuth最核心的功能就是提供**链路追踪**，在一个用户请求发起到结束的整个过程中，这个Request 经过的所有服务都会被 Sleuth 梳理出来。

![5e13fe3d095b3b5e27581532](https://img.wkq.pub/hexo/5e13fe3d095b3b5e27581532.png)

比如上面的例子，用户请求访问了服务 A ，接着服务 A 用在内部先后调用了服务 D，C 和 F，在这里 Sleuth 的工作就是通过一种 ”打标“的机制，将这个链路上的所有被访问到的服务打上一个相同的标记，这样我们只要拿到这个标记，旧很容易可以追溯到链路上下游所有的调用。



借助 Sleuth 的链路追踪能力，我们还可以完成一些其它的任务，比如说：

1. 线上故障定位：结合 Tracking Id 寻找上下游链路中所有的日志信息，（这一步还需要借助一些其它开源组件）
2. 依赖分析梳理：梳理上下游依赖关系，理清整个系统中所有微服务之间的依赖关系
3. 链路优化：比如目前有三种途径可以导流到下单接口，通过对链路调用情况的统计分析，我们可以识别出转化率最高的业务场景，从而为以后的产品设计提供指导意见。
4. 性能分析：梳理各个环节的时间消耗，找到性能瓶颈，为性能优化、软硬件资源调配指明方向。

### 设计原则

* 无业务侵入：不需要对业务代码做任何改动，即可静默接入链路追踪功能。
* 高性能：可以设置采样率，进一步降低开销。

### Sleuth架构体系

Sleuth采用集成底层 Log 系统的方式实现业务埋点，下面是它的结构：

![5e13fe4a0933db6c28121464](https://img.wkq.pub/hexo/5e13fe4a0933db6c28121464.png)

#### 那些数据需要埋点

每一个微服务都有自己的 Log 组件（slf4j，logback等各不相同），当我们集成 Sleuth 之后，它便会将链路信息传递给底层 Log 组件，同时 Log 组件会在每行 Log 的头部输出这些数据，这个埋点动作主要会记录两个关键信息：

* **链路 ID** 当前调用链的唯一 ID，在这次调用请求开始到结束的过程中，所有经过的节点都拥有一个相同的链路 ID
* **单元 ID** 在一次链路调用中会访问不同服务器节点上的服务，每一次服务调用都相当于一个独立单元，也就是说会有一个独立单元 ID。同时每一个独立单元都要知道调用请求来自哪里（就是对当前服务发起直接调用的哪一方的单元ID，记为 Parent Id）

比如这里服务 A 是起始服务，所以它的 EventID（单元Id）和 Trace ID（链路 ID）相同，而服务 B 的前置节点就是 A 节点，所以 B 的Parent Event 就是指向 A 的 Event ID。而 C 在 B 的下游，所以 C 的 Parent Id 就指向 B。A、B 和 C 三个服务都有同一个链路 ID ，但是各自有不同的单元 ID 。

#### 数据埋点之前要解决的问题          

* **Log系统集成 ** 如何让埋点信息加入到业务 Log 中
* **埋点信息的传递** SpringCloud 中的调用都是通过 HTTP 请求来传递的。

#### Log 系统集成

我们需要把链路追踪信息加入到业务 Log 中，这些业务 Log 是写在具体服务里的，而不是 Sleuth 单独打印的 log ，因此 Sleuth 需要找到一个合适的切入点，让底层的 Log 组件可以获取链路信息，并且业务代码还不需要做任何改动。

![5e13fe560945406628781494](https://img.wkq.pub/hexo/5e13fe560945406628781494.png)

当我们使用”log.info“打印日志的时候，Log 组件会将”写入”动作封装成一个 LogEvent 事件，而这个事件的具体表现形式由 Log Format 和 MDC 共同控制，Format 决定了Log的输出格式，而MDC 决定了输出什么内容。

#### Log Format Pattern

Log 组件定义了日志输出格式，这和我们平时使用 “String.format" 的方式差不多，集成 Sleuth 之后的Log 输出格式是下面这个样子的。

```tex
"%5p [sleuth-traceA,%X{X-B3-TraceId:-},%X{X-B3-SpanId:-},%X{X-Span-Export:-}]"
```

上面几个 X 开头的占位符，就是需要写入 log 的链路追踪信息了。至于这几个符号分别对应链路信息的那部分。

#### MDC

MDC是通过 Inheritable ThreadLocal 来实现的，可以携带当前线程的上下文信息。它的底层是一个 Map 结构，存储了一系列 Key-Value 的值。Sleuth 就是借助 Spring 的 AOP 机制，在方法调用的时候配置了切面，将链路追踪数据加入到了 MDC 中，这样在打印 Log 的时候，就能从 MDC 中获取这些值，填入到 Log Format 中的占位符里面。

由于  MDC 基于 Inheritable ThreadLocal 而不是 ThreadLocal 实现，因此假如在当前线程中又开启了新的子线程，那么子线程依然会保留父线程的上下文信息。

## 调用链路数据模型 

Trace，Span，Annotatio

* 链路追踪后面的数据结构
* Sleuth 是如何在不同服务节点之间传递数据的。

### Sleuth数据结构

* **Trace** ：它就是从头到尾贯穿整个调用链的 ID ，叫做 Trace ID，不管调用链路中途访问了多少服务节点，在每个节点的 log 中都会打印同一个 Trace ID
* **Span**：它标识了 Sleuth 下面一个基本的工作单元，每个单元都有一个独一无二的 ID。比如 服务 A 发起对 服务 B 的调用，这个事件就可以看作一个独立单元，生成一个独立 ID。

Span 不仅仅是一个 ID ，还包含一些其它的信息，比如时间戳，它标识了这个 Span 在执行过程中发起的一些特殊事件。

#### Annotation标记

一个 Span 可以包含多个 Annotation ，每个 Annotation 表示一个特殊事件，比如：

* cs Client Sent，客户端发送了一个调用请求。
* sr Server Received，服务端收到了来自客户端的调用
* ss Server Sent，服务端将 Response 发送给客户端
* cr Client  Received：客户端收到了服务端发来的 Response

每个 Annotation 同样有一个时间戳字段，这样我们就能分析一个 Span 内部每个事件的起始和结束事件。

![5e13fec609dfb60018761582](https://img.wkq.pub/hexo/5e13fec609dfb60018761582.png)

上面的图中调用了两个接口 Server 1 和 Service 2 ，整个调用过程的所有 Span 都有相同的 Trace ID，但每一个 Span 都有独立的 Span ID。其中 Service 1 对 Service 2 的调用分为两个 Span ，蓝色 Span 的时间跨度从调用发起直到调用结束，分别记录了 4 个特殊事件（对应客户端和服务端对Request 和 Response 的传输）。绿色 Span 主要针对 Service 2 内部业务的处理，因此我们在 Service2 中打印的日志会带上绿色 Span 的 ID。

#### 服务节点间的 ID 传递

Sleuth 通过 Filter 向 Header 中添加追踪信息。

| HTTP Header Name  | Trace Data                          |                 |
| ----------------- | ----------------------------------- | --------------- |
| X-B3-TraceId      | Trace ID                            | 链路全局唯一ID  |
| X-B3-SpanId       | Span ID                             | 当前 Span 的 ID |
| X-B3-ParentSpanId | Parent Span ID                      | 前一个Span 的ID |
| X-Span-Export     | Can be exported for sampling or not | 是否可以被采样  |

在调用下一个服务的时候，Sleuth 会在当前的 Request Header 中写入上面的信息，这样下游系统就很容易识别出当前 Trace ID以及它的前置 Span ID 是什么。

## 整合 Sleuth 追踪调用链路

* 创建 sleuth-traceA 和 sleuth-traceB，添加 Sleuth 依赖
* 调用请求链路，查看 log 中的信息
* 采样率设置

