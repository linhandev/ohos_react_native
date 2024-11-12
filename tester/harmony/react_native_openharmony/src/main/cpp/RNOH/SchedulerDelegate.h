#pragma once

#include <react/renderer/scheduler/SchedulerDelegate.h>
#include <react/utils/Telemetry.h>
#include "RNOH/ComponentInstancePreallocationRequestQueue.h"
#include "RNOH/MountingManager.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"

namespace rnoh {

/**
 * @ThreadSafe
 *
 * Implementation of the react::SchedulerDelegate interface.
 * Schedules operations on the main thread
 * and delegates them to the MountingManager.
 */
class SchedulerDelegate final : public facebook::react::SchedulerDelegate {
  using MountingCoordinator = facebook::react::MountingCoordinator;
  using ShadowNode = facebook::react::ShadowNode;
  using ShadowView = facebook::react::ShadowView;
  using SurfaceId = facebook::react::SurfaceId;

 public:
  SchedulerDelegate(
      MountingManager::Shared mountingManager,
      TaskExecutor::Shared taskExecutor,
      ComponentInstancePreallocationRequestQueue::Weak
          weakPreallocationRequestQueue)
      : m_mountingManager(mountingManager),
        m_taskExecutor(taskExecutor),
        m_weakPreallocationRequestQueue(
            std::move(weakPreallocationRequestQueue)){};

  ~SchedulerDelegate() override;

  void schedulerShouldRenderTransactions(
      const MountingCoordinator::Shared& mountingCoordinator) override;

  void schedulerDidFinishTransaction(
      const MountingCoordinator::Shared& mountingCoordinator) override;

  void schedulerDidRequestPreliminaryViewAllocation(
      const ShadowNode& shadowView) override;

  void schedulerDidDispatchCommand(
      const ShadowView& shadowView,
      std::string const& commandName,
      folly::dynamic const& args) override;

  void schedulerDidSendAccessibilityEvent(
      const ShadowView& shadowView,
      std::string const& eventType) override;

  void schedulerDidSetIsJSResponder(
      ShadowView const& shadowView,
      bool isJSResponder,
      bool blockNativeResponder) override;

  void setScheduler(
      std::shared_ptr<facebook::react::Scheduler> const& scheduler);

 private:
  template <typename Operation>
  void performOnMainThread(Operation operation) {
    if (m_taskExecutor->isOnTaskThread(TaskThread::MAIN)) {
      if (auto mountingManager = m_mountingManager.lock()) {
        operation(mountingManager);
      }
      return;
    }

    m_taskExecutor->runTask(
        TaskThread::MAIN,
        [weakMountingManager = m_mountingManager,
         operation = std::move(operation)] {
          if (auto mountingManager = weakMountingManager.lock()) {
            operation(mountingManager);
          }
        });
  }

  struct TransactionState final {
    bool transactionInFlight = false;
    bool followUpTransactionRequired = false;
  };

  MountingManager::Weak m_mountingManager;
  TaskExecutor::Shared m_taskExecutor;
  ComponentInstancePreallocationRequestQueue::Weak
      m_weakPreallocationRequestQueue;
  std::shared_ptr<TransactionState> m_transactionState =
      std::make_shared<TransactionState>();
  std::weak_ptr<facebook::react::Scheduler> m_scheduler{};
};

}; // namespace rnoh
