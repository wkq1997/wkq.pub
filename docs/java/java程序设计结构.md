---
title: java程序设计结构概念
---

## 数据类型

Java 是一种强类型语言。这就意味着必须未每一个变量声明一种类型。在 Java 中，一共有 8 种基本类型（primitive type），其中有 4
种整型、2 种浮点类型、1 种字符类型char（用于表示 Unicode 编码的代码单元）和 1 种用于表示真值的 boolean 类型。

:::note

Java 有一个能够表示任意精度的算术包，所谓的“大数”（big number）是 Java 对象，而不是一个基本 Java 类型。

:::

### 整型

整型用于表示没有小数部分的数，可以是负数。Java 提供了 4 种整型。如下：

| 类型  | 存储需求 | 取值范围                                   |
| ----- | -------- | ------------------------------------------ |
| int   | 4 字节   | -2147483648 ~ 2147483647（略高于 21 亿）   |
| long  | 8 字节   | -9223372036854775808 ~ 9223372036854775807 |
| short | 2 字节   | -32768 ~ 32767                             |
| byte  | 1 字节   | -128 ~ 127                                 |

在通常情况下，int 类型最常用。但如果想要表示真个地球的居住人口，就需要使用 long 类型了。 byte 和 short 类型主要用于特定的应用场合。

在 Java 平台，整型的范围和运行代码的机器无关。Java 没有无符号（unsigned）形式的 int 、long、short 或 byte 类型。

长整型数值有一个后缀 L 或 l （如 4000000000L）。十六进制数值有一个前缀 0x 或 0X （0xCAFE）。八进制有一个前缀 0 （例如：010 对应十进制中的 8）。显然，八进制表示法比较容易混淆，所以很少有程序员使用八进制常数。

加上前缀 0b 或 0B 还可以写二进制数。例如， 0b1001 就是 9 .另外，可以为数字字面量加下划线，如用 1_000_000，使其更加易读，Java 编译器会去除这些下划线。

### 浮点类型

浮点类型用于表示有小数部分的数值。在 Java 中有两种浮点类型，如下：

| 类型   | 存储需求 | 取值范围                                            |
| ------ | -------- | --------------------------------------------------- |
| float  | 4 字节   | 大约 ± 3.40282347 x 10^38  (6 ~ 7 位有效数字)       |
| double | 8 字节   | 大约 ± 1.79769313486231570 x 10^308 (15 层有效数字) |

double 表示这种类型的数值精度是 float 类型的两倍（所以也有人称之为双精度数）。很多情况下，float 类型的精度（6~ 7 位有效数字）都不能满足要求。实际上只有很少的情况适合用 float 类型。

float 类型的数值有一个前缀 F 或 f。没有后缀 F 的浮点数值默认为 double 类型。

所有的浮点数计算都遵循 IEEE 754 规范。具体来说，有 3 个特殊的浮点数值表示溢出和出错情况：

* 正无穷大，用常量 Double.POSITIVE_INFINITY 表示。
* 负无穷大，用常量 Double.NEGATIVE_INFINITY 表示。
* NaN （不是一个数），Double.NaN。

例如，一个正整数除以 0 的结果为正无穷大。计算 0/0 或者负数的平方根结果为 NaN。

### char 类型

char 类型原本用于表示单个字符。不过，现在情况已经有所变化。如今，有些 Unicode 字符可以用一个 char 值描述，另外一些 Unicode 字符则需要两个 char 值。

char 类型的字面量值要用单引号括起来。例如：'A' 是编码值为 65 的字符常量。它与  "A" 不同，"A" 是包含一个字符的字符串。char  类型的值可以表示为十六进制值，其范围从 `\u000 ~ \uFFF`。

### Unicode 和 char 类型

要想弄清 char 类型，就必须了解 Unicode 编码机制，它打破了传统字符编码机制的限制。在 Unicode 出现之前，已经有很多种不同的标准：美国的 ASCII、西欧语言的 ISO 8859-1、中国的 GB  18030 和 BIG - 5等。这样就产生了下面两个问题：一个是对于一个特定的代码值，在不同的编码机制中可能对应不同的字母；二是采用大写字符集的语言其编码长度可能不同。设计 Unicode 编码的目的就是要解决这些问题。

刚开始设计 Java 时决定采用 16  位的 Unicode 字符集，但经过一段时间后，Unicode 字符超过了 65535 个，其主要的原因是加入了汉语、日语、韩文。现在 ，16 位的 char 类型已经不足以描述所有的 Unicode 字符了。

### boolean 类型

boolean 类型有两个值：false 和 true ，用来判定逻辑条件。整型值和布尔型值之间不能进行互相转换。

## 变量和常量

与所有程序设计语言一样，Java 也使用变量来存储值。常量就是值不变的变量。

### 变量

在 Java 中，每个变量都有一个类型(type)。声明一个变量时，先指定变量的类型，然后是变量名。

```java
double salary;
int vacationDays;
long earthPopulation;
boolean done;	
```

每个声明都以分号结束。由于声明是一个完整的 Java 语句，而所有 Java 语句都以分号结束，所以这里的分号是必须的。

变量名的标识符由字母、数字、货币符号以及下划线组成。且第一个字符不能是数字。字母区分大小写。

与大多数程序设计语言相比，Java 中“字母”、“数字” 和“货币符号”的范围更大。字母是指一种语言中表示字母的任意 Unicode 字符，但实际上大多数程序员总是使用 A-Z、a-z、0-9和下划线 _。

声明一个变量之后，必须用赋值语句显示地初始化变量。

### 常量

在 Java 中，可以用关键字 final 声明常量。例如：

```java
public class Constants {
    public static void main(String[] args){
        final double CM_PER_INCH=2.54;
        double paperWidth=8.5;
        double paperHeight=11;
        System.out.println("Paper size in centimeters:"+paperWidth*CM_PER_INCH+" by "+paperHeight*CM_PER_INCH);
    }
}
```

关键字 final 表示这个变量只能被赋值一次。一旦赋值，就不能再更改了。习惯上，常量名使用全大写。

在 Java 中，可能经常需要创建一个常量以便在一个类的多个方法中使用，通常将这些常量称为类常量（class constant）。可以使用关键字 static final 设置一个类常量。如下：

```java
public class Constants {
    private final static double CM_PER_INCH=2.54;
    public static void main(String[] args){
        double paperWidth=8.5;
        double paperHeight=11;
        System.out.println("Paper size in centimeters:"+paperWidth*CM_PER_INCH+" by "+paperHeight*CM_PER_INCH);
    }
}
```

类常量的定义位于 main 方法之外。这样一来，同一个类的其它方法也可以使用这个常量。

### 枚举类型

有时候，一个变量只包含有限的一组值。例如，披萨只有小、中、大和超大这四种尺寸。当然，可以将这些尺寸分别编码为整数 1、2、3、4 或字符 S、M、L、X。但这种设置有可能在变量中保存一个错误的值。

针对这种情况，可以自定义枚举类型（enumerated type）。枚举类型包含有限个命名值。例如：

```java
public class Test{
    public static void main(String[] args){
        Size s= Size.SMALL;
        System.out.println(s); //SMALL
    }
}
enum Size{
    SMALL,MEDIUM,LARGE,MXTRA_LARGE
}
```

Size 类型的变量只能存储这个类型声明中所列的某个值，或者特殊值 null。

