#pragma once

#include "ArkUINode.h"

namespace rnoh {
class CustomNodeDelegate {
 public:
  virtual ~CustomNodeDelegate() = default;
  virtual void onClick(){};
  virtual void onHoverIn(){};
  virtual void onHoverOut(){};
};

struct UserCallback {
  std::function<void(ArkUI_NodeCustomEvent* event)> callback;
};

class CustomNode : public ArkUINode {
 protected:
  CustomNodeDelegate* m_customNodeDelegate;

 public:
  CustomNode();
  ~CustomNode() override;

  void insertChild(ArkUINode& child, std::size_t index);
  void addChild(ArkUINode &child);
  void removeChild(ArkUINode& child);
  void onMeasure(ArkUI_NodeCustomEventType eventType);
  void onLayout();
  void onNodeEvent(ArkUI_NodeEventType eventType, EventArgs& eventArgs)
      override;
  void onCustomNodeEvent(ArkUI_NodeCustomEvent* event) override;
  void onClick();
  void setCustomNodeDelegate(CustomNodeDelegate* customNodeDelegate);
  CustomNode& setAlign(int32_t align);
};

} // namespace rnoh