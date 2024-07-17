#pragma once
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/runtimescheduler/RuntimeScheduler.h>
#include "RNOH/ArkTSMessageHandler.h"
#include "RNOH/ComponentInstancePreallocationRequestQueue.h"
#include "RNOH/MountingManager.h"
#include "RNOH/RNInstance.h"

namespace rnoh {
class RNInstanceInternal
    : public RNInstance,
      public std::enable_shared_from_this<RNInstance>,
      public facebook::react::LayoutAnimationStatusDelegate {
 public:
  explicit RNInstanceInternal(
      int id,
      std::shared_ptr<facebook::react::ContextContainer> contextContainer,
      TurboModuleFactory turboModuleFactory,
      TaskExecutor::Shared taskExecutor,
      std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry>
          componentDescriptorProviderRegistry,
      MutationsToNapiConverter::Shared mutationsToNapiConverter,
      EventEmitRequestHandlers eventEmitRequestHandlers,
      GlobalJSIBinders globalJSIBinders,
      UITicker::Shared uiTicker,
      ShadowViewRegistry::Shared shadowViewRegistry,
      ArkTSChannel::Shared arkTSChannel,
      MountingManager::Shared mountingManager,
      std::vector<ArkTSMessageHandler::Shared> arkTSMessageHandlers,
      ComponentInstancePreallocationRequestQueue::Shared
          componentInstancePreallocationRequestQueue,
      bool shouldEnableDebugger,
      bool shouldEnableBackgroundExecutor)
      : m_id(id),
        m_taskExecutor(std::move(taskExecutor)),
        m_contextContainer(std::move(contextContainer)),
        m_mountingManager(std::move(mountingManager)),
        m_componentDescriptorProviderRegistry(
            std::move(componentDescriptorProviderRegistry)),
        m_shadowViewRegistry(std::move(shadowViewRegistry)),
        m_turboModuleFactory(std::move(turboModuleFactory)),
        m_mutationsToNapiConverter(std::move(mutationsToNapiConverter)),
        m_eventEmitRequestHandlers(std::move(eventEmitRequestHandlers)),
        m_globalJSIBinders(std::move(globalJSIBinders)),
        m_uiTicker(std::move(uiTicker)),
        m_shouldEnableDebugger(shouldEnableDebugger),
        m_shouldEnableBackgroundExecutor(shouldEnableBackgroundExecutor),
        m_arkTSMessageHandlers(std::move(arkTSMessageHandlers)),
        m_arkTSChannel(std::move(arkTSChannel)),
        m_componentInstancePreallocationRequestQueue(
            std::move(componentInstancePreallocationRequestQueue)) {
    m_unsubscribeUITickListener =
        m_uiTicker->subscribe([this](auto recentVSyncTimestamp) {
          m_taskExecutor->runTask(
              TaskThread::MAIN, [this, recentVSyncTimestamp]() {
                onUITick(recentVSyncTimestamp);
              });
        });
  }

  virtual ~RNInstanceInternal() noexcept = default;

  facebook::react::ContextContainer const& getContextContainer() const override;
  TurboModule::Shared getTurboModule(const std::string& name) override;
  void postMessageToArkTS(
      const std::string& name,
      folly::dynamic const& payload) override;

  TaskExecutor::Shared getTaskExecutor();
  void start();
  void loadScript(
      std::vector<uint8_t> bundle,
      std::string const sourceURL,
      std::function<void(const std::string)> onFinish);
  virtual void createSurface(
      facebook::react::Tag surfaceId,
      std::string const& moduleName) = 0;
  virtual void updateSurfaceConstraints(
      facebook::react::Tag surfaceId,
      float width,
      float height,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL) = 0;
  virtual void startSurface(
      facebook::react::Tag surfaceId,
      float width,
      float height,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL,
      folly::dynamic&& initialProps) = 0;
  virtual void setSurfaceProps(
      facebook::react::Tag surfaceId,
      folly::dynamic&& props) = 0;
  virtual void stopSurface(facebook::react::Tag surfaceId) = 0;
  virtual void destroySurface(facebook::react::Tag surfaceId) = 0;
  virtual void setSurfaceDisplayMode(
      facebook::react::Tag surfaceId,
      facebook::react::DisplayMode displayMode) = 0;
  void callJSFunction(
      std::string module,
      std::string method,
      folly::dynamic params) override;
  void emitComponentEvent(
      napi_env env,
      facebook::react::Tag tag,
      std::string eventName,
      napi_value payload);
  void onMemoryLevel(size_t memoryLevel);
  void updateState(
      napi_env env,
      std::string const& componentName,
      facebook::react::Tag tag,
      napi_value newState);
  void handleArkTSMessage(
      const std::string& name,
      folly::dynamic const& payload);

 protected:
  void initialize();
  void initializeScheduler(
      std::shared_ptr<TurboModuleProvider> turboModuleProvider);
  virtual std::shared_ptr<TurboModuleProvider> createTurboModuleProvider() = 0;
  void onUITick(UITicker::Timestamp recentVSyncTimestamp);

  void onAnimationStarted() override; // react::LayoutAnimationStatusDelegate
  void onAllAnimationsComplete()
      override; // react::LayoutAnimationStatusDelegate

  int m_id;
  TaskExecutor::Shared m_taskExecutor;
  facebook::react::ContextContainer::Shared m_contextContainer;
  std::unique_ptr<facebook::react::SchedulerDelegate> m_schedulerDelegate =
      nullptr;
  std::shared_ptr<facebook::react::Scheduler> m_scheduler = nullptr;
  MountingManager::Shared m_mountingManager;
  std::shared_ptr<facebook::react::Instance> m_reactInstance =
      std::make_shared<facebook::react::Instance>();
  TurboModuleProvider::Shared m_turboModuleProvider = nullptr;
  std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry>
      m_componentDescriptorProviderRegistry;
  ShadowViewRegistry::Shared m_shadowViewRegistry;
  TurboModuleFactory m_turboModuleFactory;
  std::shared_ptr<EventDispatcher> m_eventDispatcher = nullptr;
  MutationsToNapiConverter::Shared m_mutationsToNapiConverter;
  EventEmitRequestHandlers m_eventEmitRequestHandlers;
  GlobalJSIBinders m_globalJSIBinders;
  std::shared_ptr<facebook::react::LayoutAnimationDriver> m_animationDriver =
      nullptr;
  UITicker::Shared m_uiTicker;
  std::function<void()> m_unsubscribeUITickListener = nullptr;
  std::atomic<bool> m_shouldRelayUITick = false;
  std::shared_ptr<MessageQueueThread> m_jsQueue = nullptr;
  bool m_shouldEnableDebugger;
  bool m_shouldEnableBackgroundExecutor;
  std::vector<ArkTSMessageHandler::Shared> m_arkTSMessageHandlers;
  ArkTSChannel::Shared m_arkTSChannel;
  ComponentInstancePreallocationRequestQueue::Shared
      m_componentInstancePreallocationRequestQueue;
  std::shared_ptr<facebook::react::RuntimeScheduler> m_runtimeScheduler =
      nullptr;
};
} // namespace rnoh