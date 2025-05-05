/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseI18nManagerDelegate } from './BaseI18nManagerDelegate';

export default class I18nManagerDelegate extends BaseI18nManagerDelegate {
  override getConstants = () => {
    return this.ctx.constantsCallback();
  };

  get isRTL(): boolean {
    return this.ctx.constantsCallback().isRTL;
  }

  get doLeftAndRightSwapInRTL(): boolean {
    return this.ctx.constantsCallback().doLeftAndRightSwapInRTL;
  }
}
