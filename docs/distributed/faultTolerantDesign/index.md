---
title: 容错性设计
---
**容错性设计**是微服务的另一个核心原则，也是面对分布式环境时开发观念的转变。

## 微服务存在的问题
* 某一个服务的崩溃，会导致所有用到这个服务的其它服务都无法工作，一个点的错误经过层层传递，最终会波及到此调用链上的所有服务，这就是雪崩效应。如何防止雪崩效应，便是微服务架构容错性设计原则的具体实践。
* 服务虽然没有崩溃，但是处理能力有限，面临超预期的突发请求时，大部分请求直至超时都无法完成处理。这种现象产生的后果跟交通堵塞时类似的，如果一开始没有得到及时治理，后面就会需要很长时间才能使全部服务都恢复正常。

分布式系统的本质是不可靠的，一个大的服务集群中，程序可能崩溃、节点可能宕机、网络可能中断。

原本将分布式系统设计成分布式架构的主要动力之一，就是提升系统的可用性，最低限度也要保证将原有系统重构为分布式架构之后，可用性不出现倒退才行。

容错策略，指的是”面对故障，我们该做些什么“；容错设计模式，指的是”要实现某种容错策略，我们应该如何去做“

## 断路器模式
思路：**通过代理（断路器对象）来一对一（一个远程服务对应一个断路器对象）地接管服务调用者的远程请求。**

断路器会持续监控并统计服务返回的成功、失败、超时、拒绝等各种结果，当出现故障（失败、超时、拒绝）的次数达到断路器的阈值时，它的状态就自动变为 `OPEN`。之后这个断路器代理的远程访问都将直接返回调用失败，而不会发出真正的远程服务请求。

通过断路器对远程服务进行熔断，就可以避免因为持续的失败或拒绝而消耗资源，因为持续的超时而堆积请求，最终可以避免雪崩效应的产生。断路器本质上是对快速失败策略的一种实现方式。

断路器一般可以设置为 CLOSED、OPEN、和 HALF  OPEN 三种状态

* HALF OPEN : 是一种中间状态。断路器必须带有自动的故障恢复能力，当进入 OPEN 状态一段时间后，就会尝试恢复（由一次请求触发,会根据这次请求的成功与否决定断路器的状态），

![e4c2b4c666f72b97af3698b2bbbafc3f](https://img.wkq.pub/hexo/e4c2b4c666f72b97af3698b2bbbafc3f.webp)

降级是可以是熔断后的补救措施，也可以是限流主动迫使服务进入降级逻辑。



## 舱壁隔离模式

![6177aaa5217baa7e4b902c41d377a652 (1)](https://img.wkq.pub/hexo/6177aaa5217baa7e4b902c41d377a652%20(1).webp)![973a130a88c814bc405031e48930b5a4](https://img.wkq.pub/hexo/973a130a88c814bc405031e48930b5a4.webp)