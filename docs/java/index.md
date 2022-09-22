---
title: 概述
---
Java 不仅仅是一门编程语言，它还是一个由一系列计算机软件和规范组成的技术体系，这个技术体系提供了完整的用于软件开发和跨平台部署的支持环境，并广泛应用于多种场合。

## Java 技术体系
Java 社区定义的 Java 技术体系包括了以下几个组成部分：
* Java 程序设计语言
* 各种硬件平台上的 Java 虚拟机实现
* Class 文件格式
* Java 类库 API
* 来自商业机构和开源社区的第三方 Java 类库

我们可以把 Java 程序设计语言、Java 虚拟机、Java类库 这三部分统称为 JDK （Java Development Kit） ，JDK 是用于支持 Java 程序开发的最小环境。可以把 Java 类库 API 中的 Java SE API 子集和 Java 虚拟机 这两部分统称为 JRE （Java Runtime Environment），JRE 是支持 Java 程序运行的标准环境。



## 安装 Java 开发工具包

### 下载JDK

可以从 https://adoptium.net 下载 Java 开发工具包，也可以从 [Oracle 公司网站 ](https://www.oracle.com/java/technologies/downloads/)下载。

以下是一些常用术语。

| 术语名                                     | 缩写 | 解释                                   |
| ------------------------------------------ | ---- | -------------------------------------- |
| Java Development Kit（Java 开发工具包）    | JDK  | 程序员编写Java程序使用的软件           |
| Java Runtime Environment（Java运行时环境） | JRE  | 用来运行Java程序的软件，不带开发工具。 |
| Standard Edition（标准版）                 | SE   | 用于桌面或简单服务器应用的 Java 平台   |
| Micro Edition（微型版）                    | ME   | 用于小型设备的 Java 平台               |
| OpenJDK                                    | —    | Java SE 的一个免费开源实现             |
| Hotspot                                    | —    | Oracle 开发的”即时“编译器              |
| OpenJ9                                     | —    | IBM 开发的另一个”即时“编译器           |
| Long Time Support                          | LTS  | 长期支持版本                           |

### 设置 JDK

下载 JDK 后，需要对 JDK 进行配置

* 在 Linux 上，只需要把 .tar.gz 文件解压到你选择的某个位置，将解压后的目录重命名为 jdk，并将其放到 /usr/local 下。并配置环境变量
* windows 下需要将安装目录下的 bin 目录添加到 Path 系统变量下。

### 安装源文件和文档

类库源文件在 JDK 中以压缩文件 lib/src.zip 的形式存在，解压缩这个文件得到源代码。在主目录中创建一个目录 javasrc，在 jdk/lib 目录下找到文件 src.zip ，解压到  javasrc 目录。

文档包含在独立于 JDK 的一个压缩文件中，直接从 [Oracle网站](https://www.oracle.com/java/technologies/javase-jdk17-doc-downloads.html) 下载。解压缩这个文件，将 doc 目录重命名为 javadoc 。在浏览器中打开 javadoc/index.html ，并将这个页面增加到书签。

如此，就完成了安装源文件和文档。
