# React Native for OpenHarmony (RNOH)

欢迎阅读React Native for OpenHarmony文档，参与React Native for OpenHarmony开发者文档开源项目，与我们一起完善开发者文档。

## 启动

### 前提条件

#### 安装了HarmonyOS NEXT的模拟器或真机

该项目需要HarmonyOS NEXT上进行测试。

#### 华为开发者账号

运行应用程序时，需要用到华为开发者账号进行签名。

#### DevEco Studio

从[官网](https://developer.huawei.com/consumer/cn/deveco-studio/)下载并安装最新版本 DevEco Studio。

### 启动项目

> 如果是编译源码，在拉取工程后需要在工程的根目录执行`git submodule update --init --recursive`命令，拉取三方库依赖。

1. 打开终端（命令行工具）并导航到react-native-harmony-cli目录，然后执行 `npm i && npm pack`。
1. 在终端中导航到react-native-harmony-sample-package目录，然后执行 `npm i && npm pack`。
1. 导航到tester目录，然后执行 `npm run i` （不是 npm i）。
1. 在tester目录中运行 `npm start` 以启动Metro服务器。
1. 设置`RNOH_C_API_ARCH`环境变量的值为`1`，具体参考[配置CAPI版本环境变量](docs/zh-cn/环境搭建.md#set_capi_path)。
1. 在DevEco Studio中打开 `tester/harmony` 项目并等待后台同步完成。
1. 连接设备。
1. 点击 File > Project Structure > Signing Configs，登录并完成签名。
1. 选择 `entry`（右上角）。
1. 点击【Run 'entry'】按钮（右上角）运行项目。

**说明：** 该tester项目工程主要用于开发自测试各种用例场景，如果在运行tester中的用例时遇到问题，通过提issues来咨询。

## 使用说明

- React Native的使用问题可查阅[React Native 官网](https://reactnative.dev/)或[React Native 中文网](https://reactnative.cn/)。
- RNOH的使用问题可查阅[中文文档](./docs/zh-cn/README.md)或[英文文档](./docs/en/README.md)。


**版本管理说明**

**一、版本演进规划**
1.**稳定版本发布体系**
- 基于React Native 0.72.5的HarmonyOS适配版本(当前主干)

**最新稳定版本**:
- [RNOH v5.0.0.813(2024-12-26)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.813.md)

**历史版本归档**:
- [RNOH v5.0.0.812(2024-12-14)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.812.md)
- [RNOH v5.0.0.715(2024-10-25)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.715.md)
- [RNOH v5.0.0.601(2024-09-26)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.601.md)
- [RNOH v5.0.0.500(2024-08-27)](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.500.md)

2.**开发中版本路线图**
- React Native 0.77.1 HarmonyOS适配版本(开发代号)
- 预计2025年第三季度发布生产环境可以版本
- 当前处于架构适配阶段(技术预览分支开放)

**二、代码分支策略**  
|分支名称|生命周期状态|使用规范说明|  
| ----------- | -------------|--------------|
|0.72.5-ohos-5.0-release|生产维护分支|获取所有稳定版本源码的基准分支|  
|master|主干开发分支|技术演进基线，非生产构建推荐源| 
|0.77.1-rc.1-ohos|技术预览分支|新特性适配分支(开发测试专用)| 
|dev/partner-dev|协作开发分支|功能开发沙箱环境| 
|其他分支|临时工作分支|特定场景技术验证分支|

**重要通告**:  
0.72.5-ohos-5.0-release分支已于2025年1月23日完成代码结构调整与合规性优化，历史CommitID已变更。请开发者通过'git fetch --all'更新仓库，确保获取最新代码基线。