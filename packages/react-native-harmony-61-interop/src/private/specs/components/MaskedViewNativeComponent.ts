/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps, HostComponent } from 'react-native';

interface RNMaskedViewProps extends ViewProps {}

export default codegenNativeComponent<RNMaskedViewProps>(
  'RNMaskedView'
) as HostComponent<RNMaskedViewProps>;


