#include "ComponentInstancePreallocationRequestQueue.h"

namespace rnoh {

void ComponentInstancePreallocationRequestQueue::push(
    ComponentInstancePreallocationRequest request) {
  auto lock = std::lock_guard(m_mtx);
  m_queue.push(std::move(request));
}

bool ComponentInstancePreallocationRequestQueue::isEmpty() {
  auto lock = std::lock_guard(m_mtx);
  return m_queue.empty();
}

std::optional<ComponentInstancePreallocationRequest>
ComponentInstancePreallocationRequestQueue::pop() {
  auto lock = std::lock_guard(m_mtx);
  if (!m_queue.empty()) {
    auto request = m_queue.front();
    m_queue.pop();
    return request;
  }
  return std::nullopt;
}
} // namespace rnoh