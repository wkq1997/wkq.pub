---
title: RPC
description: 远程服务调用
---

:::tip 本文重点

RPC本身可以解决什么问题（远程方法调用）、如何解决这些问题（表示数据、传递数据和表示方法）、为什么要这样解决？

:::

:::info RPC 定义


RPC 是一种语言级别的通讯协议，它允许运行于一台计算机上的程序以某种管道作为通讯媒介（即某种传输协议的网络），去调用另外一个地址空间（通常为网络上的另外一台计算机）。

:::

:::note

RPC 出现的最初目的，就是为了让计算机能够跟调用本地方法一样，去调用远程方法。但因为本地方法调用和远程方法调用的差异性，后续的 RPC 厂商已经不再追求这个目标了，RPC 成为了一个更高层次的，或者说是语言层次的特征，IPC是低层次的，系统层次的特征。


RPC 以模拟进程间方法调用为起点，许多思想和概念都借鉴的是 IPC。但是，RPC 原本是想照着 IPC 的发展思路，却在实现层面上遇到了很大的困难。RPC作为一种跨网络的通讯手段，能否无视通讯的成本去迁就编程和设计的原则，这一点从几十年前的 DCE 开始，直到今天学术界，工业界都还有争议。


:::

## RPC 框架要解决的问题

从 PRC 诞生开始，一直到现在，所有流行过的 RPC 协议，都不外乎通过各种手段来解决三个基本问题。<br/>
1. 如何表示数据？
2. 如何传递数据？
3. 如何表示方法？

:::tip

如何表示数据、如何传递数据、如何表示方法这三个 RPC 中的基本问题，都可以在本地调用中找到对应的操作。PRC 的思想源自于本地方法调用,尽管它早就不再追求跟本地方法调用的实现完全一样了，但RPC 的发展仍然带有本地方法调用的深刻烙印。

:::

### 如何表示数据？
这里的数据包含了传递给方法的参数，以及方法的返回值。无论是将参数传递给另一个进程，还是从另一个进程中取回执行结果，都会涉及**应该如何表示**的问题。

针对进程内的方法调用，使用程序语言内置的和程序员自定义的数据类型，就很容易解决数据表示的问题了；而远程方法调用，则可能面临交互双方分属不同程序语言的情况。

所以，即使是支持同一种语言的 RPC 协议，在不同硬件指令集、不同操作系统下，也可能有不一样的表现细节，比如数据宽度，字符序列的差异等。

行之有效的做法，是**将交互双方涉及的数据，转换为某种事先约定好的中立的数据格式来传输，将数据流转换回不同语言中对应的数据类型来使用。**这其实就是序列化和反序列化。

每种 RPC 协议都应该有对应的序列化协议，比如：
* Java RMI 的 Java Object Serialization Stream Protocol。
* gRPC 的 Protocol Buffers。
* Web Service 的 XML Serialization。
* 众多轻量级 RPC 支持的 JSON Serialization。
* ……

### 如何传递数据？

这里的如何传递数据是指如何通过网络，在两个服务 Endpoint 之间互相操作、交换数据。这里 “传递数据” 通常指的是应用层协议，实际传输一般是基于标准的 TCP 、UDP 等传输层协议来完成的。

两个协议交互数据不是简单的扔个数据流来表示参数和结果就可以了，诸如异常、超时、安全、认证、授权、事务等信息，都可能存在双方交换信息的需求。

在计算机科学中，专门有一个名词 Wire Protocol，用来表示两个 Endpoint 之间交换这类数据的行为。常见的 Wire Protocol有以下几种：
* Java RMI 的 Java Remote Message Protocol （JRMP）。
* Web Service 的 Simple Object Access Protocol （SOAP）。
* 如果要求足够简单，双方都是 HTTP Endpoint ，直接使用 HTTP 也是可以的，比如 JSON-RPC。
* ……

### 如何表示方法？
“如何表示方法” ， 这个问题在本地方法调用中其实也不是问题，因为编译器或者解释器会根据语言规范，把调用的方法转换为进程地址空间中方法入口位置的指针。

一旦考虑到不同语言，就变的不简单了，因为每门语言的方法签名都可能有所差别，所以，针对“如何表示一个方法” 和 “如何找到这些方法”这两个问题，还是需要有一个统一的标准：

DCE/PRC 最初准备的解决方案就是给程序中的每个方法，都规定一个通用的又绝对不会重复的编号；在调用的时候，直接传这个编号就可以找到对应的方法。

虽然后续这个方案不再使用， 但那个唯一的“绝不重复”的编码方案 UUID，被广泛的应用到了程序开发的方方面面。

类似的表示方法的协议还有：

* Web Service 的 Web Service Description Language （WSDL）
* JSON-RPC 的 JSON Web Service Protocol （JSON-WSP）
* ……

## RPC 的发展

表示数据、传递数据和表示方法，是 RPC 必须解决的三大基础问题。要解决这些问题，可以有很多方案，这也是出现如此多的 RPC 协议/框架的一个原因。

导致 RPC 框架众多的另一个原因则是：简单的框架很难达到功能强大的要求。

功能强大的框架往往要在传输中加入额外的负载和控制措施，导致传输性能降低，而如果既想要高性能、又想要强功能，这就必然要依赖大量的技巧去实现，进而也就导致了框架变得复杂，这就决定了不可能有一个“完美”的框架同时满足简单、普适和高性能三个要求。

一个 RPC 框架要想取得成功，就要选择一个发展方向，能够非常好的满足某一方面的需求。因此，有了朝着面向对象发展（RMI）、朝着性能发展（gRPC，决定PRC 性能的主要有序列化效率和信息密度两个因素）和朝着简化发展这三条线路。

到了近几年，RPC 框架有明显朝着更高层次（不仅仅负责调用远程服务，还管理远程服务）与插件化方向发展的趋势，**不再选择自己去解决表示数据、传递数据和表示方法这三个问题，而是将全部或者一部分问题设计为扩展点，实现核心能力的可配置**，再辅以外围功能，如负载均衡、服务注册、可观察性等方面的支持。这一类框架的代表就是 Dubbo。

Dubbo 默认有自己的传输协议(Dubbo 协议)，同时也支持其它协议，它默认采用 Hessian 2 作为序列化器，如果有 JSON 的需求，可以替换为 Fastjson；如果对性能有更高的需求，可以替换为 kryo、FST、Protocol Buffers等。如果不想依赖其他包，直接使用 JDK 自带的序列化器也可以。这种设计，就在一定程度上缓解了 RPC 框架必须取舍，难以完美的缺憾。
