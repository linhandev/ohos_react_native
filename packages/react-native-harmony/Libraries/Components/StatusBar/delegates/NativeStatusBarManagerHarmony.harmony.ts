/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as TurboModuleRegistry from '../../../TurboModule/TurboModuleRegistry';
import type { TurboModule } from '../../../TurboModule/RCTExport';

type NativeStatusBarManagerConstants = {
  HEIGHT: number;
  DEFAULT_BACKGROUND_COLOR?: string;
};

export interface Spec extends TurboModule {
  getConstants: () => NativeStatusBarManagerConstants;
  setColor: (color: number, animated: boolean) => void;
  setTranslucent: (translucent: boolean) => void;
  setStyle: (statusBarStyle: string) => void;
  setHidden: (hidden: boolean) => void;
}

const NativeModule = TurboModuleRegistry.getEnforcing<Spec>('StatusBarManager');

let constants: NativeStatusBarManagerConstants | null = null;

const NativeStatusBarManager: Spec = {
  getConstants(): NativeStatusBarManagerConstants {
    if (constants == null) {
      constants = NativeModule.getConstants();
    }
    return constants;
  },

  setColor(color: number, animated: boolean): void {
    NativeModule.setColor(color, animated);
  },

  setTranslucent(translucent: boolean): void {
    NativeModule.setTranslucent(translucent);
  },

  setStyle(statusBarStyle: string): void {
    NativeModule.setStyle(statusBarStyle);
  },

  setHidden(hidden: boolean): void {
    NativeModule.setHidden(hidden);
  },
};

export default NativeStatusBarManager;
