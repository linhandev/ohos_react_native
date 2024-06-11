#pragma once
#include <react/renderer/components/view/ViewShadowNode.h>
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/StackNode.h"

namespace rnoh {
class ViewComponentInstance
    : public CppComponentInstance<facebook::react::ViewShadowNode>,
      public StackNodeDelegate {
 private:
  facebook::react::Size m_contentSize;
  StackNode m_stackNode;
  std::vector<bool> m_childrenClippedState;

  bool isViewClipped(
      const ComponentInstance::Shared& child,
      facebook::react::Point currentOffset,
      facebook::react::LayoutMetrics parentLayoutMetrics);

 public:
  ViewComponentInstance(Context context);

  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override;
  void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) override;

  void onPropsChanged(SharedConcreteProps const& props) override;

  void updateClippedSubviews(bool childrenChange = false);

  void onFinalizeUpdates() override;

  void onClick() override;
  void onHoverIn() override;
  void onHoverOut() override;
  StackNode& getLocalRootArkUINode() override;
};
} // namespace rnoh