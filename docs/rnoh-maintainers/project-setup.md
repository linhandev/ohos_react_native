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
```
registry=https://repo.huaweicloud.com/repository/npm/
@ohos:registry=https://repo.harmonyos.com/npm/
```

In order to download NPM dependencies from the SWM git repository, you will have to create the personal access token and save it as an environment variable.

#### Creating the Access Token on GitLab

1. Press the `Edit profile` button on GitLab (press on your avatar on the navbar and then on the button).
1. Select `Access Tokens` tab in the menu on the left side.
1. Fill the `Token name` field (e.g. it can be `rnoh`) and select the `api` scope in the `Select scopes` form.
1. Press the `Create personal access token` button.
1. Copy the token.

#### Saving the Access Token in Environment Variables

##### macOS
1. Create a new password in Keychain Access app.
1. Append `export RNOH_NPM_TOKEN="$(security find-generic-password -w -s 'YOUR_PASSWORD_NAME')"` to `~/.zshrc`.
1. Save it and reload terminals.

##### Windows

1. Press `Win + R` to open the Windows Run prompt.
1. Type in `sysdm.cpl` and click `Ok`.
1. Go to the `Advanced` tab.
1. Press on the `Environment Variables` button.
1. Add the new user environment variable by pressing the `New` button under the User variables section.
1. Set variable name to `RNOH_NPM_TOKEN` and paste your access token in the variable value field.

You can find more details about GitLab access tokens in the [GitLab documentation](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)

## Running the `tester` App for the First Time on a Physical Device

1. Set DEVECO_SDK_HOME environment variable (macOS: `/Applications/DevEco-Studio.app/Contents/sdk`)
1. On the [project repository](https://gl.swmansion.com/rnoh/react-native-harmony) page press the "Code" button and copy the URL labelled "Clone with HTTPS".
1. Navigate to the directory where you want to store project files in your terminal.
1. Run the `git clone` command to clone the repository (replace the `<url>` with the copied url of this remote repository).
1. Navigate to the tester directory.
1. Run `npm run i` (not `npm i`).
1. Run `npm start` in the tester directory to start the Metro server.
1. Open `packages/tester/harmony` project in DevEco Studio and wait for background jobs to finish.
1. Connect the device.
1. Go to File > Project Structure > Signing Configs and Sign In to generate signature, and then press OK.
1. Select 'entry' run configuration (top right corner).
1. Press the `Debug 'entry'` button (top right corner).