/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <memory>

namespace rnoh {
struct PhysicalPixels {
  float width;
  float height;
  float scale;
  float fontScale;
  float densityDpi;
};

struct DisplayMetrics {
  PhysicalPixels windowPhysicalPixels;
  PhysicalPixels screenPhysicalPixels;
};

class DisplayMetricsManager {
 public:
  using Shared = std::shared_ptr<DisplayMetricsManager>;

  virtual DisplayMetrics getDisplayMetrics() = 0;
};
} // namespace rnoh