/**
 * Used only in C-API based Architecture.
 */
#pragma once
#include <folly/dynamic.h>
#include <react/renderer/core/ComponentDescriptor.h>
#include <react/renderer/scheduler/SchedulerDelegate.h>
#include "RNOH/ComponentInstanceFactory.h"
#include "RNOH/ComponentInstanceRegistry.h"
#include "RNOH/MountingManager.h"
#include "RNOH/PreAllocationBuffer.h"
#include "RNOH/SchedulerDelegateArkTS.h"
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"

namespace facebook {
namespace react {
class Scheduler;
}
} // namespace facebook

namespace rnoh {

class SchedulerDelegateCAPI : public facebook::react::SchedulerDelegate {
 public:
  SchedulerDelegateCAPI(
      TaskExecutor::Shared taskExecutor,
      ComponentInstanceRegistry::Shared componentInstanceRegistry,
      ComponentInstanceFactory::Shared componentInstanceFactory,
      rnoh::SchedulerDelegateArkTS::Unique schedulerDelegateArkTS,
      MountingManager::Shared mountingManager,
      PreAllocationBuffer::Shared preAllocationBuffer,
      std::unordered_set<std::string> arkTsComponentNames)
      : m_taskExecutor(taskExecutor),
        m_componentInstanceRegistry(std::move(componentInstanceRegistry)),
        m_componentInstanceFactory(std::move(componentInstanceFactory)),
        m_schedulerDelegateArkTS(std::move(schedulerDelegateArkTS)),
        m_mountingManager(std::move(mountingManager)),
        m_preAllocationBuffer(std::move(preAllocationBuffer)),
        m_arkTsComponentNames(std::move(arkTsComponentNames)) {
    m_preAllocationBuffer->setDelegate(
        [this](
            facebook::react::Tag tag,
            facebook::react::ComponentHandle componentHandle,
            std::string componentName) {
          auto componentInstance = m_componentInstanceFactory->create(
              tag, componentHandle, componentName);
          if (componentInstance == nullptr) {
            LOG(INFO) << "Couldn't create CppComponentInstance for: "
                      << componentName;
          } else {
            m_componentInstanceRegistry->insert(componentInstance);
          }
        });
  };

  ~SchedulerDelegateCAPI() {
    VLOG(1) << "~SchedulerDelegateCAPI";
  }

  void schedulerDidFinishTransaction(
      facebook::react::MountingCoordinator::Shared mountingCoordinator)
      override {
    mountingCoordinator->getTelemetryController().pullTransaction(
        [this](
            facebook::react::MountingTransaction const& transaction,
            facebook::react::SurfaceTelemetry const& surfaceTelemetry) {
          // Will mount
        },
        [this](
            facebook::react::MountingTransaction const& transaction,
            facebook::react::SurfaceTelemetry const& surfaceTelemetry) {
          // Mounting
          m_mountingManager->performMountInstructions(
              transaction.getMutations(), transaction.getSurfaceId());
        },
        [this](
            facebook::react::MountingTransaction const& transaction,
            facebook::react::SurfaceTelemetry const& surfaceTelemetry) {
          // Did mount
          auto mutations = transaction.getMutations();
          auto validMutations = getValidMutations(mutations);
          if (!validMutations.empty()) {
              m_mountingManager->processMutations(validMutations);
          }
          m_taskExecutor->runTask(TaskThread::MAIN, [this, mutations] {
            for (auto mutation : mutations) {
              try {
                this->handleMutation(mutation);
              } catch (std::runtime_error& e) {
                LOG(ERROR) << "Mutation "
                           << this->getMutationNameFromType(mutation.type)
                           << " failed: " << e.what();
              }
            }
            finalizeMutationUpdates(mutations);
          });
        });
  }
    
 facebook::react::ShadowViewMutationList getValidMutations(facebook::react::ShadowViewMutationList const& mutations) {
      facebook::react::ShadowViewMutationList validUpdateMutations;
      facebook::react::ShadowViewMutationList validCreateMutations;
      facebook::react::ShadowViewMutationList validInsertMutations;
      facebook::react::ShadowViewMutationList validRemoveMutations;
      facebook::react::ShadowViewMutationList validMutations;
        
      std::queue<facebook::react::Tag> arkTsComponentTags;
      std::unordered_map<facebook::react::Tag, facebook::react::ShadowViewMutationList> mutationByTag;
        
      for (auto mutation : mutations) {
            switch (mutation.type) {
              case facebook::react::ShadowViewMutation::Create: {
                auto newChild = mutation.newChildShadowView;
                if (m_arkTsComponentNames.count(newChild.componentName)) {
                  validCreateMutations.push_back(mutation);
                  arkTsComponentTags.push(newChild.tag);
                }
                break;
              }
              case facebook::react::ShadowViewMutation::Insert: {
                auto tag = mutation.parentShadowView.tag;
                facebook::react::ShadowViewMutationList childMutations;
                if (mutationByTag.count(tag)) {
                  childMutations = mutationByTag.at(tag);
                }
            
                childMutations.push_back(mutation);
                mutationByTag[tag] = childMutations;
                break;
              }
              case facebook::react::ShadowViewMutation::Update: {
                validUpdateMutations.push_back(mutation);
                break;
              }
              case facebook::react::ShadowViewMutation::Remove: {
                validRemoveMutations.push_back(mutation);
                break;
              }
            }
        }
        
      std::unordered_set<facebook::react::Tag> arkTsChildTags;
      while(!arkTsComponentTags.empty()) {
            auto tag = arkTsComponentTags.front();
            arkTsComponentTags.pop();
            if (!mutationByTag.count(tag)) {
                continue;
            }
            
            auto childMutations = mutationByTag.at(tag);
            for (auto mutation: childMutations) {
                auto newChild = mutation.newChildShadowView;
                validInsertMutations.push_back(mutation);
                arkTsComponentTags.push(newChild.tag);
                arkTsChildTags.insert(newChild.tag);
            }
        }
        
      for (auto mutation : mutations) {
            if (mutation.type != facebook::react::ShadowViewMutation::Create) {
                continue;
            }
            auto newChild = mutation.newChildShadowView;
            if (arkTsChildTags.count(newChild.tag)) {
                validCreateMutations.push_back(mutation);
            }
        }
        
      validMutations.insert(validMutations.end(), validUpdateMutations.begin(), validUpdateMutations.end());
      validMutations.insert(validMutations.end(), validCreateMutations.begin(), validCreateMutations.end());
      validMutations.insert(validMutations.end(), validInsertMutations.begin(), validInsertMutations.end());
      validMutations.insert(validMutations.end(), validRemoveMutations.begin(), validRemoveMutations.end());
      return validCreateMutations;
  } 

  void schedulerDidRequestPreliminaryViewAllocation(
      facebook::react::SurfaceId surfaceId,
      const facebook::react::ShadowNode& shadowNode) override {
    m_preAllocationBuffer->push(shadowNode);
  }

  void schedulerDidDispatchCommand(
      const facebook::react::ShadowView& shadowView,
      std::string const& commandName,
      folly::dynamic const& args) override {
    m_schedulerDelegateArkTS->schedulerDidDispatchCommand(
        shadowView, commandName, args);
    m_taskExecutor->runTask(
        TaskThread::MAIN, [this, tag = shadowView.tag, commandName, args] {
          auto componentInstance = m_componentInstanceRegistry->findByTag(tag);
          if (componentInstance != nullptr) {
            componentInstance->handleCommand(commandName, args);
          }
        });
  }

  void schedulerDidSendAccessibilityEvent(
      const facebook::react::ShadowView& shadowView,
      std::string const& eventType) override {}

  void schedulerDidSetIsJSResponder(
      facebook::react::ShadowView const& shadowView,
      bool isJSResponder,
      bool blockNativeResponder) override;

  void synchronouslyUpdateViewOnUIThread(
      facebook::react::Tag tag,
      folly::dynamic props,
      facebook::react::ComponentDescriptor const& componentDescriptor);

 private:
  TaskExecutor::Shared m_taskExecutor;
  ComponentInstanceRegistry::Shared m_componentInstanceRegistry;
  ComponentInstanceFactory::Shared m_componentInstanceFactory;
  facebook::react::ContextContainer::Shared m_contextContainer;
  rnoh::SchedulerDelegateArkTS::Unique m_schedulerDelegateArkTS;
  MountingManager::Shared m_mountingManager;
  PreAllocationBuffer::Shared m_preAllocationBuffer;
  std::unordered_set<std::string> m_arkTsComponentNames;

  void updateComponentWithShadowView(
      ComponentInstance::Shared const& componentInstance,
      facebook::react::ShadowView const& shadowView) {
    // NOTE: updating tag by id must happen before updating props
    m_componentInstanceRegistry->updateTagById(
        shadowView.tag, shadowView.props->nativeId, componentInstance->getId());
    componentInstance->setShadowView(shadowView);
    componentInstance->setLayout(shadowView.layoutMetrics);
    componentInstance->setEventEmitter(shadowView.eventEmitter);
    componentInstance->setState(shadowView.state);
    componentInstance->setProps(shadowView.props);
  }

  void handleMutation(facebook::react::ShadowViewMutation mutation) {
    VLOG(1) << "Mutation (type:" << this->getMutationNameFromType(mutation.type)
            << "; componentName: "
            << (mutation.newChildShadowView.componentName != nullptr
                    ? mutation.newChildShadowView.componentName
                    : "null")
            << "; newTag: " << mutation.newChildShadowView.tag
            << "; index: " << mutation.index
            << "; oldTag: " << mutation.oldChildShadowView.tag
            << "; parentTag: " << mutation.parentShadowView.tag << ")";
    switch (mutation.type) {
      case facebook::react::ShadowViewMutation::Create: {
        m_preAllocationBuffer->flush();
        auto newChild = mutation.newChildShadowView;
        auto componentInstance =
            m_componentInstanceRegistry->findByTag(newChild.tag);
        if (componentInstance == nullptr) {
          componentInstance = m_componentInstanceFactory->create(
              newChild.tag, newChild.componentHandle, newChild.componentName);
            if (componentInstance == nullptr) {
              LOG(ERROR) << "Couldn't create CppComponentInstance for: "
                        << newChild.componentName;
              return;
            }
            m_componentInstanceRegistry->insert(componentInstance);
        }
        updateComponentWithShadowView(componentInstance, newChild);
        break;
      }
      case facebook::react::ShadowViewMutation::Delete: {
        auto oldChild = mutation.oldChildShadowView;
        m_componentInstanceRegistry->deleteByTag(oldChild.tag);
        break;
      }
      case facebook::react::ShadowViewMutation::Insert: {
        auto parentComponentInstance = m_componentInstanceRegistry->findByTag(
            mutation.parentShadowView.tag);
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
          // text need change stackNode
          if (parentComponentInstance->checkUpdateBaseNode()) {
            if (parentComponentInstance->getParent().lock() != nullptr) {
              facebook::react::Tag grandParentTag = parentComponentInstance->getParent().lock()->getTag();
              std::size_t parentIndex = parentComponentInstance->getIndex();
              //  mutation.newChildShadowView is old data
              facebook::react::ShadowView parentShadowView = parentComponentInstance->getShadowView();
              LOG(INFO) << "need update text node, parent tag=" << parentComponentInstance->getTag()
                << ", grandParentTag tag=" << grandParentTag << ", parent index=" << parentIndex
                << ", child index=" << mutation.index;
              auto grandParentComponentInstance = m_componentInstanceRegistry->findByTag(grandParentTag);
              if (grandParentComponentInstance != nullptr) {
                grandParentComponentInstance->removeChild(parentComponentInstance);
                m_componentInstanceRegistry->deleteByTag(parentComponentInstance->getTag());
                auto newParentComponentInstance = m_componentInstanceFactory->create(
                  parentShadowView.tag, parentShadowView.componentHandle, parentShadowView.componentName);
                if (newParentComponentInstance != nullptr) {
                  updateComponentWithShadowView(newParentComponentInstance, parentShadowView);
                  m_componentInstanceRegistry->insert(newParentComponentInstance);
                  newParentComponentInstance->insertChild(newChildComponentInstance, mutation.index);
                  grandParentComponentInstance->insertChild(newParentComponentInstance, parentIndex);
                }
              } else {
                LOG(FATAL) << "Couldn't find grandParentComponentInstance by tag=" << grandParentTag;
              }
            } else {
              LOG(FATAL) << "Couldn't find grandParentComponentInstance";
            }
          } else {
            parentComponentInstance->insertChild(
                newChildComponentInstance, mutation.index);
          }
          
        }
        break;
      }
      case facebook::react::ShadowViewMutation::Remove: {
        auto parentComponentInstance = m_componentInstanceRegistry->findByTag(
            mutation.parentShadowView.tag);
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
          updateComponentWithShadowView(
              componentInstance, mutation.newChildShadowView);
        }
        break;
      }
    }
  }

  void finalizeMutationUpdates(
      facebook::react::ShadowViewMutationList const& mutations);

  std::string getMutationNameFromType(
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
};

} // namespace rnoh
