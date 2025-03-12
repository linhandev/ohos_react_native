/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode } from 'react';
import { KeyboardMetrics } from 'react-native';
import {
  BaseKeyboardAvoidingViewDelegate,
  PrepareChildrenOptions,
} from '@react-native-oh/react-native-core/Libraries/Components/Keyboard/delegates/BaseKeyboardAvoidingViewDelegate';

export default class KeyboardAvoidingViewDelegate extends BaseKeyboardAvoidingViewDelegate {
  override getRelativeKeyboardHeight(
    keyboardFrame: KeyboardMetrics
  ): number | null {
    if (this.ctx.getProps().enabled === false) {
      return 0;
    }
    return super.getRelativeKeyboardHeight(keyboardFrame);
  }

  override prepareChildren(
    children: ReactNode,
    options: PrepareChildrenOptions
  ): ReactNode {
    const behavior = this.ctx.getProps().behavior;
    if (behavior === 'height' || behavior === 'padding') {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        return React.cloneElement(child, {
          __keyboardAvoidingViewBottomHeight: options.bottomHeight ?? 0,
        } as any);
      });
    }
    return children;
  }
}
