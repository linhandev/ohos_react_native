import { Config, Command } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandCodegenHarmony,
  commandVerifyPackageHarmony,
  commandCodegenLibHarmony,
  commandLinkHarmony,
  commandRunHarmony,
  commandInitHarmony,
  commandCleanHarmony,
} from './commands';

export const config = {
  commands: [
    commandBundleHarmony,
    commandCodegenHarmony,
    commandVerifyPackageHarmony,
    commandCodegenLibHarmony,
    commandLinkHarmony,
    commandRunHarmony,
    commandInitHarmony,
    commandCleanHarmony
  ] as Command[],
} satisfies Partial<Config>;
