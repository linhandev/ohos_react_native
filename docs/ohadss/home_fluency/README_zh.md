
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
1. 替换 RNHomeFluency/package.json、HomeFluency/oh-package.json5 和 HomeFluency/entry/oh-package.json5 中的 @rnoh/react-native-openharmony 版本（可选：升级版本）。
2. 在 RNHomeFluency 中，运行 npm i --force 安装依赖，然后运行 npm run dev 生成打包文件，运行 npm start 启动 Metro 服务；
3. 在 DevEco Studio 中打开 HomeFluency，执行 同步并刷新项目，然后将 RNHomeFluency/HomeFluency/entry 复制并替换到 HomeFluency/entry；
4. 返回 DevEco Studio，点击右上角的 运行 按钮启动项目；
5. 如果 Metro 服务正在运行，还需要执行 hdc rport tcp:8081 tcp:8081 来转发 8081 端口，然后重新打开设备上的应用。