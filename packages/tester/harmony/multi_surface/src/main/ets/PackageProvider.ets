import type {RNPackageContext} from 'rnoh/ts';
/**
 * Importing ets files from top level barrel file doesn't work.
 */
import SamplePackage from 'rnoh-sample-package/src/main/ets/SamplePackage';
import { createRNOHPackages as createRNOHPackagesAutolinking } from "./RNOHPackagesFactory"

import { RNOHPackage } from 'rnoh';

export function createRNPackages(ctx: RNPackageContext): RNOHPackage[] {  return [
  ...createRNOHPackagesAutolinking(ctx),
  new SamplePackage(ctx), // comment this line out when testing SamplePackage autolinking
]
}
