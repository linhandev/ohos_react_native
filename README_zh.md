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

## 使用说明

- React Native的使用问题可查阅[React Native 官网](https://reactnative.dev/)或[React Native 中文网](https://reactnative.cn/)。
- RNOH的使用问题可查阅[中文文档](./docs/zh-cn/README.md)或[英文文档](./docs/en/README.md)。

## 版本说明
当前已发布以下正式版本，请从[发行版](https://gitee.com/openharmony-sig/ohos_react_native/releases)中获取对应版本。
- [RNOH v5.0.0.500（2024-08-27）](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.500.md)
- [RNOH v5.0.0.601（2024-09-26）](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.601.md)
- [RNOH v5.0.0.715（2024-10-25）](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.715.md)
- [RNOH v5.0.0.812（2025-12-14）](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.812.md)
- [RNOH v5.0.0.813（2025-12-26）](./docs/zh-cn/release-notes/react-native-harmony-v5.0.0.813.md)

## 分支说明
1. master分支：主干演进分支。
2. 0.72.5-ohos-5.0-release分支：配套OpenHarmony 5.0的release分支。
3. dev分支：开发分支。