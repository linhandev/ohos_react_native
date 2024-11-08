import { Config, Command } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandCodegenHarmony,
  commandVerifyPackageHarmony,
  commandCodegenLibHarmony,
  commandLinkHarmony,
  commandRunHarmony,
} from './commands';

export const config = {
  commands: [
    commandBundleHarmony,
    commandCodegenHarmony,
    commandVerifyPackageHarmony,
    commandCodegenLibHarmony,
    commandLinkHarmony,
    commandRunHarmony,
  ] as Command[],
} satisfies Partial<Config>;
