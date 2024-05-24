#include "ViewComponentInstance.h"
#include "RNOH/ClippingComponent.h"
#include <RNOH/arkui/NativeNodeApi.h>
#include "RNOH/arkui/ArkUINodeRegistry.h"

namespace rnoh {
ViewComponentInstance::ViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  getLocalRootArkUINode().setStackNodeDelegate(this);
}

void ViewComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance, std::size_t index) {
    CppComponentInstance::onChildInserted(childComponentInstance, index);
    if (m_removeClippedSubviews){
        insertNodeWithRemoveClipping(childComponentInstance, index);
    } else {
        childComponentInstance->setIsClipped(false);
        getLocalRootArkUINode().insertChild(childComponentInstance->getLocalRootArkUINode(), index);
    }
}

void ViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance)
{
  CppComponentInstance::onChildRemoved(childComponentInstance);
    if (m_removeClippedSubviews) {
        if (!childComponentInstance->getIsClipped()) {
            getLocalRootArkUINode().removeChild(childComponentInstance->getLocalRootArkUINode());
        childComponentInstance->setIsClipped(true);
  }
    } else {
        getLocalRootArkUINode().removeChild(childComponentInstance->getLocalRootArkUINode());
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
    return m_stackNode;
}

} // namespace rnoh
