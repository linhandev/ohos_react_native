# Description

This is the demo project for obtaining RNInstance and RootTag corresponding to RNSurface. It demonstrates sending messages to a specific RNSurface (such as the flight ticket page in the demo) through the `RNInstance.emitDeviceEvent` method.

## Directory Structure

```md
RootTagSample
├── ReactProject RN front-end project
├── NativeProject OpenHarmony project
└── README.md
```

## Environment Setup
1. In the `ReactProject` directory, run **npm i** to install dependencies and run **npm run dev** to generate the bundle;
2. Open `NativeProject` in DevEco Studio and run **Sync and Refresh Project**;
3. Click File > Project Structure > Signing Configs, log in and complete the signing;
4. Click **run** in the upper right corner to start the project.

> NOTE: The project uses the latest RNOH dependencies by default during installation. If you need to install a specific version, please refer to [RNOH Version Evolution Planning and Branch Strategy](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md) to get the version number.
> 
> npm dependency installation: `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm dependency installation: `ohpm i @rnoh/react-native-openharmony@0.77.xx`

## Preview
- Interface before RootTag message sending

![RootTag running interface](../../zh-cn/figures/RootTag消息发送前.png)

- RootTag message sending  
Steps: Click `CLICK ME`  
Effect:  

![RootTag running interface](../../zh-cn/figures/RootTag消息发送后.png)
