/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  MetroJSBundleProvider,
  RNApp,
  RNOHErrorDialog,
  ResourceJSBundleProvider,
  RNOHCoreContext,
  AnyJSBundleProvider
} from '@rnoh/react-native-openharmony';
import { getRNOHPackages } from '../PackageProvider';

@Entry
@Component
struct Index {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined

  build() {
    Column() {
      if (this.rnohCoreContext) {
        if (this.rnohCoreContext?.isDebugModeEnabled) {
          RNOHErrorDialog({ ctx: this.rnohCoreContext })
        }
        RNApp({
          rnInstanceConfig: {
            name: "tester61",
            createRNPackages: getRNOHPackages,
            fontResourceByFontFamily: {},
            imageSourceByName: {
              "legacy_image": "resource://app/media/legacy_image.png",
            },
            enableDebugger: this.rnohCoreContext?.isDebugModeEnabled,
          },
          appKey: "tester61",
          jsBundleProvider: this.rnohCoreContext?.isDebugModeEnabled ?
            new AnyJSBundleProvider([
              MetroJSBundleProvider.fromServerIp("localhost", 8085),
              new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'hermes_bundle.hbc'),
            ]) :
            /**
             * NOTE: The HBC format is recommended for Hermes in a production environment. HBC provides better performance and loading times.
             */
            new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'hermes_bundle.hbc'),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
