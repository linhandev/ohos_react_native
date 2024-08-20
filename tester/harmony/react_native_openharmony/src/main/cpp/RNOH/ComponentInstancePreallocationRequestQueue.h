
#pragma once

#include <queue>
#include "ComponentInstanceFactory.h"
#include "ComponentInstanceRegistry.h"
#include "react/renderer/core/ReactPrimitives.h"
#include "react/renderer/core/ShadowNode.h"

namespace rnoh {

/**
 * @internal
 */
using ComponentInstancePreallocationRequest = struct {
  facebook::react::Tag tag;
  facebook::react::ComponentHandle componentHandle;
  std::string componentName;
  facebook::react::Props::Shared props;
};

/**
 * @internal
 * @architecture: C-API
 * @threadSafe
 */
class ComponentInstancePreallocationRequestQueue {
 private:
  std::queue<ComponentInstancePreallocationRequest> m_queue;
  std::mutex m_mtx;

 public:
  using Shared = std::shared_ptr<ComponentInstancePreallocationRequestQueue>;
  using Weak = std::weak_ptr<ComponentInstancePreallocationRequestQueue>;

  void push(ComponentInstancePreallocationRequest request);

  std::optional<ComponentInstancePreallocationRequest> pop();

  void clear();

  bool isEmpty();
};
} // namespace rnoh