# Description
This is the demo project for RNOH Autolinking.


# Directory Structure

```md
AutolinkingSample
├── NativeProject harmony工程
├── react-native-oh RNOH前端及手脚架
├── ReactProject 前端工程
├── screenshots 效果图
├── third-party-library-sample RN三方件示例
└── README.md
```


# Environment Setup

1. Save `react-native-oh-react-native-harmony-0.77.xx.tgz` and `react-native-oh-react-native-harmony-cli-0.77.xx.tgz` to the `react-native-oh` folder.
1. Run **npm pack** in `third-party-library-sample` to generate a .tgz file.
1. Modify the `@react-native-oh/react-native-harmony` and `@react-native-oh/react-native-harmony-cli` dependency path of `ReactProject/package.json`.
1. Run **npm i** in `ReactProject` to install the dependency.
1. Modify the `@rnoh/hvigor-plugin` dependency path of `NativeProject/hvigor/hvigor-config.json5`；
1. Open `NativeProject` in DevEco Studio and run **Sync and Refresh Project**.
1. Click File > Project Structure > Signing Configs, log in and complete the signing.
1. Run **npm start** in `ReactProject` to start Metro.
1. Click **run** in the upper right corner to start the project.
