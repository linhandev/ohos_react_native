/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseTouchableWithoutFeedbackDelegate } from './BaseTouchableWithoutFeedbackDelegate';

export default class TouchableWithoutFeedbackDelegate extends BaseTouchableWithoutFeedbackDelegate {
  override getExtraProps(): Record<string, any> {
    return { collapsable: false };
  }
}
