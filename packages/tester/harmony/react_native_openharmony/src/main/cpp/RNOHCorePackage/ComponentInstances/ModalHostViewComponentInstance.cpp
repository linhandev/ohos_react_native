/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ModalHostViewComponentInstance.h"

#include <glog/logging.h>
#include <react/renderer/components/rncore/Props.h>
#include "RNOH/ArkTSBridge.h"
#include "RNOH/Assert.h"
#include "RNOH/arkui/NativeNodeApi.h"
#include "RNOH/arkui/TouchEventDispatcher.h"
#include "RNOH/arkui/UIInputEventHandler.h"

namespace rnoh {

static constexpr int32_t ANIMATION_DURATION = 300;

class ModalHostTouchHandler : public UIInputEventHandler {
 private:
  ModalHostViewComponentInstance* m_rootView;
  TouchEventDispatcher m_touchEventDispatcher;

 public:
  ModalHostTouchHandler(ModalHostTouchHandler const& other) = delete;
  ModalHostTouchHandler& operator=(ModalHostTouchHandler const& other) = delete;
  ModalHostTouchHandler(ModalHostTouchHandler&& other) = delete;
  ModalHostTouchHandler& operator=(ModalHostTouchHandler&& other) = delete;

  ModalHostTouchHandler(ModalHostViewComponentInstance* rootView)
      : UIInputEventHandler(rootView->m_rootCustomNode), m_rootView(rootView) {}

  void onTouchEvent(ArkUI_UIInputEvent* event) override {
    m_touchEventDispatcher.dispatchTouchEvent(
        event, m_rootView->shared_from_this());
  }
};

void ModalHostViewComponentInstance::updateDisplaySize(
    DisplayMetrics const& displayMetrics,
    SharedConcreteState const& state) {
  const auto& windowMetrics = displayMetrics.windowPhysicalPixels;
  auto screenOrientation = (displayMetrics.windowPhysicalPixels.height >=
                            displayMetrics.windowPhysicalPixels.width)
      ? ScreenOrientation::Portrait
      : ScreenOrientation::Landscape;

  if (m_screenOrientation != screenOrientation) {
    m_screenOrientation = screenOrientation;
    if (m_eventEmitter) {
      m_eventEmitter->onOrientationChange({.orientation = screenOrientation});
    }
  }
  facebook::react::Size screenSize = {
      .width = windowMetrics.width / windowMetrics.scale,
      .height = windowMetrics.height / windowMetrics.scale};
  state->updateState({screenSize});
  if (m_props->animationType ==
      facebook::react::ModalHostViewAnimationType::Slide) {
    updateSlideTransition(displayMetrics);
  }
}

void ModalHostViewComponentInstance::updateSlideTransition(
    DisplayMetrics const& displayMetrics) {
  const auto& screenSize = displayMetrics.windowPhysicalPixels;
  m_rootCustomNode.setTranslateTransition(
      0, float(screenSize.height / screenSize.scale), ANIMATION_DURATION);
}

ModalHostViewComponentInstance::ModalHostViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)),
      ArkTSMessageHub::Observer(m_deps->arkTSMessageHub),
      m_touchHandler(std::make_unique<ModalHostTouchHandler>(this)) {
  m_virtualNode.setSize(facebook::react::Size{0, 0});
  m_dialogHandler.setDialogDelegate(this);
  m_rootCustomNode.setPosition({0, 0});
}

void ModalHostViewComponentInstance::setLayout(
    facebook::react::LayoutMetrics layoutMetrics) {
  CppComponentInstance::setLayout(layoutMetrics);
  int32_t width = static_cast<int32_t>(
      layoutMetrics.frame.size.width * layoutMetrics.pointScaleFactor + 0.5);
  int32_t height = static_cast<int32_t>(
      layoutMetrics.frame.size.height * layoutMetrics.pointScaleFactor + 0.5);
  m_rootCustomNode.updateMeasuredSize(width, height);
  m_rootCustomNode.setSize(layoutMetrics.frame.size);
}

void ModalHostViewComponentInstance::onPropsChanged(
    SharedConcreteProps const& props) {
  using AnimationType = facebook::react::ModalHostViewAnimationType;
  CppComponentInstance::onPropsChanged(props);
  if (props->animationType != m_props->animationType) {
    if (props->animationType == AnimationType::Slide) {
      m_rootCustomNode.resetOpacityTransition();
      auto screenSize = m_deps->displayMetricsManager->getDisplayMetrics();
      updateSlideTransition(screenSize);
    } else if (props->animationType == AnimationType::Fade) {
      m_rootCustomNode.setTranslateTransition(0, 0, 0);
      m_rootCustomNode.setOpacityTransition(ANIMATION_DURATION);
    } else {
      m_rootCustomNode.setTranslateTransition(0, 0, 0);
      m_rootCustomNode.resetOpacityTransition();
    }
  }
}

void ModalHostViewComponentInstance::onStateChanged(
    SharedConcreteState const& state) {
  CppComponentInstance::onStateChanged(state);
  if (!m_state) {
    // set screen size the first time the component is initialized
    auto displayMetrics = m_deps->displayMetricsManager->getDisplayMetrics();
    updateDisplaySize(displayMetrics, state);
  }
}

void ModalHostViewComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance,
    std::size_t index) {
  CppComponentInstance::onChildInserted(childComponentInstance, index);
  m_rootCustomNode.insertChild(
      childComponentInstance->getLocalRootArkUINode(), index);
}

void ModalHostViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance) {
  CppComponentInstance::onChildRemoved(childComponentInstance);
  m_rootCustomNode.removeChild(childComponentInstance->getLocalRootArkUINode());
};

void ModalHostViewComponentInstance::onFinalizeUpdates() {
  // only show modal after the screen size has been set and processed by RN
  auto isScreenSizeSet = m_state && m_state->getData().screenSize.height != 0 &&
      m_state->getData().screenSize.width != 0;
  auto shouldShowDialog = !m_dialogHandler.isShow() && isScreenSizeSet;
  if (shouldShowDialog) {
    showDialog();
  }
  CppComponentInstance::onFinalizeUpdates();
}

void ModalHostViewComponentInstance::showDialog() {
  m_dialogHandler.setContent(m_rootCustomNode);
  m_dialogHandler.show();
}

void ModalHostViewComponentInstance::onShow() {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->onShow({});
  }
}

void ModalHostViewComponentInstance::onRequestClose() {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->onRequestClose({});
  }
}

CustomNode& ModalHostViewComponentInstance::getLocalRootArkUINode() {
  return m_virtualNode;
}

void ModalHostViewComponentInstance::onMessageReceived(
    ArkTSMessage const& message) {
  if (message.name == "WINDOW_SIZE_CHANGE") {
    if (m_state) {
      auto displayMetrics = m_deps->displayMetricsManager->getDisplayMetrics();
      updateDisplaySize(displayMetrics, m_state);
    }
  }
}

} // namespace rnoh
