#include "RootViewComponentInstance.h"
#include "conversions.h"

namespace rnoh {
RootViewComponentInstance::RootViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  m_stackNode.setStackNodeDelegate(this);
}

void RootViewComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance,
    std::size_t index) {
  CppComponentInstance::onChildInserted(childComponentInstance, index);
  m_stackNode.insertChild(
      childComponentInstance->getLocalRootArkUINode(), index);
}

void RootViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance) {
  CppComponentInstance::onChildRemoved(childComponentInstance);
  m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
};

void RootViewComponentInstance::onHoverIn() {
  m_eventEmitter->dispatchEvent(
      "pointerEnter", [=](facebook::jsi::Runtime& runtime) {
        auto payload = facebook::jsi::Object(runtime);
        return payload;
      });
}

void RootViewComponentInstance::onHoverOut() {
  m_eventEmitter->dispatchEvent(
      "pointerLeave", [=](facebook::jsi::Runtime& runtime) {
        auto payload = facebook::jsi::Object(runtime);
        return payload;
      });
}

void RootViewComponentInstance::onClick() {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "click", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

StackNode& RootViewComponentInstance::getLocalRootArkUINode() {
  return m_stackNode;
}
} // namespace rnoh
