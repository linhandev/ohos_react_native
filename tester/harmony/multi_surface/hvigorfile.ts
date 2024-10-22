import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHHvigorPlugin } from "@rnoh/hvigor-plugin"

export default {
  system: hapTasks,
  plugins: [
    createRNOHHvigorPlugin({
      codegen: {
        rnohModulePath: "./react_native_openharmony",
        cppOutputPath: "./multi_surface/src/main/cpp/generated"
      },
      autolinking: {
        excludeNpmPackages: [
          "@react-native-oh-tpl/react-native-fs",
          "@react-native-oh-tpl/react-native-safe-area-context",
        ],
        etsRNOHPackagesFactoryPath: './multi_surface/src/main/ets/RNOHPackagesFactory.ets',
        cppRNOHPackagesFactoryPath: './multi_surface/src/main/cpp/RNOHPackagesFactory.h',
        cmakeAutolinkPath:'./multi_surface/src/main/cpp/autolinking.cmake',
      },
    }),
  ],
}
