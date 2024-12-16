import { Config, Command } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandCodegenHarmony,
  commandVerifyPackageHarmony,
  commandCodegenLibHarmony,
  commandLinkHarmony,
  commandRunHarmony,
  commandInitHarmony,
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
  ] as Command[],
} satisfies Partial<Config>;
