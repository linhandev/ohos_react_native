# Project Setup

## Prerequisites

### Access to Emulator or to a Device with OpenHarmony OS Installed on it

The emulator is currently available for authorized users only. This project is tested on HarmonyOS NEXT.

### HUAWEI ID

HUAWEI ID is needed to sign the app when running on a physical device.

### DevEco Studio

1. Download the latest (5.0.5.300) DevEco Studio from [File Storage repo](https://gl.swmansion.com/rnoh/file-storage).
1. Unpack all .partX.rar archives.
1. Install DevEco Studio.
1. Test if the installation was successful by opening and closing DevEco Studio.

NOTE: The SDK version expected by this project can be found in: `packages/tester/harmony/build-profile.template.json5::app::products[0]::compatibleSdkVersion`.

### NPM Setup

DevEco Studio tools require global .npmrc configuration that changes target repository for packages prefixed with @ohos to the Huawei NPM repository.

`~/.npmrc`

```txt
registry=https://repo.huaweicloud.com/repository/npm/
@ohos:registry=https://repo.harmonyos.com/npm/
```

### Install PNPM

Follow [official instructions](https://pnpm.io/installation) or run `npm install -g pnpm@latest-10`

## Running the `tester` App for the First Time on a Physical Device

1. Set DEVECO_SDK_HOME environment variable (macOS: `/Applications/DevEco-Studio.app/Contents/sdk`)
1. On the [project repository](https://gl.swmansion.com/rnoh/react-native-harmony) page press the "Code" button and copy the URL labelled "Clone with HTTPS".
1. Navigate to the directory where you want to store project files in your terminal.
1. Run the `git clone` command to clone the repository (replace the `<url>` with the copied url of this remote repository).
1. Navigate to the project directory.
1. Run `pnpm init-ws`.
1. Run `pnpm dev`.
1. Open `packages/tester/harmony` project in DevEco Studio and wait for background jobs to finish.
1. Connect the device.
1. Go to File > Project Structure > Signing Configs and Sign In to generate signature, and then press OK.
1. Select 'entry' run configuration (top right corner).
1. Press the `Debug 'entry'` button (top right corner).
