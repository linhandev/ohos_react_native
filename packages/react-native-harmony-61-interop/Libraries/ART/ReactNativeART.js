/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import View from '@react-native-oh/react-native-harmony/Libraries/Components/View/View';

class Path {
  constructor() {
  }

  moveTo() {
    return this;
  }

  lineTo() {
    return this;
  }

  arc() {
    return this;
  }

  close() {
    return this;
  }
}

const ReactART = {
  LinearGradient: View,
  RadialGradient: View,
  Pattern: View,
  Transform: View,
  Path: Path,
  Surface: View,
  Group: View,
  ClippingRectangle: View,
  Shape: View,
  Text: View,
};

module.exports = ReactART;
