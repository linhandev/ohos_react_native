# Getting Started

This guide is aimed at developers starting a new React Native project on the OpenHarmony platform. If you plan to integrate RNOH with an existing React Native or OpenHarmony project, refer to [Integrating RNOH with Existing RN or OH App Project](./environment-setup.md) document after finishing this guide.

## Prerequisites

- Familiarity with setting up environment variables on your operating system.
- Proficiency with running shell commands.

## Environment Setup

### DevEco Studio

Provides the software tools required for developing OpenHarmony and HarmonyOS NEXT applications.

1. [Download and Install DevEco Studio](https://developer.huawei.com/consumer/en/doc/harmonyos-guides/ide-software-install) (HUAWEI ID account required).
1. Configure a device:
    - [Run Your App on a Real Device](https://developer.huawei.com/consumer/en/doc/harmonyos-guides/ide-run-device) or
    - [Setup Emulator](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/ide-run-emulator) (it can be problematic outside China)

1. Set `DEVECO_SDK_HOME` environment variable and reload terminal.
    #### macOS
    Add the following snippet to one of the following files `~/.bash_profile`, `~/.bashrc`, or `~/.zshrc`

    ```sh
    export DEVECO_SDK_HOME="/Applications/DevEco-Studio.app/Contents/sdk" # required, used by react-native-openharmony CLI
    export PATH=$PATH:$DEVECO_SDK_HOME/default/openharmony/toolchains # optional, exports "hdc"
    ```

    #### Other Platforms
    Find the OpenHarmony SDK directory and set the `DEVECO_SDK_HOME` environment variable.

### Node.js

Node.js provides tools like `npm` and `npx`, essential for installing React Native OpenHarmony and its dependencies. It also provides an environment to execute cross-platform code utilized, for example by `@react-native-oh/react-native-harmony-cli`.

Install Node.js (and Watchman on macOS) by following the [React Native set up instructions](https://reactnative.dev/docs/0.77/set-up-your-environment).

## Initialize RNOH Project

To quickly start a new RNOH project, navigate to the desired directory and run the following snippet in a terminal.

<!-- TODO: Remove this warning once RNOH 0.77 is released -->
> WARNING: The following script assumes that RNOH 0.77 has been released, which is not the case at the time this document was written.

```
npx --yes @react-native-community/cli@latest init AwesomeProject --version 0.77.1 --skip-install &&
cd ./AwesomeProject &&
npm i @react-native-oh/react-native-harmony@0.77 @react-native-oh/react-native-harmony-cli@0.77 -D &&
npx react-native init-harmony --bundle-name com.rnoh.awesome_project
```

After `init-harmony` runs successfully without errors, follow the instruction in the terminal to run your app on a device.

## Node Package Managers

The React Native Ecosystem is built on top of [Node.js packages](https://nodejs.org/api/packages.html). There are three notable Node Package Managers to choose from. The script above uses NPM for its simplicity. However, you may consider other options based on your project needs.

### npm
The default node package manager shipped with Node.js. It is suitable for React Native projects unless the project uses a monorepo architecture.

### yarn
A popular node package manager in the React Native community. It is maintained by Meta, alongside React Native, Metro, and Hermes. For monorepo setups, Metro relies on the `node_modules` structure that Yarn creates.

### pnpm
A popular node package manager. For monorepos, pnpm [can be configured](https://pnpm.io/settings#nodelinker) to mirror the `node_modules` structure used by Yarn.

## React Native Frameworks

React Native documentation encourages the use of [React Native Frameworks](https://github.com/react-native-community/discussions-and-proposals/blob/main/proposals/0759-react-native-frameworks.md). However, at the time of writing this document, there is only one well-known React Native Framework — [Expo](https://expo.dev/), which does not support this platform. Therefore, if you plan to develop a cross-platform application, you must use React Native directly. This means you also take the framework responsibilities, particularly for Navigation and Routing (related: [NativeReactNavSwitch Sample](../Samples/NativeReactNavSwitch/README.md)).

---

Next guide: [Manage JavaScript bundles](./rn-js-bundle.md)