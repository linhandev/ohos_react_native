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

#ifndef MASKEDVIEWSTACKNODE_H
#define MASKEDVIEWSTACKNODE_H

#include "RNOH/arkui/ArkUINode.h"
#include "RNOH/arkui/StackNode.h"

namespace rnoh {

class MaskedViewStackNode : public ArkUINode {
 private:
  ArkUI_NodeHandle m_maskNodeHandle = nullptr;

 public:
  MaskedViewStackNode();

  void insertChild(ArkUINode& child, std::size_t index);
  void removeChild(ArkUINode& child);
  void setBlendMode(int32_t blendMode, ArkUI_NodeHandle node);
  void setMaskVisibility(bool visible);
};
} // namespace rnoh

#endif // MASKEDVIEWSTACKNODE_H