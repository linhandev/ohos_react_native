/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import Image from './Image.ios';
// @ts-ignore
import ImageAndroid from './Image.android';

Image.getSize = ImageAndroid.getSize
Image.prefetch = ImageAndroid.prefetch
Image.abortPrefetch = ImageAndroid.abortPrefetch

export default Image;
