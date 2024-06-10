#include "MountingManagerCAPI.h"

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
  m_arkTsMountingManager->doMount(mutations);
}

void MountingManagerCAPI::didMount(MutationList const& mutations) {
  if (!m_featureFlagRegistry->isFeatureFlagOn(
          "PARTIAL_SYNC_OF_DESCRIPTOR_REGISTRY")) {
    m_arkTsMountingManager->didMount(mutations);
  }
  for (auto const& mutation : mutations) {
    try {
      this->handleMutation(mutation);
    } catch (std::exception const& e) {
      LOG(ERROR) << "Mutation " << getMutationNameFromType(mutation.type)
                 << " failed: " << e.what();
    }
    this->finalizeMutationUpdates(mutations);
  }
}

void MountingManagerCAPI::dispatchCommand(
    const facebook::react::ShadowView& shadowView,
    const std::string& commandName,
    folly::dynamic const& args) {
  m_arkTsMountingManager->dispatchCommand(shadowView, commandName, args);
  auto componentInstance =
      m_componentInstanceRegistry->findByTag(shadowView.tag);
  if (componentInstance) {
    componentInstance->handleCommand(commandName, args);
  }
}

void MountingManagerCAPI::setIsJsResponder(
    const facebook::react::ShadowView& shadowView,
    bool isJsResponder,
    bool blockNativeResponder) {}

void MountingManagerCAPI::updateView(
    facebook::react::Tag tag,
    folly::dynamic props,
    facebook::react::ComponentDescriptor const& componentDescriptor) {
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
  // NOTE: updating tag by id must happen before updating props
  m_componentInstanceRegistry->updateTagById(
      shadowView.tag, shadowView.props->nativeId, componentInstance->getId());
  componentInstance->setLayout(shadowView.layoutMetrics);
  componentInstance->setEventEmitter(shadowView.eventEmitter);
  componentInstance->setState(shadowView.state);
  componentInstance->setProps(shadowView.props);
}

void MountingManagerCAPI::handleMutation(Mutation const& mutation) {
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
      } else {
        LOG(INFO) << "Couldn't create CppComponentInstance for: "
                  << newChild.componentName;
        if (m_featureFlagRegistry->isFeatureFlagOn(
                "PARTIAL_SYNC_OF_DESCRIPTOR_REGISTRY")) {
          m_arkTsMountingManager->didMount({mutation});
        }
      }
      break;
    }
    case facebook::react::ShadowViewMutation::Delete: {
      auto oldChild = mutation.oldChildShadowView;
      m_componentInstanceRegistry->deleteByTag(oldChild.tag);
      if (m_cApiComponentNames.find(
              mutation.oldChildShadowView.componentName) ==
              m_cApiComponentNames.end() &&
          m_featureFlagRegistry->isFeatureFlagOn(
              "PARTIAL_SYNC_OF_DESCRIPTOR_REGISTRY")) {
        m_arkTsMountingManager->didMount({mutation});
      }
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
        if (m_cApiComponentNames.find(
                mutation.newChildShadowView.componentName) ==
                m_cApiComponentNames.end() &&
            m_featureFlagRegistry->isFeatureFlagOn(
                "PARTIAL_SYNC_OF_DESCRIPTOR_REGISTRY")) {
          m_arkTsMountingManager->didMount({mutation});
        }
      }
      break;
    }
  }
}

void MountingManagerCAPI::finalizeMutationUpdates(
    MutationList const& mutations) {
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
    }
    if (componentInstance != nullptr) {
      componentInstancesToFinalize.insert(componentInstance);
    }
  }
  for (const auto& componentInstance : componentInstancesToFinalize) {
    componentInstance->finalizeUpdates();
  }
}

} // namespace rnoh