## Target Audience

RNOH 61 Interop Package Maintainers.

## About This Project
This is an internal project for testing `react-native-harmony-61-interop` package. `rnoh-entry` project can be moved to `legacy-rn61-project`. In our monorepo setup, `rnoh-entry` nested inside `legacy-rn61-project` generate issues with react-native CLI so for our internal purposes it's better to keep those projects side by side.

`legacy-rn61-project` isn't a part of the monorepo because symlinks wasn't supported in that version of RN. That project was created with react-native-community/cli v3.

## How to run this project?

### OpenHarmony
Similarly to the RNOH tester. Read [project-setup.md](../../docs/rnoh-maintainers/project-setup.md). 

### Android

#### Preparation
1. To run the legacy project on Android you need older environment that is older Node.js. This project uses `.node-version` files (https://github.com/shadowspawn/node-version-usage) to define which node version should be used in a given directory. On MacOS, you can use `asdf` tool to automatically switch node version based on the current working directory (by default asdf doesn't support .node-version files but you can enable this behavior by adding `legacy_version_file = yes` to `~/.asdfrc`).

1. The legacy project isn't part of the monorepo because Metro used by react-native 61 doesn't support symlinks. Therefore, you need to install NPM dependencies explicitly by running `npm i` after navigating to that project (`pnpm i` in that project by default triggers the monorepo install). 

1. Android native environment needs to be configured for RN 0.61. This step needs to be updated with instructions...

#### Run
1. `npm run dev`
1. In new terminal, `npm run android`
