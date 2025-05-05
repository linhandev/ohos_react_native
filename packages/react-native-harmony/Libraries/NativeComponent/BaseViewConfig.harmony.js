/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import baseViewConfigIOS from './BaseViewConfig.ios';
import baseViewConfigAndroid from './BaseViewConfig.android';

export default {
  bubblingEventTypes: {
    ...baseViewConfigAndroid.baseViewConfigAndroid,
    ...baseViewConfigIOS.bubblingEventTypes,
  },
  directEventTypes: {
    ...baseViewConfigAndroid.directEventTypes,
    ...baseViewConfigIOS.directEventTypes,
  },
  validAttributes: {
    ...baseViewConfigAndroid.validAttributes,
    ...baseViewConfigIOS.validAttributes,
  },
};
