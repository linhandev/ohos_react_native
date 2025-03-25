/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <react/renderer/components/modal/ModalHostViewShadowNode.h>
#include "RNOH/ArkTSBridge.h"
#include "RNOH/ArkTSMessageHub.h"
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/ArkUIDialogHandler.h"
#include "RNOH/arkui/CustomNode.h"
#include "RNOH/arkui/UIInputEventHandler.h"

namespace rnoh {
class ModalHostViewComponentInstance
    : public CppComponentInstance<facebook::react::ModalHostViewShadowNode>,
      public ArkUIDialogDelegate,
      public ArkTSMessageHub::Observer {
 private:
  using ScreenOrientation = facebook::react::ModalHostViewEventEmitter::
      OnOrientationChangeOrientation;
  CustomNode m_virtualNode{};
  CustomNode m_rootCustomNode{};
  ArkUIDialogHandler m_dialogHandler;
  std::shared_ptr<UIInputEventHandler> m_touchHandler;
  std::shared_ptr<ArkTSMessageHandler> m_displaySizeChangeHandler;
  std::optional<ScreenOrientation> m_screenOrientation;

 private:
  void updateDisplaySize(
      DisplayMetrics const& displayMetrics,
      SharedConcreteState const& state);

  void updateSlideTransition(DisplayMetrics const& displayMetrics);

 public:
  ModalHostViewComponentInstance(Context context);

  std::weak_ptr<UIInputEventHandler> getUIInputEventHandler() override {
    return m_touchHandler;
  }

  void onPropsChanged(SharedConcreteProps const& props) override;
  void onStateChanged(SharedConcreteState const& state) override;
  void setLayout(facebook::react::LayoutMetrics layoutMetrics) override;

  void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) override;
  void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) override;

  void onFinalizeUpdates() override;

  void showDialog();

  void onShow() override;

  void onRequestClose() override;

  CustomNode& getLocalRootArkUINode() override;

  // ArkTSMessageHub::Observer
  void onMessageReceived(ArkTSMessage const& message) override;

  friend class ModalHostTouchHandler;
};
} // namespace rnoh