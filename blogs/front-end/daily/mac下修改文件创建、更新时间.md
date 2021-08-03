---
title: mac下修改文件创建、更新时间
sidebar: 'auto'
date: 2021-06-08
tags:
    - 日常开发
categories:
    - 日常开发
---

## 修改创建时间
```bash
touch -mt YYYYMMDDhhmm filePath
```
`YYYYMMDDhhmm`为时间格式，精确到分钟，如`202106081022`，打开终端，输入`touch -mt 202106081022 `，然后将需要修改的文件拖进来，回车。

## 修改更新时间
```bash
touch -t YYYYMMDDhhmm filePath
```