---
title: Vue.nextTick
sidebar: 'auto'
date: 2021-04-25
tags:
    - Vue
    - Vue源码
categories:
    - Vue
---

## 相关问题
1、Vue中怎么获取更新后的DOM？  
2、Vue是怎么实现异步更新DOM的？为什么要异步更新？  
3、`this.$nextTick`是微任务还是宏任务？  
4、Event Loop中，每一个“tick”都包含**执行宏任务、执行微任务、更新UI**几个步骤，由此可知，微任务执行完成后才会更新UI，那Vue中的`nextTick`为什么可以拿到更新后的DOM呢？  
5、`Vue.nextTick`和`Vue.$nextTick`和平时用到的`this.$nextTick`有什么不同？

## 官方定义
### `Vue.nextTick([callback, context])`
- 参数：
  - `{Function} [callback]`
  - `{Object} [context]`
- 用法：
  在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
  ```js
    // 修改数据
    vm.msg = 'Hello'
    // DOM 还没有更新
    Vue.nextTick(function () {
    // DOM 更新了
    })
    // 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
    Vue.nextTick()
    .then(function () {
        // DOM 更新了
    })
  ```
::: tip
2.1.0 起新增：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。请注意 Vue 不自带 Promise 的 polyfill，所以如果你的目标浏览器不原生支持 Promise (IE：你们都看我干嘛)，你得自己提供 polyfill。
:::

## `nextTick`方法是怎么暴露出来的？

**[src/core/global-api/index.js](https://github.com/vuejs/vue/blob/dev/src/core/global-api/index.js) 46行**：将`nextTick`定义为了Vue的静态方法
```js
Vue.nextTick = nextTick
```
而`Vue.prototype.$nextTick`基于`nextTick`又做了一层封装，相对于nextTick少了一个参数，只接受回调函数：
```js
Vue.prototype.$nextTick = function (fn: Function) {
  return nextTick(fn, this)
}
```
**所以对于第五题，首先`Vue.$nextTick`是访问不到的；`nextTick`是Vue的静态方法，只能通过Vue构造函数来访问；`$nextTick`是Vue的原型方法，只能通过Vue实例访问；`$nextTick`基于`nextTick`封装，只接受回调函数；而`nextTick`还接受`ctx`（Vue实例）作为参数。**

## 源码分析
**`nextTick`相关代码存放在[src/core/util/next-tick.js](https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js)中**  
这个文件中，作者写了很多注释，解释了当前以及旧版本遇到的一些问题，包括对应的解决办法，降级策略和环境兼容等，为了节省空间，这里把源码注释删掉，代码不动，并重新添加注释，解释每行代码的作用：
```js
/**
 * 引入一些工具函数
*/
import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

/** 
 * 一个标记，nextTick在当前环境中是否是基于微任务实现的
 * nextTick是优先使用微任务来实现，
 * 环境不兼容时采用降级策略，使用宏任务实现
*/
export let isUsingMicroTask = false

/**
 * 回调函数数组，调用nextTick传入的回调函数都会保存在这里
*/
const callbacks = []

/**
 * 标志位，标记更新任务是否已入队（可能是微任务，也可能是宏任务）
 * Vue就是通过nextTick异步更新DOM的
 * 更新顺序以及任务调度在src/core/observer/scheduler.js中，
 * 也是Vue源码中比较重要的一部分，这里不讲
*/
let pending = false

/**
 * 执行回调函数，并将标志位设置为false，允许新任务入队
*/
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

/**
 * 将任务入队（微任务队列或宏任务队列）
 * 上面说的入队就是这个函数实现的
 * 这里做了兼容以及降级策略
*/
let timerFunc

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  /**
   * 当前环境原生支持Promise时，优先使用Promise
   * isNative的具体实现：
   * export function isNative (Ctor: any): boolean { 
   *  return typeof Ctor === 'function' 
   *    && /native code/.test(Ctor.toString()) 
   * }
   * 创建一个fulfilled状态的Promise
  */
  const p = Promise.resolve()
  timerFunc = () => {
    /**
     * 将flushCallbacks推入任务队列
    */
    p.then(flushCallbacks)
    /**
     * hack方法，处理iOS UIWebViews中的奇怪问题
     * export const isIOS = 
     * (UA && /iphone|ipad|ipod|ios/.test(UA)) 
     *  || (weexPlatform === 'ios')
    */
    if (isIOS) setTimeout(noop)
  }
  /**
   * 因为Promise是微任务源，Promise.then执行时会把回调函数
   * 推入微任务队列，所以这里使用了微任务
  */
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  /**
   * 非IE环境，export const isIE = UA && /msie|trident/.test(UA)
   * 原生支持MutationObserver
  */
  let counter = 1
  // 创建一个观察对象，并将flushCallbacks作为回调函数
  const observer = new MutationObserver(flushCallbacks)
  // 创建一个text节点，节点内容为counter
  const textNode = document.createTextNode(String(counter))
  // 监测text节点的变化
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    /**
     * 修改text节点的值，触发节点变化，则节点观察对象会将回调函数
     * 即flushCallbacks推入微任务队列
    */
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  /**
   * 因为MutationObserver是微任务源，观察到节点变化时
   * 会将回调函数推入微任务队列，所以这里使用了微任务
  */
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  /**
   * 原生支持setImmediate时，使用setImmediate，宏任务
   * https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
   * https://www.caniuse.com/?search=setImmediate
   * 可以自行查看文档和兼容性
  */
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // 最终使用setTimeout来兜底，宏任务
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

/**
 * 这个当然就是nextTick函数啦
 * 其实就是把回调函数放到callbacks数组
 * 如果任务未入队的话，把任务入队
*/
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      // 如果传入了回调函数，则调用该函数
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      // 如果没有回调函数，则讲nextTick返回的Promise标记为fulfilled
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    // 调用入队函数，将更新任务入队
    timerFunc()
  }
  /**
   * 如果没有传入回调函数且当前环境支持Promise（无论是原生还是
   * polyfill），则返回promise，并在微任务执行后将Promise标记
   * 为fulfilled
  */
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```
### 如何获取更新后的DOM
调用`nextTick`时，无论你是否传入回调函数，它都会像任务队列中推入一个“包裹函数”，在该函数内进行判断，如果有回调函数，则执行回调函数，如果没有回调函数，则将`nextTick`返回的`Promise`（如果当前环境支持的话）标记为`fulfilled`状态。  
`Vue`就是通过`nextTick`的机制来实现异步更新DOM的，所以我们可以向`nextTick`传入回调函数或者使用`Vue.nextTick().then()`来获取更新后的DOM。
### `Vue`为什么要异步更新DOM？
当然是为了性能。当`Vue`监测到数据变化时，并不会立即更新视图，而是添加到任务队列中，将更新方法交由`nextTick`调用，从而控制了更新频率，如果任何一个数据发生变化都立即更新DOM的话，更新太过频繁，造成性能损失。
### `this.$nextTick`是微任务还是宏任务？
由当前执行环境决定，原生支持`Promise`或`MutationObserver`时是微任务，否则是宏任务。
### `nextTick`为什么可以拿到更新后的DOM？
了解过`Event Loop`的应该都知道，每一个“tick”都包含**执行宏任务、执行微任务、更新UI**几个步骤，微任务执行完成才会更新UI，但通过上面的源码分析，`setImmediate`和`setTimeout`就不说了，本身就是宏任务源，肯定在`Event Loop`的下一个“tick”中了，但`Promise`和`MutationObserver`都是微任务源，都只是把回调函数添加到当前“tick”中的微任务队列中，此时UI还没有更新，那`nextTick`究竟是怎么拿到更新后的DOM的？  
这个问题我之前也是非常困惑，后来逐渐有了清晰的理解，欢迎一起讨论：  
Vue的异步更新主要是Vue自身维护了一个异步更新队列，并将更新队列交给`nextTick`去更新，而`nextTick`大部分情况下也是微任务，当更新队列中的更新函数执行时，如果修改了DOM，则DOM是会立即更新的，只不过不会立即表现在页面上，UI仍没有更新（需要等到微任务执行完毕）。  
DOM更新和UI更新不是一回事，**DOM更新是实时的，UI更新是异步的**。


## 总结
- 使用`Vue.nextTick`获取更新后的DOM
- 维护异步更新队列，结合`nextTick`机制，为了性能
- It depends
- DOM更新是实时的，UI更新是异步的
- `this.nextTick`（`Vue.prototype.nextTick`）是基于`Vue.nextTick`封装的，前者比后者少了个参数。原型方法只能通过实例访问，`Vue.$nextTick`啥也不是