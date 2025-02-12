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
        cppOutputPath: "./performance_measurement/src/main/cpp/generated"
      },
      autolinking: {
        excludeNpmPackages: ["@rnoh/react-native-harmony-gesture-handler"],
        etsRNOHPackagesFactoryPath: './performance_measurement/src/main/ets/RNOHPackagesFactory.ets',
        cppRNOHPackagesFactoryPath: './performance_measurement/src/main/cpp/RNOHPackagesFactory.h',
        cmakeAutolinkPath: './performance_measurement/src/main/cpp/autolinking.cmake',
      },
    }),
  ],
}
