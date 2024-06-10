#pragma once

#include <ace/xcomponent/native_interface_xcomponent.h>

#include "RNOH/RNInstanceInternal.h"

#include "RNOH/ArkTSMessageHandler.h"
#include "RNOH/ArkTSMessageHub.h"
#include "RNOH/ComponentInstanceFactory.h"
#include "RNOH/ComponentInstanceRegistry.h"
#include "RNOH/arkui/XComponentSurface.h"

namespace rnoh {
using MutationsListener = std::function<void(
    MutationsToNapiConverter const&,
    facebook::react::ShadowViewMutationList const& mutations)>;

using UniqueNativeResourceManager = std::unique_ptr<
    NativeResourceManager,
    decltype(&OH_ResourceManager_ReleaseNativeResourceManager)>;

class RNInstanceCAPI : public RNInstanceInternal {
 public:
  RNInstanceCAPI(
      int id,
      std::shared_ptr<facebook::react::ContextContainer> contextContainer,
      TurboModuleFactory&& turboModuleFactory,
      std::shared_ptr<TaskExecutor> taskExecutor,
      std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry>
          componentDescriptorProviderRegistry,
      MutationsToNapiConverter::Shared mutationsToNapiConverter,
      EventEmitRequestHandlers eventEmitRequestHandlers,
      GlobalJSIBinders globalJSIBinders,
      UITicker::Shared uiTicker,
      ShadowViewRegistry::Shared shadowViewRegistry,
      MountingManager::Shared mountingManager,
      std::vector<ArkTSMessageHandler::Shared> arkTSMessageHandlers,
      ArkTSChannel::Shared arkTSChannel,
      ArkTSMessageHub::Shared arkTSMessageHub,
      ComponentInstanceRegistry::Shared componentInstanceRegistry,
      ComponentInstanceFactory::Shared componentInstanceFactory,
      UniqueNativeResourceManager nativeResourceManager,
      bool shouldEnableDebugger,
      bool shouldEnableBackgroundExecutor)
      : RNInstanceInternal(
            id,
            contextContainer,
            std::move(turboModuleFactory),
            std::move(taskExecutor),
            std::move(componentDescriptorProviderRegistry),
            std::move(mutationsToNapiConverter),
            std::move(eventEmitRequestHandlers),
            std::move(globalJSIBinders),
            std::move(uiTicker),
            std::move(shadowViewRegistry),
            std::move(arkTSChannel),
            std::move(mountingManager),
            std::move(arkTSMessageHandlers),
            shouldEnableDebugger,
            shouldEnableBackgroundExecutor),
        m_arkTSMessageHub(std::move(arkTSMessageHub)),
        m_componentInstanceRegistry(std::move(componentInstanceRegistry)),
        m_componentInstanceFactory(std::move(componentInstanceFactory)),
        m_arkTSChannel(std::move(arkTSChannel)),
        m_nativeResourceManager(std::move(nativeResourceManager)) {}

  ~RNInstanceCAPI() {
    DLOG(INFO) << "~RNInstanceCAPI::start";
    if (m_unsubscribeUITickListener != nullptr) {
      m_unsubscribeUITickListener();
    }
    DLOG(INFO) << "~RNInstanceCAPI::stop";
  }

  void createSurface(
      facebook::react::Tag surfaceId,
      std::string const& moduleName) override;
  void updateSurfaceConstraints(
      facebook::react::Tag surfaceId,
      float width,
      float height,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL) override;
  void startSurface(
      facebook::react::Tag surfaceId,
      float width,
      float height,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL,
      folly::dynamic&& initialProps) override;
  void setSurfaceProps(facebook::react::Tag surfaceId, folly::dynamic&& props)
      override;
  void stopSurface(facebook::react::Tag surfaceId) override;
  void destroySurface(facebook::react::Tag surfaceId) override;
  void setSurfaceDisplayMode(
      facebook::react::Tag surfaceId,
      facebook::react::DisplayMode displayMode) override;

  void synchronouslyUpdateViewOnUIThread(
      facebook::react::Tag tag,
      folly::dynamic props) override;

  void registerNativeXComponentHandle(
      OH_NativeXComponent* nativeXComponent,
      facebook::react::Tag surfaceId);

  ComponentInstance::Shared findComponentInstanceByTag(
      facebook::react::Tag tag);

  std::optional<facebook::react::Tag> findComponentInstanceTagById(
      const std::string& id);

  NativeResourceManager const* getNativeResourceManager() const override;

 protected:
  std::shared_ptr<TurboModuleProvider> createTurboModuleProvider() override;

  std::unordered_map<facebook::react::SurfaceId, XComponentSurface>
      m_surfaceById;
  ComponentInstanceRegistry::Shared m_componentInstanceRegistry;
  ComponentInstanceFactory::Shared m_componentInstanceFactory;
  ArkTSChannel::Shared m_arkTSChannel;
  UniqueNativeResourceManager m_nativeResourceManager;
  ArkTSMessageHub::Shared m_arkTSMessageHub;
};

} // namespace rnoh
