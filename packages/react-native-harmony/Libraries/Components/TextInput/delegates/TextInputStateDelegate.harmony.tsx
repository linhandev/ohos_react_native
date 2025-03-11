/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseTextInputStateDelegate } from '@react-native-oh/react-native-core/Libraries/Components/TextInput/delegates/BaseTextInputStateDelegate';
// @ts-ignore
import { Commands } from '@react-native-oh/react-native-core/Libraries/Components/TextInput/RCTSingelineTextInputNativeComponent';

export default class TextInputDelegate extends BaseTextInputStateDelegate {
  blur(ref: React.ComponentRef<any>): void {
    Commands.blur(ref);
  }

  focus(ref: React.ComponentRef<any>): void {
    Commands.focus(ref);
  }
}
