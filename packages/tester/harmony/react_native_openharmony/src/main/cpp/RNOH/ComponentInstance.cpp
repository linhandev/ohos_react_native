/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ComponentInstance.h"
#include <cxxreact/SystraceSection.h>
#include <glog/logging.h>
#include "RNOHError.h"

namespace rnoh {
ComponentInstance::ComponentInstance(Context ctx)
    : m_tag(ctx.tag),
      m_componentHandle(ctx.componentHandle),
      m_componentName(std::move(ctx.componentName)),
      m_deps(std::move(ctx.dependencies)) {
  auto rnInstance = m_deps->rnInstance.lock();
  if (m_deps != nullptr && rnInstance != nullptr) {
    m_rnInstanceId = rnInstance->getId();
  }
}

void ComponentInstance::insertChild(
    ComponentInstance::Shared childComponentInstance,
    std::size_t index) {
  facebook::react::SystraceSection s("#RNOH::ComponentInstance::insertChild");
  auto it = m_children.begin() + index;
  childComponentInstance->setParent(shared_from_this());
  onChildInserted(childComponentInstance, index);
  childComponentInstance->setIndex(index);
  m_children.insert(it, std::move(childComponentInstance));
}

void ComponentInstance::removeChild(
    ComponentInstance::Shared childComponentInstance) {
  facebook::react::SystraceSection s("#RNOH::ComponentInstance::removeChild");

  auto it =
      std::find(m_children.begin(), m_children.end(), childComponentInstance);
  m_children.erase(it);
  onChildRemoved(childComponentInstance);
}

ComponentInstance::NoArkUINodeError::NoArkUINodeError(
    std::string whatHappened,
    std::vector<std::string> howCanItBeFixed)
    : RNOHError{std::move(whatHappened), std::move(howCanItBeFixed)} {}
} // namespace rnoh
