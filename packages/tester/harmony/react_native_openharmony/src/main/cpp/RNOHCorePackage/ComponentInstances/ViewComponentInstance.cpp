/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
    return;
  }
  m_customNode.insertChild(
      childComponentInstance->getLocalRootArkUINode(), index);
}

void ViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance) {
  CppComponentInstance::onChildRemoved(childComponentInstance);
  m_childrenClippedState.erase(childComponentInstance->getTag());
  m_customNode.removeChild(childComponentInstance->getLocalRootArkUINode());
};

void ViewComponentInstance::onHoverIn() {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "pointerEnter", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

void ViewComponentInstance::onHoverOut() {
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
  if (!props->removeClippedSubviews && !m_childrenClippedState.empty()) {
    restoreClippedSubviews();
  }
  if (props->rawProps.count("focusable") > 0) {
    m_customNode.setFocusable(props->rawProps["focusable"].asBool());
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
    auto tag = child->getTag();
    if (auto it = m_childrenClippedState.find(tag);
        it != m_childrenClippedState.end() && it->second) {
      m_customNode.insertChild(child->getLocalRootArkUINode(), i);
      it->second = false;
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

  size_t nextChildIndex = 0;
  for (const auto& child : m_children) {
    auto tag = child->getTag();
    bool childClipped = isViewClipped(child, currentOffset, parentBoundingBox);
    auto it = m_childrenClippedState.find(tag);
    bool wasChildClipped =
        it == m_childrenClippedState.end() || it->second != childClipped;

    if (wasChildClipped) {
      m_childrenClippedState.insert_or_assign(tag, childClipped);
      if (childClipped) {
        m_customNode.removeChild(child->getLocalRootArkUINode());
      } else {
        m_customNode.insertChild(
            child->getLocalRootArkUINode(), nextChildIndex);
      }
    }

    if (!childClipped) {
      nextChildIndex++;
    }
  }
}

void ViewComponentInstance::onFinalizeUpdates() {
  CppComponentInstance::onFinalizeUpdates();
  if (!m_props->removeClippedSubviews) {
    return;
  }
  updateClippedSubviews(true);
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

CustomNode& ViewComponentInstance::getLocalRootArkUINode() {
  return m_customNode;
}
} // namespace rnoh
