// Script for compiling build behavior. It is built in the build plug-in and cannot be modified currently.
export { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHHvigorPlugin } from "@rnoh/hvigor-plugin"

export default {
  system: hapTasks,
  plugins: [
    createRNOHHvigorPlugin({
      codegen: {
        rnohModulePath: "./react_native_openharmony",
      }
    }),
  ],
}
