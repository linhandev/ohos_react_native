import { Config } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandPackHarmony,
  commandUnpackHarmony,
  commandCreateMetroConstantsHarmony,
  commandCodegenHarmony,
  commandVerifyPackageHarmony,
  commandCodegenLibHarmony,
  commandLinkHarmony,
} from './commands';

export const config = {
  commands: [
    commandBundleHarmony,
    commandPackHarmony,
    commandUnpackHarmony,
    commandCreateMetroConstantsHarmony,
    commandCodegenHarmony,
    commandVerifyPackageHarmony,
    commandCodegenLibHarmony,
    commandLinkHarmony,
  ],
} satisfies Partial<Config>;
