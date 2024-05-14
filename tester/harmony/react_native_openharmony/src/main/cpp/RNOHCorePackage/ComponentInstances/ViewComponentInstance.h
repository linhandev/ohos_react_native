#pragma once
#include <react/renderer/components/view/ViewShadowNode.h>
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/StackNode.h"

namespace rnoh {
class ViewComponentInstance
    : public CppComponentInstance<facebook::react::ViewShadowNode>,
      public StackNodeDelegate {
 private:
  StackNode m_stackNode;
    void getChildViewRect(std::shared_ptr<ComponentInstance> const& child, facebook::react::Rect &rect);
    void updateVisibleFirst(std::vector<ComponentInstance::Shared> &childNodes);
    void updateVisibleDown(std::vector<ComponentInstance::Shared> &childNodes);
    void updateVisibleUp(std::vector<ComponentInstance::Shared> &childNodes);
    void updateClippingIndex(bool isInsert, std::size_t index) override;
    void initSortChildren() override;
    void clearSortChildren() override;
    void insertSortChild(std::shared_ptr<ComponentInstance> child, std::size_t &index) override;
    void removeSortChild(std::shared_ptr<ComponentInstance> child, std::size_t &index) override;
    void restoreRsTree() override; 
 public:
  ViewComponentInstance(Context context);

  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override;
  void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) override;

  void onClick() override;
  void onHoverIn() override;
  void onHoverOut() override;
  StackNode& getLocalRootArkUINode() override;
  void insertNodeWithRemoveClipping(std::shared_ptr<ComponentInstance> const& child, std::size_t index) override;
  void updateVisible(bool isFirst) override;
};
} // namespace rnoh