/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TextStyle, ViewStyle } from 'react-native';
import { BaseButtonDelegate } from '@react-native-oh/react-native-core/Libraries/Components/delegates/BaseButtonDelegate';

export default class ButtonDelegate extends BaseButtonDelegate {
  override getButtonDisabledStyle(): ViewStyle {
    return {
      opacity: 0.4,
    };
  }

  override getButtonStyle(): ViewStyle {
    return {
      backgroundColor: "#317aff",
      borderRadius: 8,
    };
  }

  override getTextDisabledStyle(): TextStyle {
    return {
      fontWeight: '500',
    };
  }

  override getTextStyle(): TextStyle {
    return {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '500',
    };
  }
}
