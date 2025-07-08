# Description

A demo project with multiple JSBundles and RNInstances.

## Directory Structure

```md
MutilBundleSample
├── FlightRN Frontend project for the flight module
├── HotelRN Frontend project for the hotel module
├── NativeProject OpenHarmony project
└── README.md
```

## Usage

1. Run **npm i** in `FlightRN` to install dependencies and run **npm run dev:all** to generate JS bundle for this module.
2. Run **npm i** in `HotelRN` to install dependencies and run **npm run dev:all** to generate JS bundle for this module.
3. In `NativeProject/entry` directory, run **ohpm i** to install dependencies.
4. Open `NativeProject` in DevEco Studio and run **Sync and Refresh Project**.
5. Click File > Project Structure > Signing Configs, log in and create signing config.
6. Click **run** in the upper right corner to start the project.

> NOTE: The project uses the latest RNOH dependencies by default. If you need to install a specific version, please refer to [RNOH Version Evolution Plan and Branch Strategy](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)
> 
> npm dependencies installation: `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm dependencies installation: `ohpm i @rnoh/react-native-openharmony@0.77.xx`

## Result

| ![Screenshot_home](./screenshots/Screenshot_home.jpeg) | ![Screenshot_hotel](./screenshots/Screenshot_hotel.jpeg) | ![Screenshot_flight](./screenshots/Screenshot_flight.jpeg) |
| :----------------------------------------------------: | :------------------------------------------------------: | :--------------------------------------------------------: |
|                       Home Page                        |                        Hotel Page                        |                        Flight Page                         |
