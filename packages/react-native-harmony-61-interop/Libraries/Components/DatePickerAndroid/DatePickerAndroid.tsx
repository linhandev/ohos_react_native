/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Implements a module with the interface of [DatePickerAndroid](https://reactnative-archive-august-2023.netlify.app/docs/0.61/datepickerandroid)
 */

import NativeDatePickerAndroid from "../../../src/private/specs/NativeDatePickerAndroid";

type Options = {
  date?: Date;
  minDate?: Date;
  maxDate?: Date;
  mode?: "calendar" | "spinner" | "default";
};

export default {
  open: async ({ date, minDate, maxDate, mode }: Options) => {
    return await NativeDatePickerAndroid.open({
      date: date?.getTime?.(),
      minDate: minDate?.getTime?.(),
      maxDate: maxDate?.getTime?.(),
      mode: mode ?? "default",
    });
  },
  dateSetAction: "dateSetAction",
  dismissedAction: "dismissedAction",
};
