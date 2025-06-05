# React Native for OpenHarmony (RNOH)

本项目为 [React Native](https://reactnative.dev/) 跨平台应用开发框架添加 [OpenHarmony](https://www.openharmony.cn/mainPlay) 平台支持

| 角色 / Role                                | 中文文档                            | English Docs                     |
| ------------------------------------------ | ----------------------------------- | -------------------------------- |
| 应用开发者 / Application Developer         | [README.md](./docs/zh-cn/README.md) | [README.md](./docs/en/README.md) |
| 库开发者 / Library Developer               | —                                   | —                                |
| 维护者或贡献者 / Maintainer or Contributor | [启动开发](#启动开发)               | —                                |


## RNOH版本演进规划和分支策略
您可以在[RNOH版本演进规划和分支策略](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH%E7%89%88%E6%9C%AC%E6%BC%94%E8%BF%9B%E8%A7%84%E5%88%92%E5%92%8C%E5%88%86%E6%94%AF%E7%AD%96%E7%95%A5.md)中了解更多关于我们对React Native的OpenHarmony适配版本的说明。

## 启动开发

### 前置条件

1. HarmonyOS NEXT 模拟器或真机：本项目需要在HarmonyOS NEXT上进行测试
2. 华为开发者账号：运行应用程序时，需要用到[华为开发者账号](https://developer.huawei.com/consumer/cn/personalcenter/overview)对应用进行签名
3. DevEco Studio：从[官网](https://developer.huawei.com/consumer/cn/deveco-studio/)下载并安装最新版本 DevEco Studio
4. 参考[官网指导](https://nodejs.org/en/download)安装 Node.js >= 18的版本

### 框架开发

> 您可以连接测试机或模拟器后在bash中执行如下命令，之后直接从第8步开始
> 
> `git clone https://gitcode.com/openharmony-sig/ohos_react_native.git && cd ohos_react_native && git switch 0.77.1-rc.1-ohos && npm install -g pnpm@latest-10 && pnpm init-ws && pnpm dev`

1. 拉取本项目代码 `git clone https://gitcode.com/openharmony-sig/ohos_react_native.git`
2. 进入项目目录 `cd ohos_react_native`
3. 对 React Native 0.77 版本的适配当前在特性分支上进行，切换到该分支 `git switch 0.77.1-rc.1-ohos`
4. 安装pnpm `npm install -g pnpm@latest-10`
5. 进行项目初始化 `pnpm init-ws` （过程中会拉取一批submodule和安装npm依赖，受网速影响可能耗时较长）
6. 连接设备并开启usb调试功能，或启动模拟器
7. 启动 metro 和测试工具 `pnpm dev`
8. 在 DevEco Studio 中打开 `packages/tester/harmony` 项目并等待后台同步完成
9. 点击 File > Project Structure > Signing Configs，登录并完成签名
10. 在右上角选择项目配置下拉中选中 `entry`
11. 点击右上角绿色三角箭头【Run 'entry'】按钮，运行项目

**说明：** tester项目主要在开发过程中用于自测试，如在运行tester中的用例时遇到问题，请提[issue](https://gitcode.com/openharmony-sig/ohos_react_native/issues)咨询。

## 使用说明

- React Native的使用问题可查阅[React Native 官网](https://reactnative.dev/)或[React Native 中文网](https://reactnative.cn/)。
- RNOH的使用问题可查阅[中文文档](./docs/zh-cn/README.md)或[英文文档](./docs/en/README.md)。
