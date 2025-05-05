/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseVibrationDelegate } from './BaseVibrationDelegate';

export default class VibrationDelegate extends BaseVibrationDelegate {
  override shouldUseAndroidImplementation(): boolean {
    return false;
  }
}
