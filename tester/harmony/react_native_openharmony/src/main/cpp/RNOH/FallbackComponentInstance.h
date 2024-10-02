#pragma once
#include <react/renderer/components/view/ViewShadowNode.h>
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/ArkUINode.h"
#include "arkui/StackNode.h"

namespace rnoh {
/**
 * This ComponentInstance is created when no other ComponentInstance was found.
 * It is used for backward compatibility reasons with ArkTS-based architecture.
 */
class FallbackComponentInstance
    : public CppComponentInstance<facebook::react::ViewShadowNode> {
 private:
  std::function<void()> m_arkUIBuilderNodeDestroyer;
  std::unique_ptr<ArkUINode> m_arkUINode;
  StackNode m_stackNode;

 public:
  FallbackComponentInstance(
      Context ctx,
      std::unique_ptr<ArkUINode> arkUINode,
      std::function<void()>&& arkUIBuilderNodeDestroyer)
      : CppComponentInstance(ctx),
        m_arkUINode(std::move(arkUINode)),
        m_arkUIBuilderNodeDestroyer(std::move(arkUIBuilderNodeDestroyer)) {
    m_arkUINode->setArkUINodeDelegate(this);
    m_stackNode.insertChild(*m_arkUINode, 0);
  };

  ArkUINode& getLocalRootArkUINode() override {
    return m_stackNode;
  };

  void onArkUINodeDestroy(ArkUINode* node) override {
    m_arkUIBuilderNodeDestroyer();
  }

  void onLayoutChanged(
      facebook::react::LayoutMetrics const& layoutMetrics) override {
    m_stackNode.setLayoutRect(layoutMetrics);
  }

 protected:
  void onPropsChanged(const SharedConcreteProps& props) override {
    // NOOP: Props are set on ArkTS side.
  }

  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override {
    // The child node is added on the ArkTS side.
  }
};
} // namespace rnoh
