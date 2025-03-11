/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BaseViewConfigIgnoreDelegate } from '@react-native-oh/react-native-core/Libraries/NativeComponent/delegates/BaseViewConfigIgnoreDelegate';

export default class ViewConfigIgnoreDelegate extends BaseViewConfigIgnoreDelegate {
  override conditionallyIgnoredEventHandlers<T>(value: T): T | undefined {
    return value;
  }
}
