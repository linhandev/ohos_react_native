# 说明

这是一个使用 FrameNode 进行 bundle 预加载的 demo 工程。

# 目录结构

GenerateBundle -- RN 侧工程  
FrameNodeSampleApp -- 原生工程

# 环境搭建

1. 将 rnoh-react-native-harmony-xx.tgz 放到 GenerateBundle/react-native-harmony 文件夹下，并修改 GenerateBundle/package.json 的依赖路径；
2. 将 rnoh-react-native-harmony-cli-xx.tgz 放到 GenerateBundle/react-native-harmony-cli 文件夹下，并修改 GenerateBundle/package.json 的依赖路径；
3. 在 GenerateBundle 中运行**npm i**安装依赖，运行**npm run dev**生成 bundle；
4. 将 react_native_openharmony-xxx.har 放到 FrameNodeSampleApp/libs 文件夹下，并修改 FrameNodeSampleApp/entry/ `oh-package.json5`的依赖路径；
5. 用 DevEco Studio 打开 FrameNodeSampleApp，执行 **Sync and Refresh Project**；
6. 点击右上角的 **run** 启动项目。
