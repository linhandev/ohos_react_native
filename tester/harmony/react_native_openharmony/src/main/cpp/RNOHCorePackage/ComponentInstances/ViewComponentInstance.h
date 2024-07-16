#pragma once
#include <react/renderer/components/view/ViewShadowNode.h>
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/CustomNode.h"

namespace rnoh {
class ViewComponentInstance
    : public CppComponentInstance<facebook::react::ViewShadowNode>,
      public CustomNodeDelegate {
 private:
  facebook::react::Size m_contentSize;
  CustomNode m_customNode;
  std::vector<bool> m_childrenClippedState;

  bool isViewClipped(
      const ComponentInstance::Shared& child,
      facebook::react::Point currentOffset,
      facebook::react::Rect parentBoundingBox);

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

  void onClick(CustomNodeDelegate*) override;
  void onHoverIn(CustomNodeDelegate*) override;
  void onHoverOut(CustomNodeDelegate*) override;
  CustomNode& getLocalRootArkUINode() override;
};
} // namespace rnoh