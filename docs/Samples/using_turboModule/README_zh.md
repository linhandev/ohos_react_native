# 说明

这是一个使用TurboModule的demo工程

## 目录结构

```md
using_turboModule
├── SampleProject RN侧工程
└── SampleApp 原生工程
```

## 环境搭建

1. 在 `SampleProject/MainProject` 目录下执行 **npm i** 安装依赖，执行 **npm run dev** 生成 bundle；
2. 用 DevEco Studio 打开 `SampleApp`，执行 **Sync and Refresh Project**；
3. 点击 File > Project Structure > Signing Configs，登录并完成签名；
4. 点击 DevEco Studio 右上角的 **run** 启动项目；

> NOTE: 安装时项目默认使用最新的RNOH依赖，如需安装特定版本请查阅[RNOH版本演进规划和分支策略](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)获取版本号。
> 
> npm依赖安装： `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm依赖安装：`ohpm i @rnoh/react-native-openharmony@0.77.xx`

## 效果预览

启动后页面效果如下：

![using_turboModule运行界面](./screenshots/Screenshot.jpeg)

1. 点击【•调用TurboModule回调方法】按钮，会有返回结果（... from native side）回填到按钮；
1. 点击【•调用TurboModule异步方法】按钮，会有返回结果（rejected on native side）回填到按钮；
1. 点击【•调用原生console.log方法】按钮，会在DevEco控制台打印日志（在Native中打印日志）；
1. 点击【•调用TurboModule2的test方法】按钮，手机界面上会有一个alert弹框，提示“调用 SampleTurboModule2 的 Test”；
1. 点击【•调用TurboModule2的getObject方法】按钮，手机界面上会有一个alert弹框，提示“{ "x": 100 }”；
1. 点击【•调用TurboModule2的getRequest方法】按钮，手机界面上会有一个alert弹框，里面打印网络请求返回的内容；
1. 点击【•调用TurboModule2的eatFruit方法】按钮，手机界面上会有一个alert弹框，提示“正在吃水果，大菠萝很好吃。颜色呢？透明的”；
1. 点击【•调用TurboModule2的checkPwd方法】按钮，手机界面上会有一个alert弹框，提示“checkPwd success!”；
1. 点击【•调用WorkerTurboModule回调方法：】按钮，会有返回结果（... from native worker side）回填到按钮；
1. 点击【•调用WorkerTurboModule异步回调方法：】按钮，会有返回结果（rejected on native worker side）回填到按钮；
1. 点击【•在worker线程中调用原生console.log方法：】按钮，会在DevEco控制台打印日志（在Native的worker线程中打印日志）。
