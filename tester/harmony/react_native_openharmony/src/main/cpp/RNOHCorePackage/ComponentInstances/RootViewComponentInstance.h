#pragma once
#include <react/renderer/components/root/RootShadowNode.h>
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/StackNode.h"

namespace rnoh {
class RootViewComponentInstance
    : public CppComponentInstance<facebook::react::RootShadowNode>,
      public StackNodeDelegate {
 private:
  StackNode m_stackNode;

 public:
  RootViewComponentInstance(Context context);

  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override;
  void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) override;

  void onLayoutChanged(
      const facebook::react::LayoutMetrics& layoutMetrics) override;

  void onClick() override;
  void onHoverIn() override;
  void onHoverOut() override;
  StackNode& getLocalRootArkUINode() override;

  bool canHandleTouch() const override {
    return false;
  }
};
} // namespace rnoh
