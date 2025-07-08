# 说明

这是一个不继承RNAbilty，由原生页面跳转到RN页面的demo工程。

## 目录结构

```shell
├── NativeProject -- 原生工程
└── RNProject -- RN 工程
```

## 环境搭建

1. 在 `RNProject` 目录下执行 **npm i** 安装依赖，执行 **npm run dev** 生成 bundle；
2. 用 DevEco Studio 打开 `NativeProject`，执行 **Sync and Refresh Project**；
3. 点击 File > Project Structure > Signing Configs，登录并完成签名；
4. 点击右上角的 **run** 启动项目。

> NOTE: 安装时项目默认使用最新的RNOH依赖，如需安装特定版本请查阅[RNOH版本演进规划和分支策略](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)获取版本号。
> 
> npm依赖安装： `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm依赖安装：`ohpm i @rnoh/react-native-openharmony@0.77.xx`

## 效果预览

在成功运行demo工程之后，打开应用如下图所示：
![demo_without_rnAbility的应用首页](../../zh-cn/figures/demoWithoutRNAbility-App首页.jpg)

**导航到RN页面**
操作：点击首页中间的打开RN应用按钮，跳转到RN页面。
效果：如下图所示
![demo_without_rnAbility的RN页面](../../zh-cn/figures/demoWithoutRNAbility-RN页面.jpg)


## 注意事项

1. 主动调用`windowSizeChange`方法监听屏幕尺寸变化，调用`this.rnInstancesCoordinator?.onWindowSizeChange`设置正确的屏幕尺寸，否则会出现字体size不正常的问题。