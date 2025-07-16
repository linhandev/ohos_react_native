# README

This is a demo project that does not inherit the RNAbilty and switches from the native page to the RN page.

## Directory Structure

```shell
├── NativeProject -- Native project
└── RNProject -- RN project
```

## Environment Setup

1. In the `RNProject` directory, execute **npm i** to install dependencies, then execute **npm run dev** to generate the bundle;
2. Open `NativeProject` with DevEco Studio, execute **Sync and Refresh Project**;
3. Click File > Project Structure > Signing Configs, log in and complete the signing;
4. Click **run** in the upper right corner to start the project.

> NOTE: By default, the project uses the latest RNOH dependency during installation. If you need to install a specific version, please refer to [RNOH Version Evolution Planning and Branch Strategy](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md) to get the version number.
> 
> npm dependency installation: `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm dependency installation: `ohpm i @rnoh/react-native-openharmony@0.77.xx`

## Preview

After successfully running the demo project, the application should be as shown below
![demo_without_rnAbility app homepage](../../zh-cn/figures/demoWithoutRNAbility-App首页.jpg)

**Navigate to RN Page**
Click the "Open RN App" button in the middle of the homepage to jump to the RN page, the result should be as shown below
![demo_without_rnAbility RN page](../../zh-cn/figures/demoWithoutRNAbility-RN页面.jpg)


## Notes

1. Actively call the `windowSizeChange` method to monitor screen size changes, call `this.rnInstancesCoordinator?.onWindowSizeChange` to set the correct screen size, otherwise there will be problems with abnormal font size.
