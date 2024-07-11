#pragma once
#include "ComponentInstanceFactory.h"
#include "ComponentInstancePreallocationRequestQueue.h"
#include "UITicker.h"

namespace rnoh {
/**
 * @internal
 * @thread: MAIN
 */
class ComponentInstanceProvider
    : public std::enable_shared_from_this<ComponentInstanceProvider> {
  ComponentInstanceFactory::Shared m_componentInstanceFactory;
  std::unordered_map<facebook::react::Tag, ComponentInstance::Shared>
      m_preallocatedComponentInstanceByTag;
  std::function<void()> m_unsubscribeUITickerListener;
  ComponentInstancePreallocationRequestQueue::Shared
      m_preallocationRequestQueue;
  ComponentInstanceRegistry::Shared m_componentInstanceRegistry;
  ThreadGuard m_threadGuard;

 public:
  using Shared = std::shared_ptr<ComponentInstanceProvider>;

  ComponentInstanceProvider(
      TaskExecutor::Weak weakTaskExecutor,
      ComponentInstancePreallocationRequestQueue::Shared
          preallocationRequestQueue,
      ComponentInstanceFactory::Shared componentInstanceFactory,
      UITicker::Shared uiTicker,
      ComponentInstanceRegistry::Shared componentInstanceRegistry);

  ~ComponentInstanceProvider();

  ComponentInstance::Shared getComponentInstance(
      facebook::react::Tag tag,
      facebook::react::ComponentHandle componentHandle,
      std::string componentName);

  ComponentInstance::Shared createArkTSComponent(
      facebook::react::Tag tag,
      facebook::react::ComponentHandle componentHandle,
      std::string componentName);

 private:
  void onUITick(UITicker::Timestamp recentVSyncTimestamp);

  bool shouldPausePreallocationToAvoidBlockingMainThread(
      UITicker::Timestamp recentVSyncTimestamp);
};
} // namespace rnoh