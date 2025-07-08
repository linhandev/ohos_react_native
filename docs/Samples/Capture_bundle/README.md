# README

This is a sample project that supports capturing exceptions within bundles.

## Directory Structure

```shell
├── NativeProject -- Native project
└── ReactProject -- RN project
```

## Environment Setup

1. In the `ReactProject` directory, execute **npm i** to install dependencies, then execute **npm run dev** to generate the bundle;
2. Open `NativeProject` with DevEco Studio, execute **Sync and Refresh Project**;
3. Click File > Project Structure > Signing Configs, log in and complete the signing;
4. Click **run** in the upper right corner to start the project.

> NOTE: By default, the project uses the latest RNOH dependency during installation. If you need to install a specific version, please refer to [RNOH Version Evolution Planning and Branch Strategy](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md) to get the version number.
> 
> npm dependency installation: `npm i @react-native-oh/react-native-harmony@0.77.xx` `npm i --save-dev @react-native-oh/react-native-harmony-cli@0.77.xx`
> 
> ohpm dependency installation: `ohpm i @rnoh/react-native-openharmony@0.77.xx`

## Preview

After launch, the page effects are as follows:

<table style="width: 100%; margin: 0 auto; text-align: center;">
  <thead>
    <tr>
      <th style="width: 20%;">
        <img src="./screenshots/Screenshot_home.jpeg" alt="Screenshot_home">
      </th>
      <th style="width: 20%;">
        <img src="./screenshots/Screenshot_reference.jpeg" alt="Screenshot_reference">
      </th>
      <th style="width: 20%;">
        <img src="./screenshots/Screenshot_standard.jpeg" alt="Screenshot_standard">
      </th>
      <th style="width: 20%;">
        <img src="./screenshots/Screenshot_Frozen.jpeg" alt="Screenshot_Frozen">
      </th>
      <th style="width: 20%;">
        <img src="./screenshots/Screenshot_Warning.jpeg" alt="Screenshot_Warning">
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="width: 20%;">
        Home Page
      </td>
      <td style="width: 20%;">
        Click [ReferenceError] button
      </td>
      <td style="width: 20%;">
        Click [Standard Error] button
      </td>
      <td style="width: 20%;">
        Click [Frozen Error] button
      </td>
      <td style="width: 20%;">
        Click [Warning] button
      </td>
    </tr>
  </tbody>
</table>
