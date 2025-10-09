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

#include "MaskedViewComponentInstance.h"

namespace rnoh {
MaskedViewComponentInstance::MaskedViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {}

void MaskedViewComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance,
    std::size_t index) {
  m_stackNode.insertChild(
      childComponentInstance->getLocalRootArkUINode(), index);

  if (index > 0) {
    m_contentChildrenCount++;
    m_stackNode.setMaskVisibility(true);
  }
}

void MaskedViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance) {
  m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());

  if (m_contentChildrenCount > 0) {
    m_contentChildrenCount--;
    if (m_contentChildrenCount == 0) {
      m_stackNode.setMaskVisibility(false);
    }
  }
};

MaskedViewStackNode& MaskedViewComponentInstance::getLocalRootArkUINode() {
  return m_stackNode;
}
} // namespace rnoh