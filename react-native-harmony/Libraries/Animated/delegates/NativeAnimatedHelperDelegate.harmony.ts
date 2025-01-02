/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  BaseNativeAnimatedHelperDelegate,
  NativeAnimatedModule,
} from '@react-native-oh/react-native-core/Libraries/Animated/delegates/BaseNativeAnimatedHelperDelegate';
// @ts-ignore
import NativeAnimatedTurboModule from '@react-native-oh/react-native-core/Libraries/Animated/NativeAnimatedTurboModule';

export default class NativeAnimatedHelperDelegate extends BaseNativeAnimatedHelperDelegate {
  override getAnimatedModule(): NativeAnimatedModule {
    return NativeAnimatedTurboModule;
  }

  override shouldUseSingleOpBatching(): boolean {
    return true;
  }
}
