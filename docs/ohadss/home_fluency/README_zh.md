
# 介绍
本示例针对应用开发中相当常见的瀑布流页面场景，基于按需渲染、组件复用等技术，使用RN框架实现了高性能瀑布流页面。

## 运行效果图
![](./RNHomeFluency/screenshots/home_fluency.gif)

**操作流程：**
1. 下拉刷新页面，上拉加载更多数据（网络加载）；
2. 若当前瀑布流完整存在直播卡片，自动播放直播；
3. 点击首页tab回到顶部。

## 场景实现
详细场景实现，请参考[基于RN框架实现高性能瀑布流页面](https://developer.huawei.com/consumer/cn/forum/topic/0202160237461682658)。

# 工程目录
```
home_fluency
├── RNHomeFluency 前端工程
└── HomeFluency 原生工程
```

# 安装教程
1. 在 `RNHomeFluency` 中运行 **npm i @react-native-oh/react-native-harmony@x.x.x**或**yarn add @react-native-oh/react-native-harmony@x.x.x** 安装依赖，运行 **npm run dev** 生成bundle文件，运行 **npm start** 启动metro服务；
2. 在 `entry` 目录下执行 **ohpm i @rnoh/react-native-openharmony@x.x.x** 安装依赖；
3. 用 DevEco Studio 打开 `HomeFluency`，执行 **Sync and Refresh Project**，将RNHomeFluency/HomeFluency/entry拷贝替换HomeFluency/entry；
4. 回到 DevEco Studio，点击右上角的 **run** 启动项目；
5. 如果启动的是metro服务，还需要运行 `hdc rport tcp:8081 tcp:8081` 来转发8081端口，然后再在手机上重新打开应用。
