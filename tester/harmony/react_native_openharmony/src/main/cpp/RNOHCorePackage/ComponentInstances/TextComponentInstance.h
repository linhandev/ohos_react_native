#pragma once

#include <react/renderer/components/text/ParagraphShadowNode.h>
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/SpanNode.h"
#include "RNOH/arkui/StackNode.h"
#include "RNOH/arkui/TextNode.h"

namespace rnoh {
class TextComponentInstance
    : public CppComponentInstance<facebook::react::ParagraphShadowNode> {
 private:
  using FragmentTouchTargetByTag =
      std::unordered_map<facebook::react::Tag, std::shared_ptr<TouchTarget>>;

  TextNode m_textNode{};
  std::vector<std::shared_ptr<ArkUINode>> m_childNodes{};
  FragmentTouchTargetByTag m_fragmentTouchTargetByTag{};
  bool m_touchTargetChildrenNeedUpdate = false;
  std::string m_key;
  int m_rnInstanceId = 0;

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

 private:
  void setTextAttributes(const facebook::react::TextAttributes& textAttributes);
  std::string stringCapitalize(const std::string& strInput);
  void updateFragmentTouchTargets(
      facebook::react::ParagraphState const& newState);
};
} // namespace rnoh