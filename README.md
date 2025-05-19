# React Native for OpenHarmony (RNOH)

本项目为 [React Native](https://reactnative.dev/) 跨平台应用开发框架添加 [OpenHarmony](https://www.openharmony.cn/mainPlay) 平台支持

## 启动开发

### 前置条件

1. HarmonyOS NEXT 模拟器或真机：本项目需要在HarmonyOS NEXT上进行测试
2. 华为开发者账号：运行应用程序时，需要用到[华为开发者账号](https://developer.huawei.com/consumer/cn/personalcenter/overview)对应用进行签名
3. DevEco Studio：从[官网](https://developer.huawei.com/consumer/cn/deveco-studio/)下载并安装最新版本 DevEco Studio

### 框架开发

> 您可以连接测试机或模拟器后在bash中执行如下命令，之后直接从第7步开始
> 
> `git clone https://gitcode.com/openharmony-sig/ohos_react_native.git && cd ohos_react_native && git switch 0.77.1-rc.1-ohos && pnpm init-ws && pnpm dev`

1. 拉取本项目代码 `git clone https://gitcode.com/openharmony-sig/ohos_react_native.git`
2. 进入项目目录 `cd ohos_react_native`
3. 对 React Native 0.77 版本的适配当前在特性分支上进行，切换到该分支 `git switch 0.77.1-rc.1-ohos`
4. 进行项目初始化 `pnpm init-ws` （过程中会拉取一批submodule和安装npm依赖，受网速影响可能耗时较长）
5. 连接设备并开启usb调试功能，或启动模拟器
6. 启动 metro 和测试工具 `pnpm dev`
7. 在 DevEco Studio 中打开 `packages/tester/harmony` 项目并等待后台同步完成
8. 点击 File > Project Structure > Signing Configs，登录并完成签名
9. 在右上角选择项目配置下拉中选中 `entry`
10. 点击右上角绿色三角箭头【Run 'entry'】按钮，运行项目

**说明：** tester项目主要在开发过程中用于自测试，如在运行tester中的用例时遇到问题，请提[issue](https://gitcode.com/openharmony-sig/ohos_react_native/issues)咨询。

## 使用说明

- React Native的使用问题可查阅[React Native 官网](https://reactnative.dev/)或[React Native 中文网](https://reactnative.cn/)。
- RNOH的使用问题可查阅[中文文档](./docs/zh-cn/README.md)或[英文文档](./docs/en/README.md)。

## 版本管理说明

### 一、版本演进规划
1.**稳定版本**
- 基于React Native 0.72.5的HarmonyOS适配版本(当前主干)

**最新稳定版本**:
- [RNOH v5.0.0.813(2024-12-26)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.813.md)

**历史版本归档**:
- [RNOH v5.0.0.812(2024-12-14)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.812.md)
- [RNOH v5.0.0.715(2024-10-25)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.715.md)
- [RNOH v5.0.0.601(2024-09-26)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.601.md)
- [RNOH v5.0.0.500(2024-08-27)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.500.md)

2.**开发中版本**
- React Native 0.77.1 HarmonyOS适配版本(开发代号)
- 预计2025年第三季度发布生产环境可用版本
- 当前处于架构适配阶段(在技术预览分支开放)

### 二、代码分支策略

| 分支名称                | 生命周期状态 | 使用规范说明                   |
| ----------------------- | ------------ | ------------------------------ |
| 0.72.5-ohos-5.0-release | 生产维护分支 | 获取所有稳定版本源码的基准分支 |
| master                  | 主干开发分支 | 技术演进基线，非生产构建推荐源 |
| 0.77.1-rc.1-ohos        | 技术预览分支 | 新特性适配分支(开发测试专用)   |
| dev/partner-dev         | 协作开发分支 | 功能开发沙箱环境               |
| 其他分支                | 临时工作分支 | 特定场景技术验证分支           |

**重要通告**:  
0.72.5-ohos-5.0-release分支于2025年1月23日进行了代码结构调整与合规性优化，历史CommitID已变更。请开发者通过'git fetch --all'更新仓库，确保获取最新代码基线。
