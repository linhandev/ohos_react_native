#pragma once
#include <react/renderer/components/view/ViewShadowNode.h>
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/StackNode.h"

namespace rnoh {
static std::list<StackNode*> bin;
static std::mutex mtx;
class ViewComponentInstance 
    : public CppComponentInstance<facebook::react::ViewShadowNode>,
      public StackNodeDelegate {
 private:
  StackNode *m_stackNode;

 public:
  ViewComponentInstance(Context context);
  ~ViewComponentInstance();

  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override;
  void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) override;

  void onClick() override;
  void onHoverIn() override;
  void onHoverOut() override;
  StackNode& getLocalRootArkUINode() override;
};
} // namespace rnoh