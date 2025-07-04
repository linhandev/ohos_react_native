/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <react/renderer/components/textinput/TextInputShadowNode.h> // RNOH patch
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

/*
 * Descriptor for <TextInput> component.
 */
class TextInputComponentDescriptor final
    : public ConcreteComponentDescriptor<TextInputShadowNode> {
 public:
  TextInputComponentDescriptor(const ComponentDescriptorParameters& parameters)
      : ConcreteComponentDescriptor<TextInputShadowNode>(parameters) {
    textLayoutManager_ =
        std::make_shared<const TextLayoutManager>(contextContainer_);
  }

 protected:
  void adopt(ShadowNode& shadowNode) const override {
    ConcreteComponentDescriptor::adopt(shadowNode);

    auto& concreteShadowNode = static_cast<TextInputShadowNode&>(shadowNode);
    concreteShadowNode.setTextLayoutManager(textLayoutManager_);
  }

 private:
  std::shared_ptr<const TextLayoutManager> textLayoutManager_;
};

} // namespace facebook::react
