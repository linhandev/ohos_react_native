/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

#pragma once
#include "ButtonNode.h"
#include "ButtonViewComponentDescriptor.h"
#include "RNOH/CppComponentInstance.h"

namespace rnoh {

class ButtonViewComponentInstance
    : public CppComponentInstance<facebook::react::ButtonViewShadowNode>,
      public ButtonNodeDelegate {
 private:
  ButtonNode m_buttonNode;

 public:
  ButtonViewComponentInstance(Context context);

  ButtonNode& getLocalRootArkUINode() override;

  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override;
  void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) override;
  void onPropsChanged(SharedConcreteProps const& props) override;
  void onButtonClick() override;
  void handleCommand(std::string const& commandName, folly::dynamic const& args)
      override;
};
} // namespace rnoh