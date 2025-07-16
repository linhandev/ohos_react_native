# 说明

这是一个使用 FrameNode 进行 bundle 预加载的 demo 工程

## 目录结构

```md
FrameNodeSample
├── GenerateBundle -- RN 侧工程
└── FrameNodeSampleApp -- 原生工程
```

## 环境搭建

1. 在 `GenerateBundle` 目录下执行 **npm i** 安装依赖，执行 **npm run dev** 生成 bundle；
2. 用 DevEco Studio 打开 `FrameNodeSampleApp`，执行 **Sync and Refresh Project**；
3. 点击 File > Project Structure > Signing Configs，登录并完成签名；
4. 点击右上角的 **run** 启动项目。

> NOTE: 安装时项目默认使用最新的RNOH依赖，如需安装特定版本请查阅[RNOH版本演进规划和分支策略](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)获取版本号。
> 
> npm依赖安装： `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm依赖安装：`ohpm i @rnoh/react-native-openharmony@0.77.xx`


## 效果预览

在成功运行demo工程之后，打开应用如下图所示：
![FrameNode Sample应用首页](../../zh-cn/figures/framenode_app首页界面图.png)

**RN 分列列表bundle预加载**
操作：点击首页中间的按钮，跳转到新页面中，框内加载出RN bundle中的分列列表。
效果：如下图所示
![FrameNode Sample节点容器页面](../../zh-cn/figures/framenode_节点容器界面图.png)
