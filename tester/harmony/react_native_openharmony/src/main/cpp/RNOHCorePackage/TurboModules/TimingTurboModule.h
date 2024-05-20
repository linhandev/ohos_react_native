#pragma once

#include "RNOH/ArkTSTurboModule.h"
#include <uv.h>
#include <thread>
#include <map>
#include "uv/EventLoop.h"
#include "uv/Timer.h"
#include <functional>
namespace rnoh {
class JSI_EXPORT TimingTurboModule : public ArkTSTurboModule {
 public:
  TimingTurboModule(
      const ArkTSTurboModule::Context ctx,
      const std::string name);
  ~TimingTurboModule() override;

  void createTimer(
    double id,
    double duration,
    double jsSchedulingTime,
    bool repeat);
  void deleteTimer(double id);
  void setSendIdleEvents(bool enabled);
  facebook::jsi::Runtime* runtime;

 private:
  void initLoop();
  std::map<double, uv::Timer*> nativeTimerMap;
  uv::EventLoop* loop;
};

} // namespace rnoh