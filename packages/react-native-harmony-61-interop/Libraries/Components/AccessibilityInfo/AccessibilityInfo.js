/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import OriginalAccessibilityInfo from '@react-native-oh/react-native-harmony/Libraries/Components/AccessibilityInfo/AccessibilityInfo';

const AccessibilityInfoWrapper = {
  ...OriginalAccessibilityInfo,
  fetch: OriginalAccessibilityInfo.isScreenReaderEnabled,
};

export default AccessibilityInfoWrapper;
