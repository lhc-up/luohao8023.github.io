---
title: Vue2 prop源码解析
sidebar: 'auto'
date: 2021-05-02
tags:
    - Vue
    - Vue源码
categories:
    - Vue
---


## 前言
`prop`用于父子组件之间的通信，所有的 prop 都使得其父子 prop 之间形成了一个单向下行绑定：父级 prop 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外变更父级组件的状态，从而导致你的应用的数据流向难以理解。  

每次父级组件发生变更时，子组件中所有的 prop 都将会刷新为最新的值。这意味着你不应该在一个子组件内部改变 prop。如果你这样做了，Vue 会在浏览器的控制台中发出警告。具体的使用方法及注意事项可参考[官方文档](https://cn.vuejs.org/v2/guide/components-props.html)  

这篇文章尝试从源码角度分析以下几个问题：
- 父组件中的数据变化时，`prop`是如何通知子组件更新的？
- 子组件在接收`prop`时如何是如何进行类型检查和数据验证的？
- 父组件传入了`prop`，但子组件未显式接收，Vue是怎么处理的？

## 源码分析（Vue2.6.12）
如何在Vue源码工程中找到入口文件、初始化方法及`prop`对应的部分，可参考[从源码角度看Vue2响应式原理](./从源码角度看Vue2响应式原理)。  

找到`src/core/instance/state.js`文件 64 行，在这里对`props`进行了初始化。
```js
function initProps (vm: Component, propsOptions: Object) {
  // 这个propsData是父级调用子组件时传递的所有props键值对中被子组件显式接收的部分
  // propsOptions是子组件中的"props"选项
  const propsData = vm.$options.propsData || {}
  // 在vm的_props属性中保存一份
  const props = vm._props = {}
  // 缓存props key，以便后续更新时可以直接遍历key数组，而不是去遍历对象
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // 如果当前组件是根组件，则使用toggleObserving函数将shouldObserve设置为false
  // shouldObserve在obsere函数中有用到(src/core/observer/index.js 110行)，
  // 如果shouldObserve为false，则observe不会对传入的对象进行响应式观察
  if (!isRoot) {
    toggleObserving(false)
  }
  // 遍历"props"选项
  for (const key in propsOptions) {
    // 缓存props key
    keys.push(key)
    // props验证，这个我们放到后面说
    const value = validateProp(key, propsOptions, propsData, vm)

    // 这里省略了非生产环境下才执行的代码，主要是对一些非预期操作的提示

    // 这里将所有的属性转为getter/setter，并在getter中收集依赖，在set中通知更新，跟data选项最终的操作一样
    defineReactive(props, key, value)
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  // 重新将shouldObserve设置为true，根组件的props不需要响应式，其他组件还是需要的
  toggleObserving(true)
}
```

**从上面的代码中可以看到，Vue对传入的`props`同样是使用`defineReactive`函数进行响应式转换（设置`getter/setter`，跟`data`属性一样），而且各个属性都被代理到`vm`上一份，这使我们在代码中可以使用`this.xxx`来直接访问`props`属性，而不是使用`this._props.xxx`。使用到`props`数据的组件都会在`getter`中被收集为依赖，而`props`中的数据来自“父辈组件”（这在`validateProp`函数中可以看出来），`props`在使用父组件中的数据时，当前组件也会被父组件的`watcher`所收集，所以当父组件中的数据变化时，子组件就会进入异步更新队列，从而触发dom更新。我们可以在子组件中更新`props`吗？当然是可以的，就像操作`data`一样，但不建议这样做，这破坏了props单向数据流的规则，很难知道到底是哪个子组件修改了父组件数据，这会使我们的程序难以维护。**
```js
// src/core/util/props.js
export function validateProp (
  key: string,
  propOptions: Object,
  propsData: Object,
  vm?: Component
): any {
  const prop = propOptions[key]
  const absent = !hasOwn(propsData, key)
  // 这个propsData就是来自父组件
  let value = propsData[key]
  // ...
  return value
}
```

再看一下子组件接收`props`时是如何进行类型检查、数据验证以及设置默认值的。
```js
// validateProp函数对单个props属性进行验证
export function validateProp (
  key: string,
  propOptions: Object,
  propsData: Object,
  vm?: Component
): any {
  const prop = propOptions[key]
  const absent = !hasOwn(propsData, key)
  // 这个value是父组件传入的值
  let value = propsData[key]
  // 判断prop.type（接收props属性时设置的type，可以是数组，表示支持多种类型）
  // 是否为布尔类型，或者prop.type包含布尔类型
  const booleanIndex = getTypeIndex(Boolean, prop.type)
  // 大于-1表示prop.type是或者包含布尔类型
  if (booleanIndex > -1) {
      // 如果父组件没传这个值，而且propOptions中没有设置默认值（即default属性），
      // 则将value设置为false
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      // 上面是注释原文
      // 这里的意思是，如果布尔类型比字符串类型有更高的优先级（接收props属性时设置的type，
      // 只设置了布尔类型或者type为数组时，布尔类型在字符串类型之前），则在遇到value是空字符串
      // 或者和hyphenate(key)相同时（hyphenate的作用是将驼峰转为短横线连接），value会被设置
      // 为true，这个放到实际场景就容易理解了，当你使用一个具有disabled属性的组件时：
      // <component disabled></component>
      // <component disabled=''></component>
      // <component disabled='disabled'></component>
      // 是不是很熟悉？这样传值都会被转为true（当然前提是component组件中type设置要和上面说
      // 的一样），使用组件时如果只写了prop的key，向第一种情况，value是按空字符串接收的，然后
      // 再走验证和赋值
      const stringIndex = getTypeIndex(String, prop.type)
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
    }
  }
  if (value === undefined) {
    // 如果没有传，则给value赋默认值getPropDefaultValue函数的逻辑是：
    // 如果该prop属性没有设置default选项，则返回undefined
    // 如果default是函数而且该prop接收的不是函数类型，则调用default函数，否则返回default的值
    value = getPropDefaultValue(vm, prop, key)
    // since the default value is a fresh copy,
    // make sure to observe it.
    const prevShouldObserve = shouldObserve
    toggleObserving(true)
    observe(value)
    toggleObserving(prevShouldObserve)
  }
  if (
    process.env.NODE_ENV !== 'production' &&
    // skip validation for weex recycle-list child component props
    !(__WEEX__ && isObject(value) && ('@binding' in value))
  ) {
    assertProp(prop, key, value, vm, absent)
  }
  return value
}
```

如果父组件传入了`prop`，但子组件未显式接收，Vue是怎么处理的？  
在上面的分析中可知，父级调用子组件时传递的所有props键值对中被子组件显式接收的部分才会进行响应式处理，那没有接收的去哪儿了呢？它们都被保存在了`vm.$attrs`里，但向`style`、`class`等`html`标签原生属性则不会保存在这里，Vue会默认让子组件的根节点dom来继承这些属性，如果不想继承呢？可以在组件选项中使用`inheritAttrs: false`来禁用，这样除了`style`和`class`之外的原生属性就会出现在`$attrs`中，想怎么使用都可以。