
#pragma once

#include <mutex>
#include <queue>
#include "react/renderer/mounting/ShadowView.h"

namespace rnoh {

/**
 * @internal
 * @architecture: C-API
 * @threadSafe
 */
class ComponentInstancePreallocationRequestQueue {
 private:
  using ShadowView = facebook::react::ShadowView;
  std::queue<ShadowView> m_queue;
  std::mutex m_mtx;

 public:
  using Shared = std::shared_ptr<ComponentInstancePreallocationRequestQueue>;
  using Weak = std::weak_ptr<ComponentInstancePreallocationRequestQueue>;

  void push(ShadowView request);

  std::optional<ShadowView> pop();

  void clear();

  bool isEmpty();
};
} // namespace rnoh
