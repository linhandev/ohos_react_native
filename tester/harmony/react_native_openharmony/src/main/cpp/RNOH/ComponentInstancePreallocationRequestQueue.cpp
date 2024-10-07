#include "ComponentInstancePreallocationRequestQueue.h"
#include <optional>

namespace rnoh {

void ComponentInstancePreallocationRequestQueue::push(ShadowView request) {
  auto lock = std::lock_guard(m_mtx);
  m_queue.push(std::move(request));
}

bool ComponentInstancePreallocationRequestQueue::isEmpty() {
  auto lock = std::lock_guard(m_mtx);
  return m_queue.empty();
}

auto ComponentInstancePreallocationRequestQueue::pop()
    -> std::optional<ShadowView> {
  auto lock = std::lock_guard(m_mtx);
  if (!m_queue.empty()) {
    auto request = m_queue.front();
    m_queue.pop();
    return request;
  }
  return std::nullopt;
}

void ComponentInstancePreallocationRequestQueue::clear() {
  auto lock = std::lock_guard(m_mtx);
  m_queue = {};
}

} // namespace rnoh
