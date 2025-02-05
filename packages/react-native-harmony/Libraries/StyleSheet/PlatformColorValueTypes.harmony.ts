/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NativePlatformColor } from './NativePlatformColor';

export const PlatformColor = (...colors: string[]) => {
  const color = NativePlatformColor.getSystemColor(colors);
  return color;
};

export const normalizeColorObject = (color: string) => {
  return color;
};

export const processColorObject = (color: string) => {
  return color;
};
