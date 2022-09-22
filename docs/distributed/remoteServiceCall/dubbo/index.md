---
title: dubbo
---

## dubbo 注册中心

dubbo对注册中心的选择是比较灵活的，可以有以下的五种注册中心可供选择。
1. Multicast
2. Zookeeper
3. Nacos
4. Redis
5. Simple(本身就是一个 dubbo 服务)


**dubbo在zookeeper中的存储结构**

![基于Zookeeper的服务注册](https://img.wkq.pub/hexo/dubbo在zookeeper中的存储结构.png)

## 构建服务提供方
:::tip 小提示！

下面实战要做的事：创建一个服务提供者、创建一个服务调用者，服务调用者通过网络远程调用服务提供者提供的方法，体验dubbo rpc。

:::
1. 启动 zookeeper 作为注册中心，我这里使用的地址为 `60.205.142.63:2181`
2. 创建一个 maven 项目，我这里命名为`dubbo-demo`，修改打包方式为pom，作为父工程。
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
	
    <groupId>com.wkq</groupId>
    <artifactId>dubboDemo</artifactId>
    <packaging>pom</packaging>
    <version>1.0-SNAPSHOT</version>
    <modules>
        <module>dubbo-api</module>
        <module>dubbo-provider</module>
        <module>dubbo-consumer</module>
    </modules>
    <parent>
        <artifactId>spring-boot-starter-parent</artifactId>
        <groupId>org.springframework.boot</groupId>
        <version>2.7.3</version>
    </parent>
    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.24</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
	```
3. 创建 dubbo 服务公用的 api 和对象，我这里将其命名为 dubbo-api，添加两个类，com.wkq.springcloud.User、com.wkq.springcloud.IDubboService。
   ```java
   package com.wkq.springcloud;
   
   import lombok.AllArgsConstructor;
   import lombok.Data;
   import lombok.NoArgsConstructor;
   
   import java.io.Serializable;
   @Data
   @AllArgsConstructor
   @NoArgsConstructor
   public class User implements Serializable {
       private String name;
       private Integer price;
   }
   ```

4. 做完上述准备工作之后，开始编写服务提供者，我这里将其命名为 dubbo-provider。dubbo-provider 作为 dubboDemo 的一个子模块。
   步骤一： 在 pom.xml 中引入 dubbo 依赖
   ```java
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
   <parent>
       <artifactId>dubboDemo</artifactId>
       <groupId>com.wkq</groupId>
       <version>1.0-SNAPSHOT</version>
   </parent>
   <modelVersion>4.0.0</modelVersion>
   
   <artifactId>dubbo-provider</artifactId>
   
   <properties>
       <maven.compiler.source>8</maven.compiler.source>
       <maven.compiler.target>8</maven.compiler.target>
       <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
   </properties>
   <dependencies>
       <dependency>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-web</artifactId>
       </dependency>
       <dependency>
           <groupId>com.wkq</groupId>
           <artifactId>dubbo-api</artifactId>
           <version>1.0-SNAPSHOT</version>
       </dependency>
       <dependency>
           <groupId>org.apache.dubbo</groupId>
           <artifactId>dubbo</artifactId>
           <version>3.0.7</version>
       </dependency>
       <dependency>
           <groupId>org.apache.dubbo</groupId>
           <artifactId>dubbo-registry-zookeeper</artifactId>
           <version>3.0.7</version>
       </dependency>
       <dependency>
           <groupId>org.apache.dubbo</groupId>
           <artifactId>dubbo-spring-boot-starter</artifactId>
           <version>3.0.7</version>
       </dependency>
   </dependencies>
   
   </project>
   ```
   步骤二：编写启动入口类，并开启 dubbo 支持
   ```java
   package com.wkq.springcloud;
   
   import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
   import org.springframework.boot.SpringApplication;
   import org.springframework.boot.autoconfigure.SpringBootApplication;
   
   @SpringBootApplication
   @EnableDubbo
   public class ProviderApplication {
       public static void main(String[] args) {
           SpringApplication.run(ProviderApplication.class, args);
       }
   }
   ```
   步骤三：编写 application.yaml 配置文件
   ```yaml
   dubbo:
     application:
       name: dubbo-provider
     registry:
       address: zookeeper://60.205.142.63:2181
       protocol: zookeeper
       check: false
     metadata-report: # 元数据中心
       address: zookeeper://60.205.142.63:2181
     protocol:
       name: dubbo
       port: 20881
     monitor: # 监控中心
       protocol: register
   server:
     port: 63001
   ```
5. 至此，已经开启并配置了 dubbo，现在开始编写测试代码，创建 IDubbo 的服务实现者 com.wkq.springcloud.DubboServiceImpl
   ```java
   package com.wkq.springcloud.service;
   
   import com.wkq.springcloud.IDubboService;
   import com.wkq.springcloud.User;
   import lombok.extern.slf4j.Slf4j;
   import org.apache.dubbo.config.annotation.DubboService;
   @Slf4j
   @DubboService
   public class DubboServiceImpl implements IDubboService {
       @Override
       public User publish(User user) {
           log.info("publish User {}",user.getName());
           user.setPrice(12);
           return user;
       }
   
   }
   ```
   至此，服务提供者编写完毕，启动 com.wkq.springcloud.ProviderApplication 运行服务器提供者。
## 构建服务调用方

服务调用方的创建就比较简单了，也分为三步，这里将服务消费者命名为 dubbo-consumer 。
1. 创建 dubbo 工程 dubbo-consumer。并引入依赖。
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
   <parent>
       <artifactId>dubboDemo</artifactId>
       <groupId>com.wkq</groupId>
       <version>1.0-SNAPSHOT</version>
   </parent>
   <modelVersion>4.0.0</modelVersion>
   
   <artifactId>dubbo-consumer</artifactId>
   
   <properties>
       <maven.compiler.source>8</maven.compiler.source>
       <maven.compiler.target>8</maven.compiler.target>
       <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
   </properties>
   <dependencies>
       <dependency>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-starter-web</artifactId>
       </dependency>
       <dependency>
           <groupId>com.wkq</groupId>
           <artifactId>dubbo-api</artifactId>
           <version>1.0-SNAPSHOT</version>
       </dependency>
       <dependency>
           <groupId>org.apache.dubbo</groupId>
           <artifactId>dubbo</artifactId>
           <version>3.0.7</version>
       </dependency>
       <dependency>
           <groupId>org.apache.dubbo</groupId>
           <artifactId>dubbo-registry-zookeeper</artifactId>
           <version>3.0.7</version>
       </dependency>
       <dependency>
           <groupId>org.apache.dubbo</groupId>
           <artifactId>dubbo-spring-boot-starter</artifactId>
           <version>3.0.7</version>
       </dependency>
   </dependencies>
   </project>
   ```
2. 编写启动入口类并开启对 dubbo 的支持。
   ```java
   package com.wkq.springcloud;
   
   import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
   import org.springframework.boot.SpringApplication;
   import org.springframework.boot.autoconfigure.SpringBootApplication;
   
   @SpringBootApplication
   @EnableDubbo
   public class ConsumerApplication {
       public static void main(String[] args) {
           SpringApplication.run(ConsumerApplication.class, args);
       }
   }
   ```
3. 在 application.yaml 中对 dubbo 进行配置
   ```yaml
       dubbo:
     application:
       name: dubbo-consumer
     registry:
       address: zookeeper://60.205.142.63:2181
       protocol: zookeeper
       check: false
     metadata-report: # 元数据中心
       address: zookeeper://60.205.142.63:2181
     protocol:
       name: dubbo
       port: 20882
     monitor: # 监控中心
       protocol: register
   server:
     port: 63002
   ```
4. 至此，dubbo服务调用方已经做好基本配置，开始编写测试代码，创建类 com.wkq.springcloud.Controller。
   ```java
   package com.wkq.springcloud.controller;
   
   import com.wkq.springcloud.IDubboService;
   import com.wkq.springcloud.User;
   import org.apache.dubbo.config.annotation.DubboReference;
   import org.springframework.web.bind.annotation.PostMapping;
   import org.springframework.web.bind.annotation.RequestParam;
   import org.springframework.web.bind.annotation.RestController;
   
   @RestController
   public class Controller {
       @DubboReference(loadbalance = "roundrobin")
       private IDubboService dubboService;
   
       @GetMapping("/publish")
       public User publish(@RequestParam String name) {
           User user = new User();
           user.setName(name);
           return dubboService.publish(user);
       }
   }
   ```
5. 至此，服务调用方和服务提供方均已编写好，打开浏览器在地址栏输入 `http://localhost:63002/publish?name=test`进行访问测试。可以得到结果如下：
   ```json
   {"name":"test","age":12}
   ```
   打开服务提供者控制台，可以看到对应日志打印，上述现象说明 服务调用者 通过 rpc 的方式调用 服务提供者成功。
## 基于 Dubbo-Admin的服务治理
:::tip

Dubbo-Admin 是帮助我们管理dubbo服务的UI界面,由两个工程组成，前端工程是 Vue.js + Vuetify 实现，后端工程是一个标准的 Spring-boot 工程。

:::

### 实践步骤
1. 下载 Dubbo-Admin，https://github.com/apache/dubbo-admin。
2. 安装前端工程,npm install。
3. 修改zookeeper冲突端口。
4. 元数据配置。
5. 启动dubbo-admin的前后端应用。
## Dubbo 中的负载均衡
Dubbo 使用的是自己的负载均衡方案，但其实理论上还是客户端负载均衡，将访问请求用某种方式尽量“平均”的分发到服务节点上，避免部分服务器因负载过高而挂掉。

| 负载均衡策略              | 底层算法                   |
| ------------------------- | -------------------------- |
| RandomLoadBalance         | 基于权重算法的负载均衡策略 |
| LeastActiveLoadBalance    | 基于最少活跃调用数算法     |
| ConsistentHashLoadBalance | 基于 Hash一致性            |
| RoundRobinLoadBalance     | 基于加权轮询算法           |

### RandomLoadBalance—权重算法

RandomLoadBalance 是 Dubbo 的缺省实现，所谓权重算法，实际上是加权随机算法的意思，它的算法思想如下：

![RandomLoadBalance](https://img.wkq.pub/hexo/RandomLoadBalance.png)

假设我们有一组服务器分别是 A，B，C，他们对应的权重为 A = 5 ，B = 3 , C=2 ,权重总和为 10 。现在把这些权重值平铺在一维坐标值上，[0,）区间属于服务器 A ， [5, 8）区间属于服务器 B，[8,10) 区间属于服务器 C。

接下来通过随机数生成器一个范围在 [0,10) 之间的随机数，然后计算这个随机数会落到那个区间上。比如数字 3 会落到服务器 A 对应的区间上，，此时返回服务器 A 即可。权重越大的机器，在坐标轴上对应的区间范围就越大，因此随机数生成器生成的数字就会有更大的概率落到此区间中。

只要随机数生成器产生的随机数分布性很好，在经过多次选择后，每个服务器被选中的次数比例接近其权重比例。比如，经过一万次选择后，服务器 A 被选中的次数大约是 5000 次，服务器 B 被选中的次数约为 3000 次，服务器  C 被选中的次数约为 2000 次。

### LeastActiveLoadBalance- 最少活跃数

这个算法的思想就是“能者多劳”，它认为当前活跃调用数越小，表明该服务提供者效率越高，单位时间内可处理更多的请求，因此应优先将请求分配给该服务提供者。

该算法给每个服务提供者设置一个 “active“ 属性，初始值为 0 ，每收到一个请求，活跃数加 1 ，完成请求后则将活跃数减 1。在服务运行一段时间后，性能好的服务提供者处理请求的速度更快，因此活跃数下降的也越快，此时这样的服务提供者能够优先获取到新的服务请求、这就是最小活跃数负载均衡算法的基本思想。

当然这种算法也有不公平的地方，比如某台机器是扩容后新上线的机器，因此 active 的值是 0 ，而这时 Dubbo 会认为这台机器的速度快如闪电，但其实这台机器的性能有可能慢如老狗。

除了最小活跃数以外，LeastActiceLoadBalance 在实现上还实现了 权重值。所以准确的来说，LeastActiveLoadBalance 是基于加权最小活跃数算法实现的。

比如，在一个服务提供者集群中，有两个性能优异的服务提供者。某一时刻它们的活跃数相同，此时 Dubbo 会根据它们的权重去分配请求，权重越大，获取到新请求的概率就越大。如果两个服务提供者权重相同，此时随机选择一个即可。

### ConsistentHashLoadBalance - Hash 算法

一致性 Hash 算法提出最初是用于大规模缓存系统的负载均衡。在Dubbo 中它的工作流程是这样的

1. 首先根据服务地址为服务节点生成一个Hash，并将这个 Hash 投射到 [0,232-1]的圆环上

2. 当有请求来了，根据请求参数等维度的信息作为一个 key，生成一个 hash 值。然后查找第一个大于或等于该 Hash 值的服务节点，并将这个请求转发到给节点。

3. 如果当前节点挂了，则查找另一个大于其 Hash 值得缓存节点即可。

   

   ![ConsistentHashLoadBalance](https://img.wkq.pub/hexo/ConsistentHashLoadBalance.png)

如上图所示，4 台机器均匀分布在圆环中，所有请求会访问第一个大于或等于自身 Hash 的节点。Server 3 这台机器处于不可用的状态，因此所有请求继续向后寻找直到找到 Server 4.

### RoundRobinLoadBalance - 加权轮询

它和 Ribbon 的 RoundRobinRule 差不多。

所谓轮询是将请求轮流分配给每台服务器。比如说我们有 3 台机器 A、B、C，当请求到来的时候我们从 A 开始依次派发，第一个请求给到 A，第二个给到 B， 依次类推，到最后一个节点 C 派发完成之后，在回到 A 重新开始。

从上面的例子可以看到，每台机器接到请求的概率是相等的，但是在实际应用中，我们并不能保证每台机器的效率都一样，因此可能会出现某台 Server 性能特别慢无法消化请求的情况。因此我们需要对轮询过程进行加权，以调控每台服务器的负载。

经过加权后，每台服务器能够得到的请求书比例，接近或等于它们的权重比。比如服务器 A、B 、C 权重比为 5:2:1。那么在 8 次请求中，服务器 A 将受到其中的 5 次请求，服务器 B 会收到其中的 2 次请求，服务器 C 则收到其中的 1 次请求。

### 配置负载均衡策略

Dubbo 可以在类级别 （@Service）和方法级 （@Resource）指定负载均衡策略，以方法级别为例，下面的代码配置了 RoundRobin 的负载均衡规律。

```java
@Reference(loadbalance = "roundrobin")
private IDubboService dubboService;
```

