# 说明

一个多jsBundle和多rnInstance的demo工程

## 目录结构

```md
MutilBundleSample
├── FlightRN 机票前端工程
├── HotelRN 酒店前端工程
├── NativeProject 鸿蒙工程
└── README.md
```

## 使用方法

1. 在 `FlightRN` 中运行 **npm i** 安装依赖，运行 **npm run dev:all** 生成机票的jsBundle。
2. 在 `HotelRN` 中运行 **npm i** 安装依赖，运行 **npm run dev:all** 生成酒店的jsBundle。
3. 在 `NativeProject/entry` 目录下执行 **ohpm i** 安装依赖。
4. 用 DevEco Studio 打开 `NativeProject`，执行 **Sync and Refresh Project**。
5. 点击 File > Project Structure > Signing Configs，登录并完成签名。
6. 点击右上角的 **run** 启动项目。

> NOTE: 安装时项目默认使用最新的RNOH依赖，如需安装特定版本请查阅[RNOH版本演进规划和分支策略](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)获取版本号。
> 
> npm依赖安装： `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm依赖安装：`ohpm i @rnoh/react-native-openharmony@0.77.xx`

## 效果预览

启动后页面效果如下：

| ![Screenshot_home](./screenshots/Screenshot_home.jpeg) | ![Screenshot_hotel](./screenshots/Screenshot_hotel.jpeg) | ![Screenshot_flight](./screenshots/Screenshot_flight.jpeg) |
|:--:|:--:|:--:|
| 首页 | 前往酒店页面 | 前往机票页面 |
