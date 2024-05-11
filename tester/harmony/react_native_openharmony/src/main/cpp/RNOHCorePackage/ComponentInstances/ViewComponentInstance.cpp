#include "ViewComponentInstance.h"
#include "RNOH/ClippingComponent.h"
#include <RNOH/arkui/NativeNodeApi.h>
#include "RNOH/arkui/ArkUINodeRegistry.h"

namespace rnoh {
ViewComponentInstance::ViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  std::lock_guard<std::mutex> lock(mtx);
  if (bin.size() > 0) {
    m_stackNode = bin.front();
    bin.pop_front();
    ArkUINodeRegistry::getInstance().registerNode(m_stackNode);
    m_stackNode->registerNodeEvent(NODE_ON_CLICK);
  } else {
    m_stackNode = new StackNode;
  }
  m_stackNode->setStackNodeDelegate(this);
}

ViewComponentInstance::~ViewComponentInstance() {
  m_stackNode->reset();
  m_stackNode->unregisterNodeEvent(NODE_ON_CLICK);
  ArkUINodeRegistry::getInstance().unregisterNode(m_stackNode);
  std::lock_guard<std::mutex> lock(mtx);
  bin.push_back(m_stackNode);
}

void ViewComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance, std::size_t index) {
    CppComponentInstance::onChildInserted(childComponentInstance, index);
    if (m_removeClippedSubviews){
        insertNodeWithRemoveClipping(childComponentInstance, index);
    } else {
        childComponentInstance->setIsClipped(false);
        m_stackNode->insertChild(childComponentInstance->getLocalRootArkUINode(), index);
    }
}

void ViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance)
{
  CppComponentInstance::onChildRemoved(childComponentInstance);
    if (m_removeClippedSubviews) {
        if (!childComponentInstance->getIsClipped()) {
            m_stackNode->removeChild(childComponentInstance->getLocalRootArkUINode());
        childComponentInstance->setIsClipped(true);
  }
    } else {
        m_stackNode->removeChild(childComponentInstance->getLocalRootArkUINode());
        childComponentInstance->setIsClipped(true);
    } 
}

void ViewComponentInstance::onHoverIn() {
  m_eventEmitter->dispatchEvent(
      "pointerEnter", [=](facebook::jsi::Runtime& runtime) {
        auto payload = facebook::jsi::Object(runtime);
        return payload;
      });
}

void ViewComponentInstance::onHoverOut() {
  m_eventEmitter->dispatchEvent(
      "pointerLeave", [=](facebook::jsi::Runtime& runtime) {
        auto payload = facebook::jsi::Object(runtime);
        return payload;
      });
}

void ViewComponentInstance::onClick() {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "click", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

StackNode& ViewComponentInstance::getLocalRootArkUINode()
{
    return *m_stackNode;
}

} // namespace rnoh
