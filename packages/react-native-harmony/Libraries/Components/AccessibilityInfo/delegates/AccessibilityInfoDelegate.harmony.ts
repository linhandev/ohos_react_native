/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseAccessibilityInfoDelegate } from './BaseAccessibilityInfoDelegate';
import NativeAccessibilityInfoHarmony from './NativeAccessibilityInfoHarmony.harmony';

export default class AccessibilityInfoDelegate extends BaseAccessibilityInfoDelegate {
  override isBoldTextEnabled(): Promise<boolean> {
    return NativeAccessibilityInfoHarmony!.isBoldTextEnabled();
  }

  override isScreenReaderEnabled(): Promise<boolean> {
    return NativeAccessibilityInfoHarmony!.isScreenReaderEnabled();
  }

  override isAccessibilityServiceEnabled(): Promise<boolean> {
    return NativeAccessibilityInfoHarmony!.isAccessibilityServiceEnabled();
  }

  override setAccessibilityFocus(reactTag: number): void {
    NativeAccessibilityInfoHarmony!.setAccessibilityFocus(reactTag);
  }

  override announceForAccessibility(announcement: string): void {
    NativeAccessibilityInfoHarmony!.announceForAccessibility(announcement);
  }

  override announceForAccessibilityWithOptions(
    announcement: string,
    options: { queue?: boolean }
  ) {
    // NOOP
  }

  override async getRecommendedTimeoutMillis(
    originalTimeout: number
  ): Promise<number> {
    return 0;
  }
}
