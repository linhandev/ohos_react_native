import { Config } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandCodegenHarmony,
  commandVerifyPackageHarmony,
  commandCodegenLibHarmony,
  commandLinkHarmony,
} from './commands';

export const config = {
  commands: [
    commandBundleHarmony,
    commandCodegenHarmony,
    commandVerifyPackageHarmony,
    commandCodegenLibHarmony,
    commandLinkHarmony,
  ],
} satisfies Partial<Config>;
