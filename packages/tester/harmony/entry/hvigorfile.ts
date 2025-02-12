import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHModulePlugin } from "@rnoh/hvigor-plugin"

export default {
  system: hapTasks,
  plugins: [
    createRNOHModulePlugin({
      nodeModulesPath: "../../../node_modules",
      codegen: {
        projectRootPath: "../../../",
        rnohModulePath: "./react_native_openharmony",
      },
      autolinking: {
        excludeNpmPackages: ["@rnoh/react-native-harmony-gesture-handler"],
      }
    }),
  ],
}
