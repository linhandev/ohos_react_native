import mustache from 'mustache';

const TEMPLATE = `
const {mergeConfig, getDefaultConfig} = require('@react-native/metro-config');
const {
  createHarmonyMetroConfig,
} = require('@rnoh/react-native-harmony/metro.config');

/**
 * @type {import("metro-config").MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@rnoh/react-native-harmony',
  }),
  config,
);

`;

export class MetroConfigTemplate {
  constructor() {}

  build(): string {
    return mustache.render(TEMPLATE.trimStart(), {});
  }
}
