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
  virtual float getFontSizeScale() = 0;
};
} // namespace rnoh