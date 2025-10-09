/**
 * MIT License
 *
 * Copyright (C) 2023 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * NOTICE: This file is copied from @react-native-oh-tpl/masked-view and
 * adapted.
 *
 * MaskedView was initially part of React Native, which is why this copyright
 * header is used. It was later extracted and moved to a separate library.
 * @react-native-oh-tpl/masked-view is based on @callstack/masked-view and has
 * been slightly adapted for OHOS.
 */

#ifndef HARMONY_MASKEDVIEWCOMPONENTINSTANCE_H
#define HARMONY_MASKEDVIEWCOMPONENTINSTANCE_H

#include "MaskedViewStackNode.h"
#include "RNOH/CppComponentInstance.h"
#include "react/renderer/components/react_native_harmony_61_interop/ShadowNodes.h"

namespace rnoh {
class MaskedViewComponentInstance
    : public CppComponentInstance<facebook::react::RNMaskedViewShadowNode> {
 private:
  MaskedViewStackNode m_stackNode;
  std::size_t m_contentChildrenCount = 0;

 public:
  explicit MaskedViewComponentInstance(Context context);

  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override;

  void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) override;

  MaskedViewStackNode& getLocalRootArkUINode() override;
};
} // namespace rnoh

#endif // HARMONY_MASKEDVIEWCOMPONENTINSTANCE_H
