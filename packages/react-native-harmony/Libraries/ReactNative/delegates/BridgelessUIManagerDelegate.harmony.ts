/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseBridgelessUIManagerDelegate } from './BaseBridgelessUIManagerDelegate';

export default class BridgelessUIManagerDelegate extends BaseBridgelessUIManagerDelegate {
  override selectAndroidOrIOSImplementation(): 'android' | 'ios' {
    return 'android';
  }
}
