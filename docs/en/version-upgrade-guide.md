# RN Framework Version Upgrade Guide

This document provides guidance for two upgrade scenarios: [Minor Version Upgrade](#minor-version-upgrade) (e.g., 0.72.x to 0.72.y) and [Major Version Upgrade](#major-version-upgrade) (e.g., 0.72.x to 0.77.x).

# Minor Version Upgrade

> Note: If you were previously using local dependencies, please first refer to [How to switch from local dependencies to remote dependencies](#how-to-switch-from-local-dependencies-to-remote-dependencies) to make the switch.

1. According to the version number in [Release Notes](./release-notes.md), upgrade the version of `@rnoh/react-native-openharmony` in the `dependencies` field of all `oh-package.json5` files.
2. Click `File->Sync and Refresh Project` to install the new dependencies.
3. Upgrade the version of `@react-native-oh/react-native-harmony` in the `package.json` in the root directory of the RN project.
4. Re-run `npm i` in the root directory of the RN project.

## How to switch from local dependencies to remote dependencies
### In native project
1. Delete the `dependencies` field in `entry/oh-package.json5`, example:
```diff
{
...
  "dependencies": {
- "@rnoh/react-native-openharmony": "./libs/react_native_openharmony-X.X.X.X.har"
  },
...
}
```
2. In the `entry` directory, run the following command:
```bash
ohpm i @rnoh/react-native-openharmony@x.x.x
```
### In RN project
1. Delete the `dependencies` field in the `package.json` in the root directory of the RN project, example:

```diff
...
  "dependencies": {
- "react-native-harmony": "file:../react-native-harmony/rnoh-react-native-harmony-x.x.x.tgz",
  },
...
```
2. In the `AwesomeProject` directory, run the following command to install the dependency:
  
```bash
npm i @react-native-oh/react-native-harmony@x.x.x
```
or
```bash
yarn add @react-native-oh/react-native-harmony@x.x.x
```
3. Modify the `metro.config.js` file, for example:

```diff
...
-  const {createHarmonyMetroConfig} = require('react-native-harmony/metro.config');
+  const {createHarmonyMetroConfig} = require('@react-native-oh/react-native-harmony/metro.config');
...
  module.exports = mergeConfig(getDefaultConfig(__dirname), createHarmonyMetroConfig({
-    reactNativeHarmonyPackageName: 'react-native-harmony',
+    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
  }), config);
```
> Note: If the imported package depends on other packages, please refer to [How to import rnoh dependencies in third-party libraries or custom modules](./common-development-scenarios.md#how-to-import-rnoh-dependencies-in-third-party-libraries-or-custom-modules).

## How to use local installation of HarmonyOS dependencies
### In native project
1. Place the dependency package in a custom path, example: `NativeProject/libs/react_native_openharmony-X.X.X.X.har`.
 
2. Modify the `dependencies` field in `entry/oh-package.json5`, example:
 
```diff
{
...
  "dependencies": {
+ "@rnoh/react-native-openharmony": "./libs/react_native_openharmony-X.X.X.X.har"
  },
...
}
```
### In RN project
1. Modify the `dependencies` field in the `package.json` in the root directory of the RN project, example:

```diff
...
  "dependencies": {
+ "react-native-harmony": "file:../react-native-harmony/rnoh-react-native-harmony-x.x.x.tgz",
  },
...
```

2. Ensure that there is a folder named `react-native-harmony-cli` in the parent directory where your `rnoh-react-native-harmony-x.x.x.tgz` file is located, and place the corresponding version of `rnoh-react-native-harmony-cli-x.x.x.tgz` file in that folder.

3. Modify the `metro.config.js` file, for example:

```diff
...
-  const {createHarmonyMetroConfig} = require('@react-native-oh/react-native-harmony/metro.config');
+  const {createHarmonyMetroConfig} = require('react-native-harmony/metro.config');
...
  module.exports = mergeConfig(getDefaultConfig(__dirname), createHarmonyMetroConfig({
-    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
+    reactNativeHarmonyPackageName: 'react-native-harmony',
  }), config);
```
> Note: If the imported package depends on other packages, please refer to [How to import rnoh dependencies in third-party libraries or custom modules](./common-development-scenarios.md#how-to-import-rnoh-dependencies-in-third-party-libraries-or-custom-modules).

# Major Version Upgrade

This section describes how to upgrade a RN project for OpenHarmony from 0.72.x to 0.77.x

1. Upgrade RN project dependency versions
    - The following are required dependencies to upgrade:
    ```json
    {
        ...
        "dependencies": {
            "react": "18.3.1",
            "react-native": "0.77.1"
        },
        "devDependencies": {
            "@react-native-community/cli": "15.0.1",
            "@react-native/babel-preset": "0.77.1",
        },
    }
    ```
    - If any of the above dependencies are missing in your 0.72 project, add them and ensure the versions match those listed.
    - `metro-react-native-babel-preset` is no longer needed due to upstream refactoring and can be removed.
    - The upstream community has also upgraded some development dependencies, which you may choose to follow:
    ```json
    {
        ...
        "devDependencies": {
            "@babel/core": "^7.25.2",
            "@babel/preset-env": "^7.25.3",
            "@babel/runtime": "^7.25.0",
            "@react-native-community/cli-platform-android": "15.0.1",
            "@react-native-community/cli-platform-ios": "15.0.1",
            "@react-native/eslint-config": "0.77.1",
            "@react-native/metro-config": "0.77.1",
            "@react-native/typescript-config": "0.77.1",
            "@types/jest": "^29.5.13",
            "@types/react": "^18.2.6",
            "@types/react-test-renderer": "^18.0.0",
            "eslint": "^8.19.0",
            "jest": "^29.6.3",
            "prettier": "2.8.8",
            "react-test-renderer": "18.3.1",
            "typescript": "5.0.4"
        }

    }
    ```
    - Tip: In VSCode, you can copy all devDependencies to the devDependencies of the project to be upgraded. Duplicate keys will be underlined; delete the old ones to complete the dependency addition and upgrade.
2. Upgrade/add RNOH frontend dependencies. Afterward, run `npm i` to install dependencies.
    - Upgrade dependencies: "react-native-harmony" or "@xxx/react-native-harmony"
      >Note: Keep the original package name. If the original `react-native-harmony` did not have an @organization prefix, do not add one when upgrading. If it had one, keep the previous "@xxx/react-native-harmony" name.
    - Add devDependencies: "@react-native-oh/react-native-harmony-cli"
    - For version numbers, see [RNOH Version Planning](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)
3. Modify two configurations (the second is optional). Only change the fields listed below:
    1. babel.config.js
        - If the file exists, modify the `presets` field in `module.exports`, replacing 'module:metro-react-native-babel-preset' with 'module:@react-native/babel-preset'.
        - If the file does not exist, create it as follows:
        ```jsx
        module.exports = {
          presets: ['module:@react-native/babel-preset'],
        };
        ```
    2. (Optional) tsconfig.json
        - Add devDependencies `"@react-native/typescript-config": "0.77.1"` in package.json
        - Change the `extends` field in tsconfig.json to:
        ```json
        {
            "extends": "@react-native/typescript-config/tsconfig.json"
        }
        ```
4. Build the frontend bundle
5. Update the `@rnoh/react-native-openharmony` dependency version in all `oh-package.json5` files in the OpenHarmony project. For version numbers, see [RNOH Version Planning](https://gitcode.com/openharmony-sig/ohos_react_native/wiki/RNOH版本演进规划和分支策略.md)
6. In the OpenHarmony project directory, run `ohpm i` or in DevEco Studio, click `File->Sync and Refresh Project` to install dependencies.
7. Build the application hap package, install, and test.

References:
- [AwesomeProject template project changes from 0.72.5 to 0.77.1](https://react-native-community.github.io/upgrade-helper/?from=0.72.5&to=0.77.1)
- [Upstream community non-compatible changes from 0.72.5 to 0.77.1](./upstream-community-non-compatible-changes.md)
- [Upstream Community ChangeLog](https://github.com/facebook/react-native/blob/main/CHANGELOG-0.7x.md#v0725)
