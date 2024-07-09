#include "MountingManagerCAPI.h"
#include <cxxreact/SystraceSection.h>

namespace rnoh {

std::string_view getMutationNameFromType(
    facebook::react::ShadowViewMutation::Type mutationType) {
  switch (mutationType) {
    case facebook::react::ShadowViewMutation::Create:
      return "CREATE";
    case facebook::react::ShadowViewMutation::Delete:
      return "DELETE";
    case facebook::react::ShadowViewMutation::Update:
      return "UPDATE";
    case facebook::react::ShadowViewMutation::Insert:
      return "INSERT";
    case facebook::react::ShadowViewMutation::Remove:
      return "REMOVE";
    case facebook::react::ShadowViewMutation::RemoveDeleteTree:
      return "REMOVE_DELETE_TREE";
    default:
      return "UNKNOWN";
  }
}

std::optional<facebook::react::SurfaceId> findSurfaceIdForComponentInstance(
    ComponentInstance::Shared componentInstance) {
  auto parentInstance = componentInstance->getParent().lock();
  while (parentInstance != nullptr) {
    componentInstance = std::move(parentInstance);
    parentInstance = componentInstance->getParent().lock();
  }
  auto rootComponentTag = componentInstance->getTag();

  // Fabric reserves numbers equal 1 mod 10 for SurfaceIds
  if (rootComponentTag % 10 == 1) {
    return static_cast<facebook::react::SurfaceId>(rootComponentTag);
  }

  return std::nullopt;
}

void MountingManagerCAPI::willMount(MutationList const& mutations) {}

void MountingManagerCAPI::doMount(MutationList const& mutations) {
  m_arkTSMountingManager->doMount(mutations);
}

void MountingManagerCAPI::didMount(MutationList const& mutations) {
  if (!m_featureFlagRegistry->isFeatureFlagOn(
          "PARTIAL_SYNC_OF_DESCRIPTOR_REGISTRY")) {
    m_arkTSMountingManager->didMount(mutations);
  } else {
    m_arkTSMountingManager->didMount(getArkTSMutations(mutations));
  }
  for (auto const& mutation : mutations) {
    try {
      this->handleMutation(mutation);
    } catch (std::exception const& e) {
      LOG(ERROR) << "Mutation " << getMutationNameFromType(mutation.type)
                 << " failed: " << e.what();
    }
  }
  this->finalizeMutationUpdates(mutations);
}

void MountingManagerCAPI::dispatchCommand(
    const facebook::react::ShadowView& shadowView,
    const std::string& commandName,
    folly::dynamic const& args) {
  facebook::react::SystraceSection s(
      "RNOH::MountingManagerCAPI::dispatchCommand");
  m_arkTSMountingManager->dispatchCommand(shadowView, commandName, args);
  auto componentInstance =
      m_componentInstanceRegistry->findByTag(shadowView.tag);
  if (componentInstance) {
    componentInstance->handleCommand(commandName, args);
  }
}

void MountingManagerCAPI::setIsJsResponder(
    const facebook::react::ShadowView& shadowView,
    bool isJsResponder,
    bool blockNativeResponder) {
  if (m_arkTSComponentNames.count(shadowView.componentName)) {
    m_arkTSMountingManager->setIsJsResponder(
        shadowView, isJsResponder, blockNativeResponder);
  }

  auto componentInstance =
      m_componentInstanceRegistry->findByTag(shadowView.tag);
  while (componentInstance != nullptr) {
    componentInstance->setNativeResponderBlocked(blockNativeResponder);
    componentInstance = componentInstance->getParent().lock();
  }
}

void MountingManagerCAPI::updateView(
    facebook::react::Tag tag,
    folly::dynamic props,
    facebook::react::ComponentDescriptor const& componentDescriptor) {
  facebook::react::SystraceSection s("RNOH::MountingManagerCAPI::updateView");
  auto componentInstance = m_componentInstanceRegistry->findByTag(tag);
  if (componentInstance == nullptr) {
    return;
  }

  auto surfaceId = findSurfaceIdForComponentInstance(componentInstance);
  if (!surfaceId.has_value()) {
    return;
  }

  std::unordered_set<std::string> propKeys =
      componentInstance->getIgnoredPropKeys();
  for (const auto& key : props.keys()) {
    propKeys.insert(key.getString());
  }

  auto oldProps = componentInstance->getProps();
  auto newProps = componentDescriptor.cloneProps(
      facebook::react::PropsParserContext{
          surfaceId.value(), *m_contextContainer},
      oldProps,
      std::move(props));

  componentInstance->setIgnoredPropKeys({});
  componentInstance->setProps(newProps);
  componentInstance->finalizeUpdates();
  componentInstance->setIgnoredPropKeys(std::move(propKeys));
}

void MountingManagerCAPI::updateComponentWithShadowView(
    ComponentInstance::Shared const& componentInstance,
    facebook::react::ShadowView const& shadowView) {
  facebook::react::SystraceSection s(
      "RNOH::MountingManagerCAPI::updateComponentWithShadowView");
  // NOTE: updating tag by id must happen before updating props
  m_componentInstanceRegistry->updateTagById(
      shadowView.tag, shadowView.props->nativeId, componentInstance->getId());
  componentInstance->setLayout(shadowView.layoutMetrics);
  componentInstance->setEventEmitter(shadowView.eventEmitter);
  componentInstance->setState(shadowView.state);
  componentInstance->setProps(shadowView.props);
}

void MountingManagerCAPI::handleMutation(Mutation const& mutation) {
  facebook::react::SystraceSection s(
      "RNOH::MountingManagerCAPI::handleMutation");

  VLOG(1) << "Mutation (type:" << getMutationNameFromType(mutation.type)
          << "; componentName: "
          << (mutation.newChildShadowView.componentName != nullptr
                  ? mutation.newChildShadowView.componentName
                  : "null")
          << "; newTag: " << mutation.newChildShadowView.tag
          << "; oldTag: " << mutation.oldChildShadowView.tag
          << "; parentTag: " << mutation.parentShadowView.tag << ")";

  switch (mutation.type) {
    case facebook::react::ShadowViewMutation::Create: {
      auto newChild = mutation.newChildShadowView;
      auto componentInstance = m_componentInstanceFactory->create(
          newChild.tag, newChild.componentHandle, newChild.componentName);
      if (componentInstance != nullptr) {
        this->updateComponentWithShadowView(componentInstance, newChild);
        m_componentInstanceRegistry->insert(componentInstance);
        m_cApiComponentNames.insert(newChild.componentName);
      }
      break;
    }
    case facebook::react::ShadowViewMutation::Delete: {
      auto oldChild = mutation.oldChildShadowView;
      m_componentInstanceRegistry->deleteByTag(oldChild.tag);
      break;
    }
    case facebook::react::ShadowViewMutation::Insert: {
      auto parentComponentInstance =
          m_componentInstanceRegistry->findByTag(mutation.parentShadowView.tag);
      auto newChildComponentInstance = m_componentInstanceRegistry->findByTag(
          mutation.newChildShadowView.tag);
      // Building subtrees through insert is bottom-up.
      // C++ nodes and ArkTS subtrees cannot be inserted into their ArkTS
      // parent unless the parent is a C++ node. builderNode is then
      // constructed in the ArkTS subtree of C++ nodes.
      if (newChildComponentInstance == nullptr &&
          parentComponentInstance != nullptr) {
        newChildComponentInstance =
            m_componentInstanceFactory->createArkTSComponent(
                mutation.newChildShadowView.tag,
                mutation.newChildShadowView.componentHandle,
                mutation.newChildShadowView.componentName);
        if (newChildComponentInstance != nullptr) {
          m_componentInstanceRegistry->insert(newChildComponentInstance);
        } else {
          LOG(FATAL) << "Couldn't create ArkTSComponentInstance for: "
                     << mutation.newChildShadowView.componentName;
        }
      }

      if (parentComponentInstance != nullptr &&
          newChildComponentInstance != nullptr) {
        parentComponentInstance->insertChild(
            newChildComponentInstance, mutation.index);
      }
      break;
    }
    case facebook::react::ShadowViewMutation::Remove: {
      auto parentComponentInstance =
          m_componentInstanceRegistry->findByTag(mutation.parentShadowView.tag);
      if (parentComponentInstance) {
        parentComponentInstance->removeChild(
            m_componentInstanceRegistry->findByTag(
                mutation.oldChildShadowView.tag));
      }

      auto newChildComponentInstance = m_componentInstanceRegistry->findByTag(
          mutation.newChildShadowView.tag);
      if (newChildComponentInstance &&
          std::dynamic_pointer_cast<FallbackComponentInstance>(
              newChildComponentInstance)) {
        m_componentInstanceRegistry->deleteByTag(
            mutation.newChildShadowView.tag);
      }
      break;
    }
    case facebook::react::ShadowViewMutation::Update: {
      auto componentInstance = m_componentInstanceRegistry->findByTag(
          mutation.newChildShadowView.tag);
      if (componentInstance != nullptr) {
        this->updateComponentWithShadowView(
            componentInstance, mutation.newChildShadowView);
      }
      break;
    }
    case facebook::react::ShadowViewMutation::RemoveDeleteTree: {
      RNOH_ASSERT_MSG(false, "RemoveDeleteTree mutations are not supported");
      break;
    }
  }
}

void MountingManagerCAPI::finalizeMutationUpdates(
    MutationList const& mutations) {
  facebook::react::SystraceSection s(
      "RNOH::MountingManagerCAPI::finalizeMutationUpdates");
  std::unordered_set<ComponentInstance::Shared> componentInstancesToFinalize;
  for (const auto& mutation : mutations) {
    std::shared_ptr<ComponentInstance> componentInstance = nullptr;
    switch (mutation.type) {
      case facebook::react::ShadowViewMutation::Create: {
        componentInstance = m_componentInstanceRegistry->findByTag(
            mutation.newChildShadowView.tag);
        break;
      }
      case facebook::react::ShadowViewMutation::Delete: {
        break;
      }
      case facebook::react::ShadowViewMutation::Insert: {
        componentInstance = m_componentInstanceRegistry->findByTag(
            mutation.parentShadowView.tag);
        break;
      }
      case facebook::react::ShadowViewMutation::Remove: {
        componentInstance = m_componentInstanceRegistry->findByTag(
            mutation.parentShadowView.tag);
        break;
      }
      case facebook::react::ShadowViewMutation::Update: {
        componentInstance = m_componentInstanceRegistry->findByTag(
            mutation.newChildShadowView.tag);
        break;
      }
      case facebook::react::ShadowViewMutation::RemoveDeleteTree: {
        RNOH_ASSERT_MSG(false, "RemoveDeleteTree mutations are not supported");
        break;
      }
    }
    if (componentInstance != nullptr) {
      componentInstancesToFinalize.insert(componentInstance);
    }
  }
  for (const auto& componentInstance : componentInstancesToFinalize) {
    componentInstance->finalizeUpdates();
  }
}

auto MountingManagerCAPI::getArkTSMutations(MutationList const& mutations)
    -> MutationList {
  MutationList arkTSMutations{};
  for (auto const& mutation : mutations) {
    bool isArkTSMutation = false;
    switch (mutation.type) {
      case facebook::react::ShadowViewMutation::Create:
      case facebook::react::ShadowViewMutation::Update:
        isArkTSMutation = !isCAPIComponent(mutation.newChildShadowView);
        break;
      case facebook::react::ShadowViewMutation::Delete:
        isArkTSMutation = !isCAPIComponent(mutation.oldChildShadowView);
        break;
      case facebook::react::ShadowViewMutation::Insert:
      case facebook::react::ShadowViewMutation::Remove:
      case facebook::react::ShadowViewMutation::RemoveDeleteTree:
        isArkTSMutation = false;
        break;
    }
    if (isArkTSMutation) {
      arkTSMutations.push_back(mutation);
    }
  }
  return arkTSMutations;
}

bool MountingManagerCAPI::isCAPIComponent(
    facebook::react::ShadowView const& shadowView) {
  std::string componentName = shadowView.componentName;
  if (m_cApiComponentNames.count(componentName) > 0) {
    return true;
  }
  if (m_arkTSComponentNames.count(componentName) > 0) {
    return false;
  }
  auto componentInstance = m_componentInstanceFactory->create(
      shadowView.tag, shadowView.componentHandle, componentName);
  if (componentInstance) {
    m_cApiComponentNames.insert(std::move(componentName));
    return true;
  }
  m_arkTSComponentNames.insert(std::move(componentName));
  return false;
}

} // namespace rnoh