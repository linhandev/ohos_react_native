/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { mergeConfig, getDefaultConfig } = require('@react-native/metro-config');
const {
  createHarmonyMetroConfig,
} = require('@react-native-oh/react-native-harmony/metro.config');
const pathUtils = require('node:path');

const rnoh61ProjectRoot = __dirname;
const monorepoRoot = pathUtils.resolve(rnoh61ProjectRoot, '../../..');

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',

    /**
     * INTERNAL: We do it because RNOH isn't in node_modules (it's symlinked).
     */
    __reactNativeHarmonyPattern:
      pathUtils.sep + 'react-native-harmony' + pathUtils.sep,

    /**
     * INTERNAL: We do it because RNOH isn't in node_modules (it's symlinked).
     */
    __reactNativeInteropLibraryPackagePattern:
      pathUtils.sep + 'react-native-harmony-61-interop' + pathUtils.sep,
  }),
  {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    watchFolders: [
      /**
       * RNOH_APP: By default, Metro doesn't see files above the project root.
       * If you integrate RNOH 61 Interop package, you may need to add this file to your configuration.
       */
      pathUtils.resolve(__dirname, '..', 'legacy-rn61-project'),
      /**
       * INTERNAL: This is needed to make monorepo setup work.
       */
      monorepoRoot,
    ],
    resolver: {
      nodeModulesPaths: [
        /**
         * RNOH_APP: This configuration tells Metro where RNOH 0.77 dependencies can be found.
         */
        pathUtils.resolve(rnoh61ProjectRoot, 'node_modules'),
        /**
         * INTERNAL: This is needed to make monorepo setup work.
         */
        pathUtils.resolve(monorepoRoot, 'node_modules'),
      ],
      /**
       * RNOH_APP: node_modules from the legacy project can't be used. If this configuration is not provided,
       * Metro will use 2 different "reacts" likely resulting in "Invalid hook call" error.
       */
      blockList: [/legacy-rn61-project\/node_modules/],
    },
  }
);
