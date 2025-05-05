/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DecelerationRateType } from '../ScrollView/delegates/types';

export default function processDecelerationRate(
  decelerationRate: DecelerationRateType
): number {
  if (decelerationRate === 'normal') {
    return 0.998;
  } else if (decelerationRate === 'fast') {
    return 0.99;
  }
  return decelerationRate;
}
