#include "SchedulerDelegate.h"
#include <cxxreact/SystraceSection.h>
#include "RNOH/Performance/HarmonyReactMarker.h"

namespace rnoh {
SchedulerDelegate::~SchedulerDelegate() {
  DLOG(INFO) << "~SchedulerDelegate";
}

void SchedulerDelegate::schedulerDidFinishTransaction(
    const MountingCoordinator::Shared& mountingCoordinator) {
  facebook::react::SystraceSection s(
      "#RNOH::SchedulerDelegate::schedulerDidFinishTransaction");
  performOnMainThread([mountingCoordinator](auto mountingManager) {
    facebook::react::SystraceSection s(
        "#RNOH::SchedulerDelegate::schedulerDidFinishTransaction::pullTransaction");
    HarmonyReactMarker::logMarker(HarmonyReactMarker::HarmonyReactMarkerId::
                                      FABRIC_FINISH_TRANSACTION_START);
    mountingCoordinator->getTelemetryController().pullTransaction(
        [&mountingManager](
            auto const& transaction, auto const& /*surfaceTelemetry*/) {
          mountingManager->willMount(transaction.getMutations());
        },
        [&mountingManager](
            auto const& transaction, auto const& /*surfaceTelemetry*/) {
          mountingManager->doMount(transaction.getMutations());
        },
        [&mountingManager](
            auto const& transaction, auto const& /*surfaceTelemetry*/) {
          mountingManager->didMount(transaction.getMutations());
          logTransactionTelemetryMarkers(transaction);
        });
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
    const ShadowNode& shadowNode) {
  facebook::react::SystraceSection s(
      "#RNOH::SchedulerDelegate::schedulerDidRequestPreliminaryViewAllocation");
  auto preallocationRequestQueue = m_weakPreallocationRequestQueue.lock();
  if (preallocationRequestQueue == nullptr) {
    return;
  }
  preallocationRequestQueue->push(ShadowView{shadowNode});
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

} // namespace rnoh
