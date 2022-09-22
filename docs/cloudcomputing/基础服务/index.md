---
title: 云计算基础服务
description: 计算、存储、网络
---
## 创建云主机

需要选择的选项

* 内存，8G
* 磁盘，40G
* 网络，私有 IP 地址 / 共有 IP 地址
* 操作系统，Linux / Windows
* 账户，ubuntu / ssh
* 地理位置，越近越好
* 防火墙 / 安全组

### OpenStack-CLI

```shell
openstack server create \
    --flavor 60053ce8-bb53-4d8d-873c-2d578b8ad458 \
    --image 85d01bc6-6d48-45ab-8e34-c60a3bc4680b \
    --network 8f04614c-47e4-4e34-b2bf-0d0bceee4fd2 \
    --security-group a2cc4d9f-45e4-4498-80ca-9a99d3c80cc2 \
    --key-name your_keypair \
    test-imooc
```

每一个参数的具体含义可以通过运行 `openstack server create --help` 查看。

### Microsoft Azure-Dashboard

## Region 和 Zone
在云计算，特别是公有云领域，谈到资源的地理位置属性时经常提到的两个名词就是 Region 和 Availability Zone ,翻译成中文就是区域和可用区。
在大部分公有云平台创建资源时，一般都会至少让你指定 Region ，有些资源的创建还要特别指定 Availability Zone。
### 什么是 Region 和 Zone
Region 和 Availability Zone 最早是 AWS 引入的，后续的公有云厂商在建设云平台时也都直接参考了 AWS 的实现，因为毕竟 AWS 是云计算的鼻祖，它在云计算领域的成功对于其它厂商确实有借鉴意义。

Region 和 Availability Zone 是云厂商划分自己所拥有的物理计算资源（数据中心）的一种方法。

每个 Region 完全独立，根据地域划分，比如北美洲、南美洲、大洋洲等，一些面积比较大的州比如亚洲、欧洲可能还会划分出多个 Region。

在一个 Region 内可以包含一个或者多个 Availability Zone，一个 Availability Zone 通常是由一个或多个相近的数据中心组成，Availability Zone 拥有独立的包括电力和网络在内的基础设施，它们之间使用低延时链路相连。

### 为什么会有 Region 和 Zone
使用 Region 的原因其实很简单，就是为了资源在地域上的划分以及为不同地域的用户提供服务的低延时访问。

解决了地域的问题之后，就会进而出现云上业务部署的第二个需求，高可用。这也是 Availability Zone 产生的的主要原因，从字面上也能看出来，Availability Zone 就是可用区。

如果没有 Availability Zone ，业务部署后，一旦出现自然灾害等不可抗力因素，整个 Region 都会不可用。在公有云平台上推荐的业务部署模式都是 Availability Zone,提高业务的容错能力，这样就算是其中一个 Availability Zone 出现故障，也不会影响整体对外的服务能力。

所以 Availability Zone 的主要用途是为了保证云上应用的高可用。

## 特殊的云主机

## 安全组服务
* 安全组其实是一种特性/资源
* 什么是需要安全组
  * 资源抽象，便于管理 
  * 资源隔离，易于维护
* 默认安全组规则，按需定制（流出的流量全部允许，但是进入的需要定制）
### 特点
* 规定网络流入规则和流出规则
* 通常作用于云服务器的网卡
* 白名单
### 安全组规则
* 源地址：可以是 IP 地址，其它安全组等等。
* 目的地址：可以是 IP 地址，其它安全组等等（指定云主机可以访问的资源）
* 协议类型和协议端口
* 行为：Allow / Deny
* 优先级
### 安全组最佳实践
* 生产环境最佳实践
  * 默认拒绝所有访问
  * 遵循最小授权原则
  * 按应用分组


