import { Config, Command } from '@react-native-community/cli-types';
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
  ] as Command[],
} satisfies Partial<Config>;
