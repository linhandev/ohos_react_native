#include "ViewComponentInstance.h"
#include "conversions.h"

namespace rnoh {
ViewComponentInstance::ViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  m_stackNode.setStackNodeDelegate(this);
}

void ViewComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance,
    std::size_t index) {
  CppComponentInstance::onChildInserted(childComponentInstance, index);
  if (m_props && m_props->removeClippedSubviews && !m_parent.expired()) {
    updateClippedSubviews(true);
  } else {
    m_stackNode.insertChild(
        childComponentInstance->getLocalRootArkUINode(), index);
  }
}

void ViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance) {
  CppComponentInstance::onChildRemoved(childComponentInstance);
  m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
  updateClippedSubviews(true);
};

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

void ViewComponentInstance::onPropsChanged(SharedConcreteProps const& props) {
  CppComponentInstance::onPropsChanged(props);

  updateClippedSubviews();
}

bool ViewComponentInstance::isViewClipped(
    const ComponentInstance::Shared& child,
    facebook::react::Point currentOffset,
    facebook::react::Rect parentBoundingBox) {
  auto scrollRectOrigin =
      facebook::react::Point{currentOffset.x, currentOffset.y};
  auto scrollRect =
      facebook::react::Rect{scrollRectOrigin, parentBoundingBox.size};

  return !rnoh::rectIntersects(scrollRect, child->getLayoutMetrics().frame);
}

void ViewComponentInstance::updateClippedSubviews(bool childrenChange) {
  auto parent = m_parent.lock();
  if ((m_props && !m_props->removeClippedSubviews) || !parent) {
    return;
  }

  auto currentOffset = parent->getCurrentOffset();

  auto parentBoundingBox = parent->getBoundingBox();

  bool remakeVector = false;
  if (childrenChange || m_childrenClippedState.empty()) {
    m_childrenClippedState.clear();
    remakeVector = true;
  }

  size_t i = 0;
  size_t nextChildIndex = 0;
  for (const auto& child : m_children) {
    bool childClipped = isViewClipped(child, currentOffset, parentBoundingBox);

    if (remakeVector) {
      m_stackNode.removeChild(child->getLocalRootArkUINode());
      m_childrenClippedState.push_back(childClipped);

      if (!childClipped) {
        m_stackNode.insertChild(child->getLocalRootArkUINode(), -1);
      }
    }

    if (m_childrenClippedState[i] != childClipped) {
      m_childrenClippedState[i] = childClipped;

      if (childClipped) {
        m_stackNode.removeChild(child->getLocalRootArkUINode());
      } else {
        m_stackNode.insertChild(child->getLocalRootArkUINode(), nextChildIndex);
        nextChildIndex++;
      }
    } else if (!childClipped) {
      nextChildIndex++;
    }
    i++;
  }
}

void ViewComponentInstance::onFinalizeUpdates() {
  ComponentInstance::onFinalizeUpdates();

  updateClippedSubviews();
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

StackNode& ViewComponentInstance::getLocalRootArkUINode() {
  return m_stackNode;
}
} // namespace rnoh
