import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHModulePlugin } from "@rnoh/hvigor-plugin"

export default {
  system: hapTasks,
  plugins: [
    createRNOHModulePlugin({
      codegen: {
        rnohModulePath: "./react_native_openharmony",
      }
    }),
  ],
}
