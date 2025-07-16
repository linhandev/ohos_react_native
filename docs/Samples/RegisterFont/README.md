# Description

This project contains two demonstrations: one shows how to register fonts on the native side, and the other demonstrates the effect of using fonts on the RN side.

## Directory Structure

```
├── RegisterFontNativeProject
|   └── Index.ets
|       ├── fontResourceByFontFamily # OpenHarmony font registration method 1
|       └── rnInstance.registerFont # OpenHarmony custom font registration method 2, can register font files at any time
└── RegisterFontRnProject
    └── example.tsx  # React Native side demonstrates the effect of using fonts
```

## OpenHarmony Side

1. **fontResourceByFontFamily**: Regular font registration method, register when creating instance
2. **rnInstance.registerFont**: Find the corresponding rnInstance to register fonts at any time

## React Native Side

1. **Using Font Files**: Use the code in `example.tsx` to directly use fonts registered on the OpenHarmony side

## Environment Setup

1. In the `RegisterFontRnProject` directory, run **npm i** to install dependencies and run **npm run dev** to generate the bundle;
2. Open `RegisterFontNativeProject` in DevEco Studio and run **Sync and Refresh Project**;
3. Click File > Project Structure > Signing Configs, log in and complete the signing;
4. Click **run** in the upper right corner to start the project;

> NOTE: The project uses the latest RNOH dependencies by default during installation. If you need to install a specific version, please refer to [RNOH Version Evolution Planning and Branch Strategy](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md) to get the version number.
> 
> npm dependency installation: `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm dependency installation: `ohpm i @rnoh/react-native-openharmony@0.77.xx`

## Notes

- Ensure that OpenHarmony and React Native projects are configured correctly so that files can be seamlessly transferred and loaded between the two systems.
- The use of sandbox paths and file access permissions need to be adjusted according to the specific environment.

## Preview
- Default font  
- Regular registered font  
- rnInstance.registerFont method registered font  

![Font registration effect screenshot](../../zh-cn/figures/注册字体运行效果图.png)
