#include "SchedulerDelegate.h"
#include <react/renderer/debug/SystraceSection.h>
#include "RNOH/Performance/HarmonyReactMarker.h"

namespace rnoh {
SchedulerDelegate::~SchedulerDelegate() {
  DLOG(INFO) << "~SchedulerDelegate";
}

void SchedulerDelegate::schedulerDidFinishTransaction(
    MountingCoordinator::Shared mountingCoordinator) {
  facebook::react::SystraceSection s(
      "#RNOH::SchedulerDelegate::schedulerDidFinishTransaction");
  HarmonyReactMarker::logMarker(HarmonyReactMarker::HarmonyReactMarkerId::
                                    FABRIC_FINISH_TRANSACTION_START);
  mountingCoordinator->getTelemetryController().pullTransaction(
      [this](auto const& transaction, auto const& surfaceTelemetry) {
        performOnMainThread(
            [transaction](MountingManager::Shared const& mountingManager) {
              mountingManager->willMount(transaction.getMutations());
            });
      },
      [this](auto const& transaction, auto const& surfaceTelemetry) {
        performOnMainThread(
            [transaction](MountingManager::Shared const& mountingManager) {
              mountingManager->doMount(transaction.getMutations());
            });
      },
      [this](auto const& transaction, auto const& surfaceTelemetry) {
        performOnMainThread(
            [transaction](MountingManager::Shared const& mountingManager) {
              mountingManager->didMount(transaction.getMutations());
            });
        logTransactionTelemetryMarkers(transaction);
      });
}

void SchedulerDelegate::logTransactionTelemetryMarkers(
    MountingTransaction const& transaction) {
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::FABRIC_FINISH_TRANSACTION_END);
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

  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::FABRIC_COMMIT_START,
      "",
      commitStartTime);
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::FABRIC_COMMIT_END,
      "",
      commitEndTime);
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::FABRIC_DIFF_START,
      "",
      diffStartTime);
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::FABRIC_DIFF_END,
      "",
      diffEndTime);
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::FABRIC_LAYOUT_START,
      "",
      layoutStartTime);
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::FABRIC_LAYOUT_END,
      "",
      layoutEndTime);
}

void SchedulerDelegate::schedulerDidRequestPreliminaryViewAllocation(
    SurfaceId surfaceId,
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
      shadowNode.getProps(),
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
    std::string const& eventType) {}

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

} // namespace rnoh