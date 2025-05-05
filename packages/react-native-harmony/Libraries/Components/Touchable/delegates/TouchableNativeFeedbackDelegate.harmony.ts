/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseTouchableNativeFeedbackDelegate } from './BaseTouchableNativeFeedbackDelegate';

export default class TouchableNativeFeedbackDelegate extends BaseTouchableNativeFeedbackDelegate {
  override getExtraProps(): Record<string, any> {
    return { collapsable: false };
  }
}
