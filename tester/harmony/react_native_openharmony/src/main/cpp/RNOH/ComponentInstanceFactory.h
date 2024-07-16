/**
 * Used only in C-API based Architecture.
 */
#pragma once
#include <glog/logging.h>
#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/debug/SystraceSection.h>
#include <memory>
#include <vector>
#include "RNOH/ComponentInstance.h"
#include "RNOH/CustomComponentArkUINodeHandleFactory.h"
#include "RNOH/FallbackComponentInstance.h"
#include "RNOH/ThreadGuard.h"
#include "RNOH/arkui/StackNode.h"

namespace rnoh {
class ComponentInstanceFactoryDelegate {
 public:
  ComponentInstanceFactoryDelegate() = default;

  using Shared = std::shared_ptr<ComponentInstanceFactoryDelegate>;

  virtual ComponentInstance::Shared create(ComponentInstance::Context ctx) = 0;
};

/**
 * @thread: MAIN
 * Used by the ComponentRegistry to create ComponentInstances.
 */
class ComponentInstanceFactory {
 public:
  using Shared = std::shared_ptr<ComponentInstanceFactory>;

  ComponentInstanceFactory(
      std::vector<ComponentInstanceFactoryDelegate::Shared> delegates,
      ComponentInstance::Dependencies::Shared dependencies,
      CustomComponentArkUINodeHandleFactory::Shared
          customComponentArkUINodeHandleFactory)
      : m_delegates(std::move(delegates)),
        m_dependencies(dependencies),
        m_customComponentArkUINodeHandleFactory(
            customComponentArkUINodeHandleFactory) {}

  ~ComponentInstanceFactory() {
    m_threadGuard.assertThread();
  }

  ComponentInstance::Shared createArkTSComponent(
      facebook::react::Tag tag,
      facebook::react::ComponentHandle componentHandle,
      std::string componentName) {
    facebook::react::SystraceSection s(
        "#RNOH::ComponentInstanceFactory::createArkTSComponent");
    m_threadGuard.assertThread();
    ComponentInstance::Context ctx = {
        .tag = tag,
        .componentHandle = componentHandle,
        .componentName = componentName,
        .dependencies = m_dependencies};

    LOG(WARNING) << "Creating FallbackComponentInstance for: " << componentName
                 << ""
                    ""
                 << tag;
    auto frameNodeHandleAndBuilderNodeDestroyer =
        m_customComponentArkUINodeHandleFactory->create(tag, componentName);
    auto arkUINode = frameNodeHandleAndBuilderNodeDestroyer.first != nullptr
        ? std::make_unique<ArkUINode>(
              frameNodeHandleAndBuilderNodeDestroyer.first)
        // use Stack as a fallback when no frame node was created
        : std::make_unique<StackNode>();
    return std::make_shared<FallbackComponentInstance>(
        ctx,
        std::move(arkUINode),
        std::move(frameNodeHandleAndBuilderNodeDestroyer.second));
  }

  ComponentInstance::Shared create(
      facebook::react::Tag tag,
      facebook::react::ComponentHandle componentHandle,
      std::string componentName) {
    facebook::react::SystraceSection s(
        "#RNOH::ComponentInstanceFactory::create");
    m_threadGuard.assertThread();
    ComponentInstance::Context ctx = {
        .tag = tag,
        .componentHandle = componentHandle,
        .componentName = componentName,
        .dependencies = m_dependencies};
    for (auto& delegate : m_delegates) {
      auto componentInstance = delegate->create(ctx);
      if (componentInstance != nullptr) {
        return componentInstance;
      }
    }
    return nullptr;
  }

 private:
  std::vector<ComponentInstanceFactoryDelegate::Shared> m_delegates;
  ComponentInstance::Dependencies::Shared m_dependencies;
  CustomComponentArkUINodeHandleFactory::Shared
      m_customComponentArkUINodeHandleFactory;
  ThreadGuard m_threadGuard{};
};
} // namespace rnoh