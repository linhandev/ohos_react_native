# Description

This is a demo project using RNSurface.

## Directory Structure

```md
using_RNSurface
├── SampleProject RN project
└── SampleApp Native project
```

## Environment Setup

1. In the `SampleProject/MainProject` directory, run **npm i** to install dependencies, then run **npm run dev** to generate the bundle;
2. Open `SampleApp` in DevEco Studio and run **Sync and Refresh Project**;
3. Click File > Project Structure > Signing Configs, log in and complete the signing;
4. Click **run** in the upper right corner of DevEco Studio to start the project;

> NOTE: The project uses the latest RNOH dependencies by default during installation. If you need to install a specific version, please refer to [RNOH Version Evolution Planning and Branch Strategy](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md) to get the version number.
> 
> npm dependency installation: `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm dependency installation: `ohpm i @rnoh/react-native-openharmony@0.77.xx`

## Preview

The page effect after startup is as follows:

![using_RNSurface Interface](./screenshots/Screenshot.jpeg)
