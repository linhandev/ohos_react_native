# 说明
这是获取RNSurface对应RNInstance与rootTag的demo工程。


# 目录结构

```md
RootTagSample
├── ReactProject RN前端工程
├── NativeProject 鸿蒙工程
├── react-native-harmony RN鸿蒙化包
├── react-native-harmony-cli RN鸿蒙化手脚架
└── README.md
```


# 环境搭建
1. 将 `rnoh-react-native-harmony-xx.tgz` 放到 `react-native-harmony` 文件夹下，然后修改 `ReactProject/package.json` 的 `react-native-harmony` 依赖路径；
2. 将 `rnoh-react-native-harmony-cli-xx.tgz` 放到 `react-native-harmony-cli` 文件夹下；
3. 在 `ReactProject` 中运行 **npm i** 安装依赖，运行 **npm run dev** 生成bundle文件；
4. 将 `react_native_openharmony-xxx.har` 放到 `NativeProject/libs` 文件夹下，并修改 `NativeProject/oh-package.json5` 和 `NativeProject/entry/oh-package.json5` 的依赖路径；
5. 用 DevEco Studio 打开 NativeProject，执行 **Sync and Refresh Project**；
6. 点击右上角的 **run** 启动项目。
