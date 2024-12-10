/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ComponentInstancePreallocationRequestQueue.h"
#include "RNOH/RNOHError.h"

namespace rnoh {

void ComponentInstancePreallocationRequestQueue::push(Request request) {
  auto lock = std::lock_guard(m_mtx);
  m_queue.push(std::move(request));
  auto delegate = m_weakDelegate.lock();
  if (delegate != nullptr) {
    delegate->onPushPreallocationRequest();
  }
}

bool ComponentInstancePreallocationRequestQueue::isEmpty() {
  auto lock = std::lock_guard(m_mtx);
  return m_queue.empty();
}

std::optional<ComponentInstancePreallocationRequestQueue::Request>
ComponentInstancePreallocationRequestQueue::pop() {
  auto lock = std::lock_guard(m_mtx);
  if (!m_queue.empty()) {
    auto request = m_queue.front();
    m_queue.pop();
    return request;
  }
  return std::nullopt;
}

void ComponentInstancePreallocationRequestQueue::setDelegate(
    Delegate::Weak weakDelegate) {
  m_weakDelegate = weakDelegate;
}

void ComponentInstancePreallocationRequestQueue::clear() {
  auto lock = std::lock_guard(m_mtx);
  m_queue = {};
}

} // namespace rnoh