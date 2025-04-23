/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {I18nManagerConstants} from '@react-native-oh/react-native-core/Libraries/ReactNative/NativeI18nManager';

import {BaseI18nManagerDelegate} from '@react-native-oh/react-native-core/Libraries/ReactNative/delegates/BaseI18nManagerDelegate';

export default class I18nManagerDelegate extends BaseI18nManagerDelegate {
  getConstants: () => I18nManagerConstants = () => {
    return this.ctx.constantsCallback();
  };

  get isRTL(): boolean {
    return this.ctx.constantsCallback().isRTL;
  }

  get doLeftAndRightSwapInRTL(): boolean {
    return this.ctx.constantsCallback().doLeftAndRightSwapInRTL;
  }
}
