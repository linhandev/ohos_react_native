/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

#include "ComponentInstance.h"
#include <glog/logging.h>

namespace rnoh {
ComponentInstance::ComponentInstance(Context ctx)
    : m_tag(ctx.tag),
      m_componentHandle(ctx.componentHandle),
      m_componentName(std::move(ctx.componentName)),
      m_deps(std::move(ctx.dependencies)) {
        if (m_deps != nullptr && m_deps->rnInstance.lock() != nullptr) {
          m_rnInstanceId = m_deps->rnInstance.lock()->getId();
        }
      }

void ComponentInstance::insertChild(
    ComponentInstance::Shared childComponentInstance,
    std::size_t index) {
  auto it = m_children.begin() + index;
  std::size_t newIndex = index;
  childComponentInstance->setParent(shared_from_this());

  onChildInserted(childComponentInstance, newIndex);
  childComponentInstance->setIndex(index);
  m_children.insert(it, std::move(childComponentInstance));
}

void ComponentInstance::removeChild(ComponentInstance::Shared childComponentInstance) {
    auto it = std::find(m_children.begin(), m_children.end(), childComponentInstance);
    if (it != m_children.end()) {
        auto childComponentInstance = std::move(*it);
        auto currentAncestor = this->shared_from_this();
        while (currentAncestor != nullptr) {
            auto ancestorUIInputEventHandler = currentAncestor->getUIInputEventHandler().lock();
            if (ancestorUIInputEventHandler != nullptr) {
                /**
                 * TouchDown events can arrive just before component removal, causing
                 * the Gesture Responder System on the JS side to enter an unexpected
                 * state. This code cancels such events to prevent this issue.
                 */
                ancestorUIInputEventHandler->cancelTouchTargetEvent(childComponentInstance);
                break;
            }
            currentAncestor = currentAncestor->getParent().lock();
        }
    }
    m_children.erase(it);
    onChildRemoved(childComponentInstance);
}

} // namespace rnoh
