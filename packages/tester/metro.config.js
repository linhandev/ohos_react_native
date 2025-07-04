// @ts-check
const {mergeConfig, getDefaultConfig} = require('@react-native/metro-config');
const {
  createHarmonyMetroConfig,
} = require('@react-native-oh/react-native-harmony/metro.config');
const pathUtils = require('node:path');

const projectRoot = __dirname;
const monorepoRoot = pathUtils.resolve(projectRoot, '../..');

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
    /**
     * This property is internal. We do it because RNOH isn't in node_modules (it's symlinked).
     */
    __reactNativeHarmonyPattern:
      pathUtils.sep + 'react-native-harmony' + pathUtils.sep,
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
    watchFolders: [monorepoRoot],
    resolver: {
      nodeModulesPaths: [
        pathUtils.resolve(projectRoot, 'node_modules'),
        pathUtils.resolve(monorepoRoot, 'node_modules'),
      ],
    },
  },
);
