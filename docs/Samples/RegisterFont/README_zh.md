# 说明

这个项目包含了两个演示：一个演示原生侧注册字体的方法，另一个演示RN侧使用字体的效果。

## 目录结构

```
├── RegisterFontNativeProject
|   └── Index.ets
|       ├── fontResourceByFontFamily # OpenHarmony 侧注册字体的方法1
|       └── rnInstance.registerFont # OpenHarmony 侧自定义注册字体的方法2，随时可以注册字体文件
└── RegisterFontRnProject
    └── example.tsx  # React Native 侧展示使用字体的效果
```

## OpenHarmony 侧

1. **fontResourceByFontFamily**: 常规注册字体方法，创建实例时注册
2. **rnInstance.registerFont**: 找到对应的rnInstance可随时注册字体

## React Native 侧

1. **使用字体文件**: 使用 `example.tsx` 中的代码，直接使用OpenHarmony 侧注册的字体

## 环境搭建

1. 在 `RegisterFontRnProject` 目录下执行 **npm i** 安装依赖，执行 **npm run dev** 生成 bundle；
2. 用 DevEco Studio 打开 `RegisterFontNativeProject`，执行 **Sync and Refresh Project**；
3. 点击 File > Project Structure > Signing Configs，登录并完成签名；
4. 点击右上角的 **run** 启动项目；

> NOTE: 安装时项目默认使用最新的RNOH依赖，如需安装特定版本请查阅[RNOH版本演进规划和分支策略](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)获取版本号。
> 
> npm依赖安装： `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm依赖安装：`ohpm i @rnoh/react-native-openharmony@0.77.xx`

## 注意事项

- 确保 OpenHarmony 和 React Native 项目配置正确，以便文件可以在两个系统之间无缝传递与加载。
- 沙箱路径的使用和文件访问权限需要根据具体环境进行调整。

## 效果预览
- 默认字体  
- 常规注册字体  
- rnInstance.registerFont方法注册字体  

![注册字体运行效果图](../../zh-cn/figures/注册字体运行效果图.png)