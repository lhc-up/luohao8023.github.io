<!-- ---
title: Promise知识梳理
sidebar: 'auto'
date: 2021-05-14
tags:
    - js
categories:
    - js
--- -->

`ECMAscript 6` 原生提供了 `Promise` 对象，用于表示一个异步操作的最终完成 (或失败)及其结果值。一个`Promise`必然处于以下几种状态之一：
- `pending`: 初始状态，既没有被兑现，也没有被拒绝
- `fulfilled`: 意味着操作成功完成
- `rejected`: 意味着操作失败  
更详细的介绍及使用说明参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

### `Promise`静态方法
