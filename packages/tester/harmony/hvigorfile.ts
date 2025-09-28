import { appTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHProjectPlugin } from '@rnoh/hvigor-plugin';

export default {
  system: appTasks,
  plugins: [
    createRNOHProjectPlugin({
      nodeModulesPath: "../../../node_modules",
      bundler: {
        config: "../metro.config.js",
        bundleOutput: "./entry/src/main/resources/rawfile/bundle.harmony.js",
        assetsDest: "./entry/src/main/resources/rawfile/assets",
      }
    })
  ],
};
