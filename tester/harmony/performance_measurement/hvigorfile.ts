import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHHvigorPlugin } from "@rnoh/hvigor-plugin"

export default {
  system: hapTasks,
  plugins: [
    createRNOHHvigorPlugin({
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
