#pragma once

#include <react/renderer/components/text/ParagraphShadowNode.h>
#include <optional>
#include "RNOH/CppComponentInstance.h"
#include "RNOH/TextMeasurer.h"
#include "RNOH/arkui/TextNode.h"

namespace rnoh {
class TextComponentInstance
    : public CppComponentInstance<facebook::react::ParagraphShadowNode> {
 private:
  using FragmentTouchTargetByTag =
      std::unordered_map<facebook::react::Tag, std::shared_ptr<TouchTarget>>;

  TextNode m_textNode{};
  FragmentTouchTargetByTag m_fragmentTouchTargetByTag{};
  bool m_touchTargetChildrenNeedUpdate = false;
  std::optional<TextMeasurer::TextStorage> m_textStorage = std::nullopt;
  std::string m_textContent = "";

 public:
  TextComponentInstance(Context context);
  TextNode& getLocalRootArkUINode() override;
  std::vector<TouchTarget::Shared> getTouchTargetChildren() override;

 protected:
  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override;
  void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) override;
  void onPropsChanged(SharedConcreteProps const& props) override;
  void onStateChanged(SharedConcreteState const& textState) override;
  const std::string& getAccessibilityLabel() const override;

 private:
  void setTextAttributes(const facebook::react::TextAttributes& textAttributes);
  void updateFragmentTouchTargets(
      facebook::react::ParagraphState const& newState);
};
} // namespace rnoh
