/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "FontRegistry.h"
#include "RNOH/ArkTSBridge.h"
#include "RNOH/ArkTSMessageHandler.h"
#include "RNOH/ArkTSMessageHub.h"
#include "RNOH/ComponentInstanceFactory.h"
#include "RNOH/ComponentInstancePreallocationRequestQueue.h"
#include "RNOH/ComponentInstanceRegistry.h"
#include "RNOH/RNInstanceInternal.h"
#include "RNOH/arkui/ArkUISurface.h"
#include "RNOH/arkui/NodeContentHandle.h"
#include "UIManagerModule.h"

namespace rnoh {
using MutationsListener = std::function<void(
    MutationsToNapiConverter const&,
    facebook::react::ShadowViewMutationList const& mutations)>;

class RNInstanceCAPI final : public RNInstanceInternal {
 public:
  RNInstanceCAPI(
      int id,
      std::shared_ptr<facebook::react::ContextContainer> contextContainer,
      TurboModuleFactory&& turboModuleFactory,
      TaskExecutor::Shared taskExecutor,
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
      ComponentInstancePreallocationRequestQueue::Shared
          componentInstancePreallocationRequestQueue,
      SharedNativeResourceManager nativeResourceManager,
      bool shouldEnableDebugger,
      ArkTSBridge::Shared arkTSBridge,
      FontRegistry::Shared FontRegistry,
      RNOHMarker::RNOHMarkerListener::Unique markerListener,
      ComponentJSIBinderByString componentJSIBinderByName)
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
            std::move(componentInstancePreallocationRequestQueue),
            std::move(nativeResourceManager),
            shouldEnableDebugger,
            std::move(arkTSBridge),
            std::move(FontRegistry)),
        m_arkTSMessageHub(std::move(arkTSMessageHub)),
        m_componentInstanceRegistry(std::move(componentInstanceRegistry)),
        m_componentInstanceFactory(std::move(componentInstanceFactory)),
        m_componentJSIBinderByName(std::move(componentJSIBinderByName)),
        m_markerListener(std::move(markerListener)) {}

  ~RNInstanceCAPI() noexcept override;

  int getId() override;

  void createSurface(
      facebook::react::Tag surfaceId,
      std::string const& moduleName) override;
  void updateSurfaceConstraints(
      facebook::react::Tag surfaceId,
      float minWidth,
      float minHeight,
      float maxWidth,
      float maxHeight,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL) override;

  facebook::react::Size measureSurface(
      facebook::react::Tag surfaceId,
      float minWidth,
      float minHeight,
      float maxWidth,
      float maxHeight,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL) override;

  void startSurface(
      facebook::react::Tag surfaceId,
      float minWidth,
      float minHeight,
      float maxWidth,
      float maxHeight,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL,
      folly::dynamic&& initialProps) override;
  void setSurfaceProps(facebook::react::Tag surfaceId, folly::dynamic&& props)
      override;
  void stopSurface(facebook::react::Tag surfaceId, std::function<void()> onStop)
      override;
  void destroySurface(facebook::react::Tag surfaceId) override;
  void setSurfaceDisplayMode(
      facebook::react::Tag surfaceId,
      facebook::react::DisplayMode displayMode) override;

  void synchronouslyUpdateViewOnUIThread(
      facebook::react::Tag tag,
      folly::dynamic props) override;

  void attachRootView(
      NodeContentHandle nodeContentHandle,
      facebook::react::Tag surfaceId);

  void detachRootView(facebook::react::Tag surfaceId);

  ComponentInstance::Shared findComponentInstanceByTag(
      facebook::react::Tag tag);

  std::optional<facebook::react::Tag> findComponentInstanceTagById(
      const std::string& id);

  std::optional<std::string> getNativeNodeIdByTag(
      facebook::react::Tag tag) const;

  std::optional<Surface::Weak> getSurfaceByRootTag(
      facebook::react::Tag rootTag) override;

 protected:
  std::shared_ptr<TurboModuleProvider> createTurboModuleProvider() override;

  void installJSBindings(facebook::jsi::Runtime& rt) override;

  std::unordered_map<facebook::react::SurfaceId, ArkUISurface::Shared>
      m_surfaceById;
  ComponentInstanceRegistry::Shared m_componentInstanceRegistry;
  ComponentInstanceFactory::Shared m_componentInstanceFactory;
  ArkTSMessageHub::Shared m_arkTSMessageHub;
  ComponentJSIBinderByString m_componentJSIBinderByName;
  RNOHMarker::RNOHMarkerListener::Unique m_markerListener;
};

} // namespace rnoh
