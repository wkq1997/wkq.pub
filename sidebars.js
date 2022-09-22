/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */


const distributed = [
    {
        type: 'doc',
        id: 'distributed/index',
        label: '概述'
    },
    'distributed/architectureEvolution',
    'distributed/SpringCloud',
    {
        type: 'category',
        label: '服务发现',
        link: {type: 'doc', id: 'distributed/serviceDiscovery/index'},
        items: []
    },
    {
        type: 'category',
        label: '远程服务调用',
        link: {type: 'doc', id: 'distributed/remoteServiceCall/index'},
        items: [
            'distributed/remoteServiceCall/RPC/index',
            'distributed/remoteServiceCall/REST/index',
            'distributed/remoteServiceCall/dubbo/index',
        ]
    },
    'distributed/gateway/index',
    {
        type: 'category',
        label: '事务处理',
        link: {type: 'doc', id: 'distributed/transactionProcessing/index'},
        items: [
            'distributed/transactionProcessing/LocalTransactions/index',
            'distributed/transactionProcessing/DistributedTransactions/index',
        ]
    },
    'distributed/distributedId',
    'distributed/sleuth/index',
    {
        type: 'category',
        label: '服务间通信',
        link: {type: 'doc', id: 'distributed/服务间通信/index'},
        items: [
            'distributed/服务间通信/Nacos体系架构/index',
        ]
    },

]

const elk = [
    'elk/index',
    'elk/install/index',
    {
        type: 'category',
        label: 'Elasticsearch',
        link: {type: 'doc', id: 'elk/Elasticsearch/index'},
        items: [
            'elk/Elasticsearch/ES基本概念/index',
            'elk/Elasticsearch/Documnet基本操作/index',
            'elk/Elasticsearch/分词/index',
            'elk/Elasticsearch/SearchAPI/index',
            'elk/Elasticsearch/Mapping/index',
            'elk/Elasticsearch/聚合/index',
            'elk/Elasticsearch/数据建模/index',
        ]
    },
    'elk/Logstash/index',
]

const cloudcomputing = [
    "cloudcomputing/index",
    "cloudcomputing/基础服务/index",
    "cloudcomputing/云原生架构之Kubernetes/index",
    "cloudcomputing/Serverless/index"

]

const mysql = [
    'mysql/index',
    {
        type: 'category',
        label: 'mysql理论',
        link: {type: 'doc', id: 'mysql/理论/index'},
        items: [
            'mysql/理论/基础架构/index',
            'mysql/理论/日志系统/index',
            'mysql/理论/事务隔离/index',
            'mysql/理论/索引/index',
        ]
    },
];
const java = [
    'java/index',
    'java/java程序设计结构',

];
const 设计模式 = [
    'designmode/index',
    {
        type: 'category',
        label: '面向对象',
        link: {type: 'doc', id: 'designmode/objectoriented/index'},
        items: [

        ]
    },

];
// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    distributed,
    elk,
    cloudcomputing,
    mysql,
    java,
    设计模式,
};

module.exports = sidebars;
