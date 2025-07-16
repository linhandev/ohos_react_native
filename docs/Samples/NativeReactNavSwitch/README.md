# Description

This is a demo project showcasing navigation between native and RN pages.

## Directory Structure

```md
NativeReactNavSwitch
├── NavigationProject -- RN project
└── NavigationApp -- Native project
```

## Environment Setup
1. In the `NavigationProject/MainProject` directory, run **npm run setup** to install dependencies and run **npm run dev** to generate the bundle;
2. Open `NavigationApp` in DevEco Studio and run **Sync and Refresh Project**;
3. Click File > Project Structure > Signing Configs, log in and complete the signing;
4. Click **run** in the upper right corner to start the project.

> NOTE: The project uses the latest RNOH dependencies by default during installation. If you need to install a specific version, please refer to [RNOH Version Evolution Planning and Branch Strategy](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md) to get the version number.
> 
> npm dependency installation: `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm dependency installation: `ohpm i @rnoh/react-native-openharmony@0.77.xx`

## Preview
After successfully running the demo project, open the application as shown below:  
![NativeReactNavSwitch Application Home Page](../../zh-cn//figures/NativeReactNavSwitch-首页.png)

**Navigate to RN Page B**
Operation: Click the "Navigate to RN Page B" button on the home page to navigate to RN Page B.
Effect: As shown below  
![NativeReactNavSwitch RN Page B](../../zh-cn//figures/NativeReactNavSwitch-RN页面B.png)

**Navigate to Native Page C**
Operation: Click the "Navigate to Native Page C" button on RN Page B to navigate to Native Page C.
Effect: As shown below  
![NativeReactNavSwitch Native Page C](../../zh-cn//figures/NativeReactNavSwitch-原生页面C.png)

**Return to RN Page B**
Operation: Click the "Back to Previous Page" button on Native Page C or swipe back to return to RN Page B.
Effect: As shown below  
![NativeReactNavSwitch RN Page B](../../zh-cn//figures/NativeReactNavSwitch-RN页面B.png)

**Return to Native Page A**
Operation: Click the "Back to Previous Page" button on RN Page B or swipe back to return to Native Page A.
Effect: As shown below  
![NativeReactNavSwitch Native Page A](../../zh-cn//figures/NativeReactNavSwitch-首页.png)
