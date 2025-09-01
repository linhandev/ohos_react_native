## Target Audience

RNOH 61 Interop Package Maintainers.

## About This Project

This is an internal project for testing `react-native-harmony-61-interop` package. `rnoh-entry` project can be moved to `legacy-rn61-project`. In our monorepo setup, `rnoh-entry` nested inside `legacy-rn61-project` generate issues with react-native CLI so for our internal purposes it's better to keep those projects side by side.

`legacy-rn61-project` isn't a part of the monorepo because symlinks wasn't supported in that version of RN. That project was created with react-native-community/cli v3.

## How to run this project?

### OpenHarmony

Similarly to the RNOH tester. Read [project-setup.md](../../docs/rnoh-maintainers/project-setup.md).
However, there's one more extra step. You need to generate `react-native-openharmony.har` file in react-native-harmony project. To do it run `pnpm build:rnoh` from the project root level directory. 
This file needs to be manually regenerated whenever `packages/tester/harmony/react_native_openharmony` is modified.

### Android

#### Preparation

1. To run the legacy project on Android you need older environment that is older Node.js. This project uses `.node-version` files (https://github.com/shadowspawn/node-version-usage) to define which node version should be used in a given directory. On MacOS, you can use the `asdf` tool to automatically switch node version based on the current working directory ([asdf requires some configuration](https://asdf-vm.com/guide/getting-started.html), it also doesn't doesn't by default support .node-version but you can enable it by adding `legacy_version_file = yes` to `~/.asdfrc`).

1. The legacy project isn't part of the monorepo because Metro used by react-native 61 doesn't support symlinks. Therefore, you need to install NPM dependencies explicitly by running `npm i` after navigating to `packages/react-native-harmony-61-interop-tester/legacy-rn61-project`(`pnpm i` in that project by default triggers the monorepo install).

1. Make sure you have the correct JDK version installed. RN 61 uses JDK 8. You can use `jenv` to manage multiple JDK versions on your machine. If you don't have it installed, you can follow the instructions in the [jenv documentation](https://www.jenv.be/). Jenv doesn't install JDKs, so you will have to install JDK 8 manually. There are some problems with openjdk, so I recommend using Temurin which can be installed via homebrew with `brew install --cask temurin@8` or with [`apt install temurin-8-jdk`](https://adoptium.net/en-GB/installation/linux). You can add it to jenv with `jenv add /Library/Java/JavaVirtualMachines/temurin-8.jdk/Contents/Home`. (On Linux, or when using other JDK distributions, the path will be different)

NOTE: gradlew should install the correct android SDK version automatically.

#### Run on Android

⚠️ IMPORTANT: The tester currently crashes on Android 16 (API 36). Use Android 15 or lower.

1. Run `npm run android` in the `legacy-rn61-project` directory.

NOTE: Normally, React Native 0.61 projects would use `"metro-react-native-babel-preset": "^0.56.0"`, but due to changes introduced in babel we use `^0.59.0`. Otherwise, the bundle won't work. You might need to clear metros cache with `--reset-cache` if you used a different version of the preset before.
