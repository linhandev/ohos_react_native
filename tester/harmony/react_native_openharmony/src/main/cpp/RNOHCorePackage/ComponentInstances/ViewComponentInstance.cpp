#include "ViewComponentInstance.h"
#include "conversions.h"

namespace rnoh {
ViewComponentInstance::ViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  m_customNode.setCustomNodeDelegate(this);
}

void ViewComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance,
    std::size_t index) {
  CppComponentInstance::onChildInserted(childComponentInstance, index);
  if (m_props->removeClippedSubviews && !m_parent.expired()) {
  } else {
    m_customNode.insertChild(
        childComponentInstance->getLocalRootArkUINode(), index);
  }
}

void ViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance) {
  CppComponentInstance::onChildRemoved(childComponentInstance);
  m_customNode.removeChild(childComponentInstance->getLocalRootArkUINode());
};

void ViewComponentInstance::onHoverIn(CustomNodeDelegate*) {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "pointerEnter", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

void ViewComponentInstance::onHoverOut(CustomNodeDelegate*) {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "pointerLeave", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

void ViewComponentInstance::onPropsChanged(SharedConcreteProps const& props) {
  CppComponentInstance::onPropsChanged(props);
  if (props->removeClippedSubviews) {
    updateClippedSubviews(true);
  } else if (!m_childrenClippedState.empty()) {
    restoreClippedSubviews();
  }
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

void ViewComponentInstance::restoreClippedSubviews() {
  size_t i = 0;
  for (const auto& child : m_children) {
    if (m_childrenClippedState[i]) {
      m_customNode.insertChild(child->getLocalRootArkUINode(), i);
      m_childrenClippedState[i] = false;
    }
    i++;
  }
}

void ViewComponentInstance::updateClippedSubviews(bool childrenChange) {
  auto parent = m_parent.lock();
  if (!m_props->removeClippedSubviews || !parent) {
    return;
  }

  auto currentOffset = parent->getCurrentOffset();
  auto parentBoundingBox = parent->getBoundingBox();

  if (m_previousOffset == currentOffset && !childrenChange) {
    return;
  }

  m_previousOffset = currentOffset;

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
      m_customNode.removeChild(child->getLocalRootArkUINode());
      m_childrenClippedState.push_back(childClipped);

      if (!childClipped) {
        m_customNode.insertChild(child->getLocalRootArkUINode(), -1);
      }
    }

    if (m_childrenClippedState[i] != childClipped) {
      m_childrenClippedState[i] = childClipped;

      if (childClipped) {
        m_customNode.removeChild(child->getLocalRootArkUINode());
      } else {
        m_customNode.insertChild(
            child->getLocalRootArkUINode(), nextChildIndex);
        nextChildIndex++;
      }
    } else if (!childClipped) {
      nextChildIndex++;
    }
    i++;
  }
}

void ViewComponentInstance::onFinalizeUpdates() {
  CppComponentInstance::onFinalizeUpdates();
  if (!m_props->removeClippedSubviews) {
    return;
  }
  updateClippedSubviews(true);
}

void ViewComponentInstance::onClick(CustomNodeDelegate*) {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "click", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

CustomNode& ViewComponentInstance::getLocalRootArkUINode() {
  return m_customNode;
}
} // namespace rnoh
