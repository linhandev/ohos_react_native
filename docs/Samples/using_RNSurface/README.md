# 说明
这是一个使用RNSurface的demo工程。


# 目录结构
SampleProject -- RN侧工程  
SampleApp -- 原生工程


# 环境搭建
1. 将 rnoh-react-native-harmony-xx.tgz 放到 SampleProject/react-native-harmony 文件夹下；
2. 将 rnoh-react-native-harmony-cli-xx.tgz 放到 SampleProject/react-native-harmony-cli 文件夹下；
3. 将 react_native_openharmony-xxx.har 放到 SampleApp/libs 文件夹下，并修改 SampleApp/oh-package.json5 和 SampleApp/entry/oh-package.json5 的依赖路径；
4. 在 SampleProject/MainProject 中将 **package.json** 中的 **react-native-harmony** 的版本号修改成本地包(react-native-harmony文件夹下)的版本号，执行 **npm i** 安装依赖；
5. 在 SampleProject/MainProject 中执行 **npm run dev** 命令打包；
6. 用 DevEco Studio 打开 SampleApp，执行 **Sync and Refresh Project**；
7. 点击右上角的 **run** 启动项目。

