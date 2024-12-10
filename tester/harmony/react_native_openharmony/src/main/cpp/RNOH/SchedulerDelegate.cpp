/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "SchedulerDelegate.h"
#include <cxxreact/SystraceSection.h>
#include "MountingManager.h"
#include "RNOH/Performance/RNOHMarker.h"

namespace rnoh {
SchedulerDelegate::~SchedulerDelegate() {
  DLOG(INFO) << "~SchedulerDelegate";
}

void SchedulerDelegate::schedulerDidFinishTransaction(
    const MountingCoordinator::Shared& /*mountingCoordinator*/) {
  // no-op, we will flush the transaction from schedulerShouldRenderTransactions
}

void logTransactionTelemetryMarkers(MountingTransaction const& transaction) {
  RNOHMarker::logMarker(
      RNOHMarker::RNOHMarkerId::FABRIC_FINISH_TRANSACTION_END);
  auto telemetry = transaction.getTelemetry();
  auto commitStartTime =
      telemetryTimePointToMilliseconds(telemetry.getCommitStartTime());
  auto commitEndTime =
      telemetryTimePointToMilliseconds(telemetry.getCommitEndTime());
  auto diffStartTime =
      telemetryTimePointToMilliseconds(telemetry.getDiffStartTime());
  auto diffEndTime =
      telemetryTimePointToMilliseconds(telemetry.getDiffEndTime());
  auto layoutStartTime =
      telemetryTimePointToMilliseconds(telemetry.getLayoutStartTime());
  auto layoutEndTime =
      telemetryTimePointToMilliseconds(telemetry.getLayoutEndTime());

  RNOHMarker::logMarker(
      RNOHMarker::RNOHMarkerId::FABRIC_COMMIT_START, "", commitStartTime);
  RNOHMarker::logMarker(
      RNOHMarker::RNOHMarkerId::FABRIC_COMMIT_END, "", commitEndTime);
  RNOHMarker::logMarker(
      RNOHMarker::RNOHMarkerId::FABRIC_DIFF_START, "", diffStartTime);
  RNOHMarker::logMarker(
      RNOHMarker::RNOHMarkerId::FABRIC_DIFF_END, "", diffEndTime);
  RNOHMarker::logMarker(
      RNOHMarker::RNOHMarkerId::FABRIC_LAYOUT_START, "", layoutStartTime);
  RNOHMarker::logMarker(
      RNOHMarker::RNOHMarkerId::FABRIC_LAYOUT_END, "", layoutEndTime);
}

void SchedulerDelegate::schedulerDidRequestPreliminaryViewAllocation(
    const ShadowNode& shadowNode) {
  facebook::react::SystraceSection s(
      "#RNOH::SchedulerDelegate::schedulerDidRequestPreliminaryViewAllocation");
  auto preallocationRequestQueue = m_weakPreallocationRequestQueue.lock();
  if (preallocationRequestQueue == nullptr) {
    return;
  }
  preallocationRequestQueue->push({
      shadowNode.getTag(),
      shadowNode.getComponentHandle(),
      shadowNode.getComponentName(),
  });
}

void SchedulerDelegate::schedulerDidDispatchCommand(
    const ShadowView& shadowView,
    std::string const& commandName,
    folly::dynamic const& args) {
  facebook::react::SystraceSection s(
      "#RNOH::SchedulerDelegate::schedulerDidDispatchCommand");
  performOnMainThread([shadowView, commandName, args](
                          MountingManager::Shared const& mountingManager) {
    mountingManager->dispatchCommand(shadowView, commandName, args);
  });
}

void SchedulerDelegate::schedulerDidSendAccessibilityEvent(
    const ShadowView& shadowView,
    std::string const& eventType) {
  performOnMainThread([shadowView, eventType](
                          MountingManager::Shared const& mountingManager) {
    mountingManager->schedulerDidSendAccessibilityEvent(shadowView, eventType);
  });
}

void SchedulerDelegate::schedulerDidSetIsJSResponder(
    ShadowView const& shadowView,
    bool isJSResponder,
    bool blockNativeResponder) {
  facebook::react::SystraceSection s(
      "#RNOH::SchedulerDelegate::schedulerDidSetIsJSResponder");
  performOnMainThread([shadowView, isJSResponder, blockNativeResponder](
                          MountingManager::Shared const& mountingManager) {
    mountingManager->setIsJsResponder(
        shadowView, isJSResponder, blockNativeResponder);
  });
}

static void performTransaction(
    MountingCoordinator::Shared const& mountingCoordinator,
    MountingManager::Shared const& mountingManager,
    std::weak_ptr<facebook::react::Scheduler> const& weakScheduler) {
  facebook::react::SystraceSection s(
      "#RNOH::SchedulerDelegate::performTransaction");
  RNOHMarker::logMarker(
      RNOHMarker::RNOHMarkerId::FABRIC_FINISH_TRANSACTION_START);
  auto surfaceId = mountingCoordinator->getSurfaceId();
  mountingCoordinator->getTelemetryController().pullTransaction(
      [&mountingManager](
          auto const& transaction, auto const& /*surfaceTelemetry*/) {
        mountingManager->willMount(transaction.getMutations());
      },
      [&mountingManager](
          auto const& transaction, auto const& /*surfaceTelemetry*/) {
        mountingManager->doMount(transaction.getMutations());
      },
      [&](auto const& transaction, auto const& /*surfaceTelemetry*/) {
        mountingManager->didMount(transaction.getMutations());
        if (auto scheduler = weakScheduler.lock()) {
          scheduler->reportMount(surfaceId);
        }
        logTransactionTelemetryMarkers(transaction);
      });
}

void SchedulerDelegate::schedulerShouldRenderTransactions(
    const MountingCoordinator::Shared& mountingCoordinator) {
  facebook::react::SystraceSection s(
      "#RNOH::SchedulerDelegate::schedulerShouldRenderTransactions");
  performOnMainThread([transactionState = m_transactionState,
                       mountingCoordinator,
                       scheduler = m_scheduler](auto mountingManager) {
    facebook::react::SystraceSection s(
        "#RNOH::SchedulerDelegate::schedulerShouldRenderTransactions::MAIN");
    if (transactionState->transactionInFlight) {
      transactionState->followUpTransactionRequired = true;
      return;
    }

    do {
      transactionState->followUpTransactionRequired = false;
      transactionState->transactionInFlight = true;
      performTransaction(mountingCoordinator, mountingManager, scheduler);
      transactionState->transactionInFlight = false;
    } while (transactionState->followUpTransactionRequired);
  });
}

void SchedulerDelegate::setScheduler(
    std::shared_ptr<facebook::react::Scheduler> const& scheduler) {
  m_scheduler = scheduler;
}

} // namespace rnoh
