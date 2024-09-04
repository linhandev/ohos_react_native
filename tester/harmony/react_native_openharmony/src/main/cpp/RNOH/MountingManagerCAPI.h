#pragma once

#include <react/renderer/mounting/ShadowViewMutation.h>
#include "ArkTSChannel.h"
#include "RNOH/ArkTSChannel.h"
#include "RNOH/ComponentInstance.h"
#include "RNOH/ComponentInstanceFactory.h"
#include "RNOH/ComponentInstancePreallocationRequestQueue.h"
#include "RNOH/ComponentInstanceProvider.h"
#include "RNOH/ComponentInstanceRegistry.h"
#include "RNOH/FeatureFlagRegistry.h"
#include "RNOH/MountingManager.h"

namespace rnoh {

/**
 * @Thread: MAIN
 */
class MountingManagerCAPI final : public MountingManager {
  using Mutation = facebook::react::ShadowViewMutation;
  using MutationList = facebook::react::ShadowViewMutationList;

 public:
  MountingManagerCAPI(
      ComponentInstanceRegistry::Shared componentInstanceRegistry,
      ComponentInstanceProvider::Shared componentInstanceProvider,
      MountingManager::Shared arkTSMountingManager,
      FeatureFlagRegistry::Shared featureFlagRegistry,
      ArkTSChannel::Shared arkTSChannel)
      : m_componentInstanceRegistry(std::move(componentInstanceRegistry)),
        m_componentInstanceProvider(std::move(componentInstanceProvider)),
        m_arkTSMountingManager(std::move(arkTSMountingManager)),
        m_featureFlagRegistry(std::move(featureFlagRegistry)),
        m_arkTSChannel(std::move(arkTSChannel)){};

  void willMount(MutationList const& mutations) override;

  void doMount(MutationList const& mutations) override;

  void didMount(MutationList const& mutations) override;

  void dispatchCommand(
      const facebook::react::ShadowView& shadowView,
      const std::string& commandName,
      folly::dynamic const& args) override;

  void setIsJsResponder(
      const facebook::react::ShadowView& shadowView,
      bool isJsResponder,
      bool blockNativeResponder) override;

  void updateView(
      facebook::react::Tag tag,
      folly::dynamic props,
      facebook::react::ComponentDescriptor const& componentDescriptor) override;

  void schedulerDidSendAccessibilityEvent(
      const facebook::react::ShadowView& shadowView,
      std::string const& eventType) override;

 private:
  void updateComponentWithShadowView(
      ComponentInstance::Shared const& componentInstance,
      facebook::react::ShadowView const& shadowView);

  void handleMutation(Mutation const& mutation);

  void finalizeMutationUpdates(MutationList const& mutations);

  MutationList getArkTSMutations(MutationList const& mutations);
  bool isCAPIComponent(facebook::react::ShadowView const& shadowView);

  ComponentInstanceRegistry::Shared m_componentInstanceRegistry;
  ComponentInstanceProvider::Shared m_componentInstanceProvider;
  facebook::react::ContextContainer::Shared m_contextContainer;
  MountingManager::Shared m_arkTSMountingManager;
  FeatureFlagRegistry::Shared m_featureFlagRegistry;
  std::unordered_set<std::string> m_cApiComponentNames;
  std::unordered_set<std::string> m_arkTSComponentNames;
  ArkTSChannel::Shared m_arkTSChannel;
};
} // namespace rnoh