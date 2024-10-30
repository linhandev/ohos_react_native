
#pragma once

#include <mutex>
#include <queue>
#include "react/renderer/mounting/ShadowView.h"

namespace rnoh {

/**
 * @internal
 * @threadSafe
 */
class ComponentInstancePreallocationRequestQueue {
 public:
  class Delegate {
    friend ComponentInstancePreallocationRequestQueue;

   public:
    using Weak = std::weak_ptr<Delegate>;

   protected:
    virtual void onPushPreallocationRequest() = 0;
  };

  using Shared = std::shared_ptr<ComponentInstancePreallocationRequestQueue>;
  using Weak = std::weak_ptr<ComponentInstancePreallocationRequestQueue>;

 private:
  using ShadowView = facebook::react::ShadowView;
  std::queue<ShadowView> m_queue;
  std::mutex m_mtx;
  Delegate::Weak m_weakDelegate;

 public:
  void setDelegate(
      ComponentInstancePreallocationRequestQueue::Delegate::Weak weakDelegate);

  void push(ShadowView request);

  std::optional<ShadowView> pop();

  void clear();

  bool isEmpty();
};
} // namespace rnoh
