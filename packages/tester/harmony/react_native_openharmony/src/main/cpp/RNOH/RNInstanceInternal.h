/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/runtimescheduler/RuntimeScheduler.h>
#include <react/runtime/ReactInstance.h>
#include <string_view>
#include "RNOH/ArkTSBridge.h"
#include "RNOH/ArkTSMessageHandler.h"
#include "RNOH/ComponentInstancePreallocationRequestQueue.h"
#include "RNOH/FontRegistry.h"
#include "RNOH/GlobalJSIBinder.h"
#include "RNOH/InspectorHostTarget.h"
#include "RNOH/MountingManager.h"
#include "RNOH/Performance/RNOHMarker.h"
#include "RNOH/RNInstance.h"
#include "RNOH/SchedulerDelegate.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/TurboModuleProvider.h"
#include "RNOH/UITicker.h"
#include "jsinspector-modern/HostTarget.h"

namespace rnoh {

using SharedNativeResourceManager = std::shared_ptr<NativeResourceManager>;

class RNInstanceInternal
    : public RNInstance,
      public std::enable_shared_from_this<RNInstance>,
      public facebook::react::LayoutAnimationStatusDelegate {
  /**
   * facebook::react::ReactNativeFeatureFlags can be initialized only once and
   * those flags are shared between RNInstances.
   */
  static bool s_hasInitializedFeatureFlags;

 public:
  class RNInstanceRNOHMarkerListener : public RNOHMarker::RNOHMarkerListener {
   public:
    RNInstanceRNOHMarkerListener(ArkTSChannel::Weak arkTSChannel);

    void logMarker(
        RNOHMarker::RNOHMarkerId markerId,
        const std::string& tag,
        double timestamp) override;

   private:
    ArkTSChannel::Weak m_arkTSChannel;
  };

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
      SharedNativeResourceManager nativeResourceManager,
      bool shouldEnableDebugger,
      ArkTSBridge::Shared arkTSBridge,
      FontRegistry::Shared fontRegistry,
      std::shared_ptr<facebook::react::JSRuntimeFactory> jsEngineProvider,
      std::shared_ptr<InspectorHostTarget> inspectorHostTarget);

  virtual ~RNInstanceInternal() noexcept;

  facebook::react::ContextContainer const& getContextContainer() const override;
  TurboModule::Shared getTurboModule(const std::string& name) override;
  void postMessageToArkTS(
      const std::string& name,
      folly::dynamic const& payload) override;

  std::string getBundlePath() const override;

  NativeResourceManager const* getNativeResourceManager() const override;

  TaskExecutor::Shared getTaskExecutor();
  void start();
  void loadScriptFromBuffer(
      std::vector<uint8_t> bundle,
      std::string const sourceURL,
      std::function<void(const std::string)> onFinish);
  void loadScriptFromFile(
      std::string const fileURL,
      std::function<void(const std::string)> onFinish);
  void loadScriptFromRawFile(
      std::string const rawFileURL,
      std::function<void(const std::string)> onFinish);
  virtual void createSurface(
      facebook::react::Tag surfaceId,
      std::string const& moduleName) = 0;

  virtual facebook::react::Size measureSurface(
      facebook::react::Tag surfaceId,
      float minWidth,
      float minHeight,
      float maxWidth,
      float maxHeight,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL) = 0;

  virtual void updateSurfaceConstraints(
      facebook::react::Tag surfaceId,
      float minWidth,
      float minHeight,
      float maxWidth,
      float maxHeight,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL) = 0;
  virtual void startSurface(
      facebook::react::Tag surfaceId,
      float minWidth,
      float minHeight,
      float maxWidth,
      float maxHeight,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL,
      folly::dynamic&& initialProps) = 0;
  virtual void setSurfaceProps(
      facebook::react::Tag surfaceId,
      folly::dynamic&& props) = 0;
  virtual void stopSurface(
      facebook::react::Tag surfaceId,
      std::function<void()> onStop) = 0;
  virtual void destroySurface(facebook::react::Tag surfaceId) = 0;
  virtual void setSurfaceDisplayMode(
      facebook::react::Tag surfaceId,
      facebook::react::DisplayMode displayMode) = 0;
  /**
   * @threadSafe
   */
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
  void onConfigurationChange(folly::dynamic const& payload);
  void handleArkTSMessage(
      const std::string& name,
      folly::dynamic const& payload);

  void registerFont(
      std::string const& fontFamily,
      std::string const& fontFilePath);

  /**
   * @deprecated: If a message needs to be handled by a specific component
   * or turbo module, use ArkTSMessageHub::Observer instead. The class
   * is expected to be instantiated in Package::createArkTSMessageHandlers.
   */
  void addArkTSMessageHandler(ArkTSMessageHandler::Shared handler);
  /**
   * @deprecated: If a message needs to be handled by a specific component
   * or turbo module, use ArkTSMessageHub::Observer instead. The class
   * is expected to be instantiated in Package::createArkTSMessageHandlers.
   */
  void removeArkTSMessageHandler(ArkTSMessageHandler::Shared handler);
  void unregisterFromInspector();

 protected:
  void initialize();
  void initializeScheduler(
      std::shared_ptr<TurboModuleProvider> turboModuleProvider);
  virtual std::shared_ptr<TurboModuleProvider> createTurboModuleProvider() = 0;
  void onUITick(UITicker::Timestamp recentVSyncTimestamp);
  void loadScript(
      std::unique_ptr<facebook::react::JSBigString const>,
      std::string const sourceURL,
      std::function<void(const std::string)> onFinish);

  void onAnimationStarted() override; // react::LayoutAnimationStatusDelegate
  void onAllAnimationsComplete()
      override; // react::LayoutAnimationStatusDelegate

  virtual void installJSBindings(facebook::jsi::Runtime& rt) = 0;

  int m_id;
  TaskExecutor::Shared m_taskExecutor;
  facebook::react::ContextContainer::Shared m_contextContainer;
  std::unique_ptr<rnoh::SchedulerDelegate> m_schedulerDelegate = nullptr;
  MountingManager::Shared m_mountingManager;

  ArkTSBridge::Shared m_arkTSBridge;

  /**
   * NOTE: Order matters. m_scheduler holds indirectly jsi::Values.
   * These values must be destructed before the runtime.
   * The runtime is destructed when `m_reactInstance` is destructed.
   * Therefore, `m_scheduler` must be declared after `m_reactInstance`.
   */
  std::shared_ptr<facebook::react::ReactInstance> m_reactInstance;
  std::shared_ptr<facebook::react::Scheduler> m_scheduler = nullptr;

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
  std::mutex m_unsubscribeUITickListenerMtx;
  std::function<void()> m_unsubscribeUITickListener = nullptr;
  std::shared_ptr<MessageQueueThread> m_jsQueue = nullptr;
  SharedNativeResourceManager m_nativeResourceManager;
  bool m_shouldEnableDebugger;
  std::vector<ArkTSMessageHandler::Shared> m_arkTSMessageHandlers;
  ArkTSChannel::Shared m_arkTSChannel;
  ComponentInstancePreallocationRequestQueue::Shared
      m_componentInstancePreallocationRequestQueue;
  std::shared_ptr<facebook::react::RuntimeScheduler> m_runtimeScheduler =
      nullptr;
  FontRegistry::Shared m_fontRegistry;
  std::string m_bundlePath;
  std::unique_ptr<facebook::react::jsinspector_modern::HostTargetDelegate>
      m_inspectorHostDelegate;
  std::shared_ptr<InspectorHostTarget> m_inspectorHostTarget;
  std::shared_ptr<facebook::react::JSRuntimeFactory> m_jsEngineProvider;
};
} // namespace rnoh
