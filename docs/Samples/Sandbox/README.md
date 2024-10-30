### README

这个项目包含两个演示，一个演示如何在 HarmonyOS 侧将 raw 文件推送到沙箱并成功加载，另一个演示如何在 React Native 侧加载沙箱中的图片。

#### 目录结构

```
├── SandBoxNativeProject
|   └── Index.ets
|       ├── downloadBundle # HarmonyOS 侧推送 raw 文件到沙箱中
|       └── new FileJSBundleProvider #HarmonyOS 侧加载沙箱中的文件
└── SandBoxRnProject
    └── example.tsx  # React Native 侧加载沙箱中的图片

```

#### HarmonyOS 侧

1. **将文件推送到沙箱**: 使用 `downloadBundle` 函数的 getRawFileContent 方法将 rwaFile 中的文件推送到沙箱，以便之后的读取操作。
2. **加载文件**: 使用 `new FileJSBundleProvider` 类从沙箱中加载文件并验证其内容。

#### React Native 侧

1. **加载沙箱中的图片**: 使用 `example.tsx` 中的代码，从 HarmonyOS 沙箱中加载图片，并在 React Native 应用中显示。

#### 运行步骤

1. 将 rnoh-react-native-harmony-xx.tgz 放到 Sandbox/react-native-harmony 文件夹下，并修改 SandBoxRnProject/package.json 的依赖路径；
2. 将 rnoh-react-native-harmony-cli-xx.tgz 放到 Sandbox/react-native-harmony-cli 文件夹下，并修改 SandBoxRnProject/package.json 的依赖路径；
3. 将 react_native_openharmony-xxx.har 放到 SandBoxNativeProject/libs 文件夹下，并修改 SandBoxNativeProject/entry/ `oh-package.json5`的依赖路径；
4. 在 SandBoxRnProject 中执行 **npm i** 安装依赖；
5. 在 SandBoxRnProject 中执行 **npm run dev** 命令打包；
6. 用 DevEco Studio 打开 SandBoxNativeProject **Sync and Refresh Project**；
7. 点击右上角的 **run** 启动项目；
8. 确保鸿蒙和 rn 侧依赖下载无缺，版本配套正常；
9. 打开生成的 app 来确认文件已正确加载。

#### 注意事项

- 确保 HarmonyOS 和 React Native 项目配置正确，以便文件可以在两个系统之间无缝传递与加载。
- 沙箱路径的使用和文件访问权限需要根据具体环境进行调整。

---
