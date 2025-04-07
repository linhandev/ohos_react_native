/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <react/renderer/graphics/Point.h>
#include "ArkUINode.h"
#include "NativeNodeApi.h"

namespace rnoh {
/**
 * @api
 */
class ScrollNodeDelegate {
 public:
  virtual ~ScrollNodeDelegate() = default;
  virtual void onScroll(){};
  virtual void onScrollStart(){};
  virtual void onScrollStop(){};
  virtual float onScrollFrameBegin(float offset, int32_t scrollState) {
    return offset;
  };
  virtual void onAppear(){};
};

/**
 * @api
 */
class ScrollNode : public ArkUINode {
 protected:
  using Point = facebook::react::Point;

  ArkUI_NodeHandle m_childArkUINodeHandle;
  ScrollNodeDelegate* m_scrollNodeDelegate;

 public:
  ScrollNode();
  ~ScrollNode() override;

  void insertChild(ArkUINode& child);
  void removeChild(ArkUINode& child);
  void onNodeEvent(ArkUI_NodeEventType eventType, EventArgs& eventArgs)
      override;

  Point getScrollOffset() const;
  void setScrollNodeDelegate(ScrollNodeDelegate* scrollNodeDelegate);
  ScrollNode& setHorizontal(bool horizontal);
  ScrollNode& setEnableScrollInteraction(bool enableScrollInteraction);
  ScrollNode& setFriction(float friction);
  ScrollNode& setEdgeEffect(bool bounces, bool alwaysBounces);
  /**
   * @Deprecated: this method is no longer part of the native API. Use
   * setEdgeEffect. Deprecated when preparing the 0.77 branch for release.
   */
  void setScrollOverScrollMode(std::string const& overScrollMode);

  ScrollNode& setScrollBarDisplayMode(
      ArkUI_ScrollBarDisplayMode scrollBarDisplayMode);
  ScrollNode& setScrollBarColor(uint32_t scrollBarColor);
  ScrollNode& setScrollSnap(
      ArkUI_ScrollSnapAlign scrollSnapAlign,
      bool snapToStart,
      bool snapToEnd,
      const std::vector<facebook::react::Float>& snapPoints);
  ScrollNode& setEnablePaging(bool enablePaging);
  ScrollNode& setCenterContent(bool centerContent);

  bool isHorizontal() const;

  ScrollNode& resetScrollSnap();
  void scrollTo(
      float x,
      float y,
      bool animated,
      bool scrollToOverflowEnabled = false);
  void setNestedScroll(ArkUI_ScrollNestedMode scrollNestedMode);
  /**
   * @Deprecated: this method is no longer part of the native API. Deprecated
   * when preparing the 0.77 branch for release.
   */
  void setNestedScrollEnabled(bool nestedScrollEnabled);
  /**
   * @Deprecated: this method is no longer part of the native API. Use
   * ArkUINode::setBackgroundColor. Deprecated when preparing the 0.77 branch
   * for release.
   */
  void setEndFillColor(uint32_t color);
};

} // namespace rnoh