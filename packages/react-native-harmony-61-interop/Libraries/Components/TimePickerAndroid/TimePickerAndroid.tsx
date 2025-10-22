/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Implements a module with the interface of [TimePickerAndroid](https://reactnative-archive-august-2023.netlify.app/docs/0.61/datepickerandroid)
 * mode='clock' is not supported since the platform doesn't provide a directly analogous component.
 * This is, however, purely cosmetic and no functional features are missing.
 */

import NativeTimePickerAndroid from "../../../src/private/specs/NativeTimePickerAndroid";

export default {
  open: NativeTimePickerAndroid.open,
  timeSetAction: "timeSetAction",
  dismissedAction: "dismissedAction",
};
