#pragma once

#include <unordered_map>
#include "RNOH/ArkTSMessageHub.h"
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT TimingTurboModule
    : public ArkTSTurboModule,
      public std::enable_shared_from_this<TimingTurboModule> {
 public:
  TimingTurboModule(
      const ArkTSTurboModule::Context ctx,
      const std::string name);

  ~TimingTurboModule() override;

  void createTimer(
      double id,
      double duration,
      double jsSchedulingTime,
      bool repeats);
  void deleteTimer(double id);
  void setSendIdleEvents(bool sendIdleEvents);

  void onForeground();
  void onBackground();

 private:
  using Weak = std::weak_ptr<TimingTurboModule>;
  using Shared = std::shared_ptr<TimingTurboModule>;

  /**
   * @thread: MAIN
   * This class listens for lifecycle events and pauses/resumes timers.
   */
  class LifecycleObserver : public ArkTSMessageHub::Observer {
   public:
    LifecycleObserver(
        Weak timingTurboModule,
        ArkTSMessageHub::Shared const& messageHub)
        : ArkTSMessageHub::Observer(messageHub),
          m_timingTurboModule(timingTurboModule) {}
    void onMessageReceived(ArkTSMessage const& message) override;

   private:
    Weak m_timingTurboModule;
  };

  void triggerTimer(double id);
  void resumeTimers();
  void pauseTimers();

  void assertJSThread() const;

  struct Timer {
    double id;
    double duration;
    double jsSchedulingTime;
    bool repeats;
  };

  bool isForeground{true};
  std::unordered_map<double, TaskExecutor::DelayedTask> m_timerTaskById{};
  std::unordered_map<double, Timer> m_activeTimerById{};
  std::shared_ptr<LifecycleObserver> m_lifecycleObserver = nullptr;
};

} // namespace rnoh