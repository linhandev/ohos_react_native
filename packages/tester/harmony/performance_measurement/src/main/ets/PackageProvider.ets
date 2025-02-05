import type { RNPackageContext, RNPackage } from 'rnoh/ts';
/**
 * Importing ets files from top level barrel file doesn't work.
 */
import SamplePackage from 'rnoh-sample-package/src/main/ets/SamplePackage';

import { FsPackage } from '@react-native-oh-tpl/react-native-fs/ts';
import {
  SafeAreaViewPackage
} from '@react-native-oh-tpl/react-native-safe-area-context/src/main/ets/SafeAreaViewPackage'
import { createRNOHPackages } from './RNOHPackagesFactory';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    ...createRNOHPackages(ctx),
    new SamplePackage(ctx),
    new FsPackage(ctx),
    new SafeAreaViewPackage(ctx)
  ];
}
