/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "ArkUINode.h"

namespace rnoh {
/**
 * @api
 */
class CustomNodeDelegate {
 public:
  virtual ~CustomNodeDelegate() = default;
  virtual void onClick(){};
  virtual void onHoverIn(){};
  virtual void onHoverOut(){};
};

/**
 * @api
 */
class CustomNode : public ArkUINode {
 protected:
  CustomNodeDelegate* m_customNodeDelegate;

  void onMeasure();
  void onLayout();

  int32_t getMeasuredWidth();
  int32_t getMeasuredHeight();

 public:
  CustomNode();
  ~CustomNode() override;

  CustomNode(const CustomNode& other) = delete;
  CustomNode& operator=(const CustomNode& other) = delete;

  CustomNode(CustomNode&& other) = delete;
  CustomNode& operator=(CustomNode&& other) = delete;

  void insertChild(ArkUINode& child, std::size_t index);
  void addChild(ArkUINode& child);
  void removeChild(ArkUINode& child);
  void onNodeEvent(ArkUI_NodeEventType eventType, EventArgs& eventArgs)
      override;
  void onClick();
  void setCustomNodeDelegate(CustomNodeDelegate* customNodeDelegate);
  CustomNode& setAlign(int32_t align);
  CustomNode& setFocusable(bool focusable);
  CustomNode& setLayoutRect(
      facebook::react::Point const& position,
      facebook::react::Size const& size,
      facebook::react::Float pointScaleFactor) override;
  void updateMeasuredSize(int32_t width, int32_t height);
  /**
   * @Deprecated: Use onMeasure(). Deprecated when preparing 0.77 branch for
   * release.
   */
  void onMeasure(ArkUI_NodeCustomEventType eventType);

 private:
  static void receiveCustomEvent(ArkUI_NodeCustomEvent* event);

  int32_t m_measuredWidth = 0;
  int32_t m_measuredHeight = 0;
};

} // namespace rnoh