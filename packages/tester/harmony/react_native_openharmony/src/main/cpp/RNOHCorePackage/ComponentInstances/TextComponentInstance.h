/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
  TextMeasurer::TextStorage::Shared m_textStorage = nullptr;
  std::string m_textContent = "";

 public:
  TextComponentInstance(Context context);
  ~TextComponentInstance();
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
  void onFinalizeUpdates() override;

 private:
  void setTextAttributes(const facebook::react::TextAttributes& textAttributes);
  void updateFragmentTouchTargets(
      facebook::react::ParagraphState const& newState);
  void disposeTextStorage();
};
} // namespace rnoh
