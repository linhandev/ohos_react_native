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
        cppOutputPath: "./multi_surface/src/main/cpp/generated"
      },
      autolinking: {
        excludeNpmPackages: ["@rnoh/react-native-harmony-gesture-handler"],
        etsRNOHPackagesFactoryPath: './multi_surface/src/main/ets/RNOHPackagesFactory.ets',
        cppRNOHPackagesFactoryPath: './multi_surface/src/main/cpp/RNOHPackagesFactory.h',
        cmakeAutolinkPath:'./multi_surface/src/main/cpp/autolinking.cmake',
      },
    }),
  ],
}
