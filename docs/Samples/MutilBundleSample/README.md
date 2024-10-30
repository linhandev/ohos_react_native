# 说明
这是一个多jsBundle和多rnInstance的demo工程。


# 目录结构

```md
MutilBundleSample
├── FlightRN 机票前端工程
├── HotelRN 酒店前端工程
├── NativeProject 鸿蒙工程
├── react-native-harmony RN鸿蒙化包
├── react-native-harmony-cli RN鸿蒙化手脚架
└── README.md
```


# 环境搭建
1. 将 `rnoh-react-native-harmony-xx.tgz` 放到 `react-native-harmony` 文件夹下，然后修改 `FlightRN/package.json` 和 `HotelRN/package.json` 的 `react-native-harmony` 依赖路径；
2. 将 `rnoh-react-native-harmony-cli-xx.tgz` 放到 `react-native-harmony-cli` 文件夹下；
3. 在 `FlightRN` 中运行 **npm i** 安装依赖，运行 **npm run dev:all** 生成机票的jsBundle；
4. 在 `HotelRN` 中运行 **npm i** 安装依赖，运行 **npm run dev:all** 生成酒店的jsBundle；
5. 将 `react_native_openharmony-xxx.har` 放到 `NativeProject/libs` 文件夹下，并修改 `NativeProject/oh-package.json5` 和 `NativeProject/entry/oh-package.json5` 的依赖路径；
6. 用 DevEco Studio 打开 NativeProject，执行 **Sync and Refresh Project**；
7. 点击右上角的 **run** 启动项目。

