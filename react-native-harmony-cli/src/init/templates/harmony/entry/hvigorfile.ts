import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHHvigorPlugin } from '@rnoh/hvigor-plugin';

export default {
  system: hapTasks,
  plugins: [
    createRNOHHvigorPlugin({
      codegen: {
        rnohModulePath: './react_native_openharmony',
      },
    }),
  ],
};
