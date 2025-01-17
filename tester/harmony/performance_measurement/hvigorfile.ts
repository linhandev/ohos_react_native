import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHModulePlugin } from "@rnoh/hvigor-plugin"

export default {
  system: hapTasks,
  plugins: [
    createRNOHModulePlugin({
      codegen: {
        rnohModulePath: "./react_native_openharmony",
        cppOutputPath: "./performance_measurement/src/main/cpp/generated"
      },
      autolinking: {
        excludeNpmPackages: [
          "@react-native-oh-tpl/react-native-fs",
          "@react-native-oh-tpl/react-native-safe-area-context",
        ],
        etsRNOHPackagesFactoryPath: './performance_measurement/src/main/ets/RNOHPackagesFactory.ets',
        cppRNOHPackagesFactoryPath: './performance_measurement/src/main/cpp/RNOHPackagesFactory.h',
        cmakeAutolinkPath:'./performance_measurement/src/main/cpp/autolinking.cmake',
      },
    }),
  ],
}
