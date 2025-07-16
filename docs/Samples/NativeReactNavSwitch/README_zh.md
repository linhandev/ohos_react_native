# 说明

这是一个原生页面和RN页面相互跳转的demo工程

## 目录结构

```md
NativeReactNavSwitch
├── NavigationProject -- RN侧工程
└── NavigationApp -- 原生工程
```

## 环境搭建
1. 在 `NavigationProject/MainProject` 目录下执行 **npm run setup** 安装依赖，执行 **npm run dev** 生成 bundle；
2. 用 DevEco Studio 打开 `NavigationApp`，执行 **Sync and Refresh Project**；
3. 点击 File > Project Structure > Signing Configs，登录并完成签名；
4. 点击右上角的 **run** 启动项目。

> NOTE: 安装时项目默认使用最新的RNOH依赖，如需安装特定版本请查阅[RNOH版本演进规划和分支策略](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)获取版本号。
> 
> npm依赖安装： `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm依赖安装：`ohpm i @rnoh/react-native-openharmony@0.77.xx`

## 效果预览
在成功运行demo工程之后，打开应用如下图所示：  
![NativeReactNavSwitch的应用首页](../../zh-cn//figures/NativeReactNavSwitch-首页.png)

**导航到RN页面B**
操作：点击首页的跳转到RN页面B按钮，导航到RN页面B。
效果：如下图所示  
![NativeReactNavSwitch的RN页面B](../../zh-cn//figures/NativeReactNavSwitch-RN页面B.png)

**导航到原生页面C**
操作：点击RN页面B的跳转到原生页面C按钮，导航到原生页面C。
效果：如下图所示  
![NativeReactNavSwitch的原生页面C](../../zh-cn//figures/NativeReactNavSwitch-原生页面C.png)

**回到RN页面B**
操作：点击原生页面C的回到上一个页面按钮或侧滑返回，回到RN页面B。
效果：如下图所示  
![NativeReactNavSwitch的RN页面B](../../zh-cn//figures/NativeReactNavSwitch-RN页面B.png)

**回到原生页面A**
操作：点击RN页面B的回到上一个页面按钮或侧滑返回，回到原生页面A。
效果：如下图所示  
![NativeReactNavSwitch的原生页面A](../../zh-cn//figures/NativeReactNavSwitch-首页.png)
