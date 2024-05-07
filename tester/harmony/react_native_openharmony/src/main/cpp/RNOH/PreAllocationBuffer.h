/**
 * Used only in C-API based Architecture.
 */
#pragma once

#include <queue>
#include "react/renderer/core/ReactPrimitives.h"
#include "react/renderer/core/ShadowNode.h"
namespace rnoh {
class PreAllocationBuffer {
 private:
  using Info = struct {
    facebook::react::Tag tag;
    facebook::react::ComponentHandle componentHandle;
    std::string componentName;
  };
  std::queue<Info> m_queue;
  std::mutex m_mtx;
  std::function<void(
      facebook::react::Tag tag,
      facebook::react::ComponentHandle componentHandle,
      std::string componentName)>
      delegate;

 public:
  using Shared = std::shared_ptr<PreAllocationBuffer>;
  static const int MAX_CAPACITY = 12;

  ~PreAllocationBuffer() {
    DLOG(INFO) << "~PreAllocationBuffer";
  }

  void push(const facebook::react::ShadowNode& shadowNode) {
    std::lock_guard<std::mutex> lock(m_mtx);
    m_queue.push(
        {shadowNode.getTag(),
         shadowNode.getComponentHandle(),
         shadowNode.getComponentName()});
    if (m_queue.size() >= MAX_CAPACITY) {
      while (!m_queue.empty()) {
        auto info = m_queue.front();
        delegate(info.tag, info.componentHandle, info.componentName);
        m_queue.pop();
      }
    }
  }

  void setDelegate(std::function<void(
                       facebook::react::Tag,
                       facebook::react::ComponentHandle,
                       std::string componentName)> func) {
    std::lock_guard<std::mutex> lock(m_mtx);
    delegate = func;
  }

  void flush() {
    std::lock_guard<std::mutex> lock(m_mtx);
    while (!m_queue.empty()) {
      auto info = m_queue.front();
      delegate(info.tag, info.componentHandle, info.componentName);
      m_queue.pop();
    }
  }
};
} // namespace rnoh