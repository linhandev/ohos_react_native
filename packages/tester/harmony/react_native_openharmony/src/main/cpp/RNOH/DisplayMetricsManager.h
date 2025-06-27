/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <memory>
#include <mutex>

namespace rnoh {
struct PhysicalPixels {
  float width;
  float height;
  float scale;
  float fontScale;
  float densityDpi;
  float xDpi;
  float yDpi;
};

struct DisplayMetrics {
  PhysicalPixels windowPhysicalPixels;
  PhysicalPixels screenPhysicalPixels;
};

class DisplayMetricsManager {
 public:
  using Shared = std::shared_ptr<DisplayMetricsManager>;

  virtual DisplayMetrics getDisplayMetrics() = 0;

  virtual float getScaleRatioDpiX() const = 0;

  virtual float getScaleRatioDpiY() const = 0;

 protected:
  mutable std::mutex m_mutex;
  float m_scaleRatioDpiX = 1.0f;
  float m_scaleRatioDpiY = 1.0f;
};
} // namespace rnoh