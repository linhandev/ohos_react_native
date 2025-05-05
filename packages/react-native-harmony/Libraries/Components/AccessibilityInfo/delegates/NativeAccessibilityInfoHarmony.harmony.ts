/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as TurboModuleRegistry from '../../../TurboModule/TurboModuleRegistry';
import type { TurboModule } from '../../../TurboModule/RCTExport';

export interface Spec extends TurboModule {
  isScreenReaderEnabled: () => Promise<boolean>;
  isAccessibilityServiceEnabled: () => Promise<boolean>;
  isBoldTextEnabled: () => Promise<boolean>;
  announceForAccessibility(announcement: string): Promise<void>;
  setAccessibilityFocus(tag: number): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('AccessibilityInfo');
