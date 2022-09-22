---
title: SpringCloud
---

## 概述

SpringCloud 是由 Spring 开源社区主导孵化的，专门为了解决微服务架构难题而诞生的“微服务全家桶”框架。SpringCloud
除了开源社区的研发力量以外，它还吸纳了很多业界一线互联网大厂的开源组件为已用，经这些经过大厂真实业务锤炼的组件孵化成了
SpringCloud 组件的一部分。

![50dc50b943a1d68e1b9682f573e51736](https://img.wkq.pub/hexo/50dc50b943a1d68e1b9682f573e51736.webp)

上图是 Spring 社区发布的 SpringCloud 图，Spring Boot Apps 是经过拆分后的微服务。Spring Cloud 和 Spring Boot 达成了一种默契的配合：Spring Boot 主内，通过自动装配和各种开箱即用的特性，搞定了数据层访问、RESTful 接口、日志组件、内置容器等等基础功能，让开发人员轻易就可以搭建起一个应用；SpringCloud 主外，在应用集群之外提供各种分布式系统的支持特性，轻松实现负载均衡、熔断降级、配置管理等诸多功能。



SpringBoot 做好每一个服务，才能让 Spring Cloud 轻松解决微服务的各种难题。两者合二为一完整构建了微服务领域的全家桶解决方案。



## Spring Cloud 组件库

Netflix 是一家美国的流媒体巨头，它靠着自己强大的技术实力，开发沉淀了一系列优秀的组件，这些组件经历了 Netflix 线上庞大业务规模的考验，功能特性和稳定性过硬。如 Eureka 服务注册中心、Ribbon 负载均衡器、Hystrix 容错组件等。随着 Netflix 的停更，Spring 社区在后续的版本中逐渐去除了 Netflix 。



Spring Cloud ALibaba 是由 Alibaba 贡献的组件库，目前已经取代了 Netflix 的江湖地位。

| 功能特性       | Alibaba 组件库         | Netflix 组件库                   | SpringCloud官方或第三方组件库 |
| -------------- | ---------------------- | -------------------------------- | ----------------------------- |
| 服务治理       | **Nacos**              | Eureka                           | Consul                        |
| 负载均衡       |                        | Ribbon                           | **Loadbalancer**              |
| 服务间调用     | Dubbo(RPC调用)         | Netflix Feign(open Feign 的前身) | **Openfeign**（RESTful调用）  |
| 服务容错       | **Sentinel**           | Hystrix、Hystrix Dashboard       |                               |
| 分布式配置中心 | **Nacos**              |                                  | Spring Cloud Config           |
| 消息总线       |                        |                                  | Bus                           |
| 服务网关       |                        | Zuul                             | **Spring Cloud Gateway**      |
| 分布式链路追踪 |                        |                                  | **Sleuth**、Zipkin            |
| 消息事件驱动   | RocketMQ（消息中间件） |                                  | **Stream**                    |
| 分布式事务     | **Seata**              |                                  |                               |

* [阿里巴巴开源文档社区](https://github.com/alibaba/spring-cloud-alibaba)

* [Spring官方文档]([Spring Cloud Alibaba](https://spring.io/projects/spring-cloud-alibaba))

:::tip
Spring Cloud 主流搭配
1. 使用 Nacos 、LoadBalancer 和 OpenFeign 实现了跨服务的调用；
2. 使用 Sentinel、Nacos Config 和 Sleuth 实现了服务容错、配置管理、分布式链路追踪
3. 使用 Gateway、Stream 和 Seata 实现了微服务网关、消息事件驱动和分布式事务。
:::
