# Description

This is a demo project using TurboModule.

## Directory Structure

```md
using_turboModule
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

![using_turboModule Interface](./screenshots/Screenshot.jpeg)

1. Click the 【•Call TurboModule callback method】 button, and the return result (... from native side) will be filled back to the button;
2. Click the 【•Call TurboModule async method】 button, and the return result (rejected on native side) will be filled back to the button;
3. Click the 【•Call native console.log method】 button, and logs will be printed in the DevEco console (print logs in Native);
4. Click the 【•Call TurboModule2's test method】 button, and an alert dialog will appear on the phone interface, prompting "Call SampleTurboModule2's Test";
5. Click the 【•Call TurboModule2's getObject method】 button, and an alert dialog will appear on the phone interface, prompting "{ "x": 100 }";
6. Click the 【•Call TurboModule2's getRequest method】 button, and an alert dialog will appear on the phone interface, printing the content returned by the network request;
7. Click the 【•Call TurboModule2's eatFruit method】 button, and an alert dialog will appear on the phone interface, prompting "Eating fruit, big pineapple is delicious. What about the color? Transparent";
8. Click the 【•Call TurboModule2's checkPwd method】 button, and an alert dialog will appear on the phone interface, prompting "checkPwd success!";
9. Click the 【•Call WorkerTurboModule callback method:】 button, and the return result (... from native worker side) will be filled back to the button;
10. Click the 【•Call WorkerTurboModule async callback method:】 button, and the return result (rejected on native worker side) will be filled back to the button;
11. Click the 【•Call native console.log method in worker thread:】 button, and logs will be printed in the DevEco console (print logs in Native's worker thread).
