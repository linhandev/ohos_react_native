#include "SchedulerDelegate.h"

namespace rnoh {

void SchedulerDelegate::schedulerDidFinishTransaction(
    MountingCoordinator::Shared mountingCoordinator) {
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
      });
}

void SchedulerDelegate::schedulerDidDispatchCommand(
    const ShadowView& shadowView,
    std::string const& commandName,
    folly::dynamic const& args) {
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
  performOnMainThread([shadowView, isJSResponder, blockNativeResponder](
                          MountingManager::Shared const& mountingManager) {
    mountingManager->setIsJsResponder(
        shadowView, isJSResponder, blockNativeResponder);
  });
}

} // namespace rnoh