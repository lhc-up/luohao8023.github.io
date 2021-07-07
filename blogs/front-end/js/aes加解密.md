---
title: aes加解密
sidebar: 'auto'
date: 2021-07-02
tags:
    - js
categories:
    - js
---


## AES
密码学中的高级加密标准（Advanced Encryption Standard，AES），又称Rijndael加密法，是美国联邦政府采用的一种区块加密标准。[百度百科](https://baike.baidu.com/item/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86/468774?fromtitle=aes&fromid=5903&fr=aladdin)  
作为一种加密标准，各个语言都可以实现，`JavaScript`当然也不例外，Github上标星较高的[`aes-js`](https://github.com/ricmoo/aes-js)就是其中之一。这里介绍一下用法，并简单的进行扩展和封装。

## [`aes-js`](https://github.com/ricmoo/aes-js)用法

### 引入
#### Node.js
```shell
npm install aes-js
```
```js
var aesjs = require('aes-js');
```

#### 浏览器
```html
<script type="text/javascript" src="https://cdn.rawgit.com/ricmoo/aes-js/e27b99df/index.js"></script>
```

### 使用(以CBC模式为例)
```js
// 密码，必须是32字节，并转换为对应Unicode编码
var key = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
key = aesjs.utils.utf8.toBytes(key);
// 偏移量，必须是16字节
var iv = 'aaaaaaaaaaaaaaaa';
iv = aesjs.utils.utf8.toBytes(iv);


// 加密字符必须转换为16字节的整数倍
var text = 'TextMustBe16Byte';
var textBytes = aesjs.utils.utf8.toBytes(text);
// 填充
textBytes = aesjs.padding.pkcs7.pad(textBytes);
// 加密
var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
var encryptedBytes = aesCbc.encrypt(textBytes);

// 如需展示加密后的字符，则需要转换为16进制
var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
console.log(encryptedHex);
// "104fb073f9a131f2cab49184bb864ca2"

// 解密之前，先转换为bytes数组
var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

// 解密时需要重新实例化
var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
var decryptedBytes = aesCbc.decrypt(encryptedBytes);
// 去除填充
decryptedBytes = aesjs.padding.pkcs7.strip(decryptedBytes);

// Convert our bytes back into text
var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
console.log(decryptedText);
// "TextMustBe16Byte"
```
基础的工具用起来还是稍微有些繁琐的，封装一下用起来更方便。


## 封装
封装后的文件仍然以单文件形式提供，方便直接引入使用。修改源码导出方式，直接用变量来接收：
```js
// node.js
if (typeof exports !== 'undefined') {
    module.exports = aesjs

// RequireJS/AMD
// http://www.requirejs.org/docs/api.html
// https://github.com/amdjs/amdjs-api/wiki/AMD
} else if (typeof(define) === 'function' && define.amd) {
    define([], function() { return aesjs; });

// Web Browsers
} else {

    // If there was an existing library at "aesjs" make sure it's still available
    if (root.aesjs) {
        aesjs._aesjs = root.aesjs;
    }

    root.aesjs = aesjs;
}

// 不再导出模块，直接return aesjs，然后用变量接收
var aesjs = (function() {
    // ...
    return aesjs;
})();
```
源码中提供的工具只有转16进制，增加一个转base64的扩展，显示加密后的字符串更短一些：
```js
// 这里是源码中的aesjs定义
var aesjs = {
    //...
    utils: {
        hex: convertHex,
        //增加base64工具
        base64: convertBase64,
        utf8: convertUtf8
    },
    //...
};

var convertBase64 = (function() {
    function toBytes(text) {
        let padding = '='.repeat((4 - text.length % 4) % 4);
        let base64 = (text + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        let rawData = window.atob(base64);
        let outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function fromBytes(bytes) {
        var base64    = ''

        var byteLength    = bytes.byteLength
        var byteRemainder = byteLength % 3
        var mainLength    = byteLength - byteRemainder

        var a, b, c, d
        var chunk

        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
            d = chunk & 63               // 63       = 2^6 - 1

            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
        }

        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength]

            a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

            // Set the 4 least significant bits to zero
            b = (chunk & 3)   << 4 // 3   = 2^2 - 1

            base64 += encodings[a] + encodings[b] + '=='
        } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

            a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

            // Set the 2 least significant bits to zero
            c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + '='
        }
        
        return base64
    }

    return {
        toBytes: toBytes,
        fromBytes: fromBytes
    }
})();
```

接下来就是工具的封装了：
```js
/**
 * @param {Object} option
 *     mode: 模式，默认cbc  ecb | cbc | cfb | ofb | ctr
 *     padding: 填充，当前仅支持PKCS7Padding，如需其他方式，则需要扩展源码
 *     iv: 偏移量
 *     key: 密码
 *     code: 编码，默认base64，base64 | hex
 */
function AesUtil(option={}) {
    if (!(this instanceof AesUtil)) {
        throw new Error('必须使用 new 关键字初始化');
    }
    // 保持属性私有
    // 模式默认使用cbc
    const mode = option.mode || 'cbc';
    // 填充仅支持PKCS7Padding，如需其他方式，则需要扩展源码
    const padding = 'pkcs7';
    // 偏移量
    const iv = option.iv;
    // 密码
    const key = option.key;
    // 输出编码格式默认为base64，支持hex
    const code = option.code || 'base64';

    // 填充工具
    const paddingUtil = (type => {
        const padding = aesjs.padding[type];
        if (!padding) {
            throw new Error('不支持的填充方式：' + type);
        }
        return padding;
    })(padding);

    // 编码工具
    const codeUtil = (type => {
        const codeUtil = aesjs.utils[type];
        if (!codeUtil) {
            throw new Error('不支持的编码方式：' + type);
        }
        return codeUtil;
    })(code);


    // 获取aes对应模式实例
    const getAesInstance = function(mode, key, iv) {
        const modeOfOperation = aesjs.ModeOfOperation[mode];
        if (!modeOfOperation) {
            throw new Error('不支持的模式：' + mode);
        }
        key = aesjs.utils.utf8.toBytes(key);
        iv = aesjs.utils.utf8.toBytes(iv);
        return new modeOfOperation(key, iv);
    }

    /**
     * 单个数据加密
     * @param {String|Number} input 
     */
    this.encrypt = function(input) {
        try {
            const aesInstance = getAesInstance(mode, key, iv);
            // 转为Uint8Array utf8字符集
            let bytes = aesjs.utils.utf8.toBytes(input);
            // 填充
            bytes = paddingUtil.pad(bytes);
            // 加密
            bytes = aesInstance.encrypt(bytes);

            // 按编码方式输出
            return codeUtil.fromBytes(bytes);
        } catch(e) {
            throw new Error(`加密${input}失败：${e.message}`);
        }
    }

    /**
     * 按数组加密，批量加密数组中的每个值
     * @param {Array} array 
     * @param {Boolean} copy 是否以副本形式返回，默认为true，如果为false，则修改原数组
     * @returns {Array} res 加密结果
     */
    this.encryptByArray = function(array=[], copy=true) {
        // copy为true时返回副本
        const res = copy ? [] : array;
        for (let i = 0; i < array.length; i++) {
            const text = this.encrypt(array[i]);
            copy ? res.push(text) : res[i] = text;
        }
        return res;
    }

    /**
     * 按对象加密，不支持嵌套对象
     * @param {Object} obj 
     * @param {Boolean} copy 是否以副本形式返回
     * @param {Array} arr 指定加密具体的key，如['name', 'age']表示仅加密name和age字段
     * @returns {Object} 加密后的对象（仅加密value）
     */
    this.encryptByKeyValue = function(obj={}, copy=true, arr=[]) {
        // 默认加密所有属性
        const operateKeys = (Array.isArray(arr) && arr.length) ? arr : Object.keys(obj);

        // copy为true时返回副本
        const res = copy ? {} : obj;
        for (const key in obj) {
            if (operateKeys.includes(key)) {
                res[key] = this.encrypt(obj[key]);
            }
        }
        return res;
    }

    /**
     * 单个数据解密
     * @param {String|Number} input 
     */
    this.decrypt = function(input) {
        try {
            const aesInstance = getAesInstance(mode, key, iv);
            // 按编码方式解码得到bytes
            let bytes = codeUtil.toBytes(input);
            // 解密
            bytes = aesInstance.decrypt(bytes);
            // 去除填充
            bytes = paddingUtil.strip(bytes);

            // 转为utf8字符
            return aesjs.utils.utf8.fromBytes(bytes);
        } catch(e) {
            throw new Error(`解密${input}失败：${e.message}`);
        }
    }

    /**
     * 按数组解密，批量解密数组中的每个值
     * @param {Array} array 
     * @param {Boolean} copy 是否以副本形式返回，默认为true，如果为false，则修改原数组
     * @returns {Array} res 解密结果
     */
    this.decryptByArray = function(array=[], copy=true) {
        // copy为true时返回副本
        const res = copy ? [] : array;
        for (let i = 0; i < array.length; i++) {
            const text = this.decrypt(array[i]);
            copy ? res.push(text) : res[i] = text;
        }
        return res;
    }

    /**
     * 按对象解密，不支持嵌套对象
     * @param {Object} obj 
     * @param {Boolean} copy 是否以副本形式返回
     * @param {Array} arr 指定解密具体的key，如['name', 'age']表示仅解密name和age字段
     * @returns {Object} 解密后的对象（仅解密value）
     */
    this.decryptByKeyValue = function(obj={}, copy=true, arr=[]) {
        // 默认解密所有属性
        const operateKeys = (Array.isArray(arr) && arr.length) ? arr : Object.keys(obj);

        // copy为true时返回副本
        const res = copy ? {} : obj;
        for (const key in obj) {
            if (operateKeys.includes(key)) {
                res[key] = this.decrypt(obj[key]);
            }
        }
        return res;
    }
}
```
当然别忘了导出模块，一般的前端项目是用`webpack`打包了，直接导出就行：
```js
module.exports = AesUtil;
// 或者
export default AesUtil;
// 或者像源码一样，支持多种模块化方式
```

## 封装后的工具使用
```js
import AesUtil from 'aesUtil.js';
const aesUtil = new AesUtil({
    //32字节
    key: '',
    //16字节
    iv: ''
});

// 加解密单个字符串
const text = '12345';
// 加密
const encryptedText = aesUtil.encrypt(text);
// 解密
const decryptedText = aesUtil.decrypt(encryptedText);

// 可以传入数组，依次加解密数组元素
const arr = ['1', '2', '3'];
// 默认返回copy后的数组
const encryptedArr = aesUtil.encryptByArray(arr);
// 可将第二个参数设置为false，表示不拷贝，直接修改原数组
aesUtil.encryptByArray(arr, false);
// 解密同理

// 可以传入键值对，依次加解密
const obj = {
    a: 1,
    b: '2',
    c: 'aaa'
}
// 默认返回copy后的对象
const encryptedObj = aesUtil.encryptByKeyValue(obj);
// 可将第二个参数设置为false，表示不拷贝，直接修改原对象
aesUtil.encryptByKeyValue(obj, false);
// 第三个参数为可选数组，表示需要加解密的属性key，不传或为空数组时，加解密全部属性
// 仅加密obj.a和obj.b
aesUtil.encryptByKeyValue(obj, false, ['a', 'b']);
```