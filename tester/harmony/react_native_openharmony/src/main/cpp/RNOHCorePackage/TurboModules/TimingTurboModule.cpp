#include "TimingTurboModule.h"
#include <thread>
#include "RNOH/RNInstance.h"
#include "RNOH/RNInstanceCAPI.h"
#include <chrono>
#include <functional>

namespace rnoh {

using namespace facebook;

class TimingArkTSMessageHandler: public ArkTSMessageHandler {
  public:
  TimingArkTSMessageHandler(TimingTurboModule* turboModule)
      : m_turboModule(turboModule) {}
  void handleArkTSMessage(const Context& ctx) override
  {
    if (ctx.messageName == "TimingCreateTimer") {
      m_turboModule->createTimer(ctx.messagePayload[0].asDouble(),
                                 ctx.messagePayload[1].asDouble(),
                                 0,
                                 ctx.messagePayload[2].asBool());
    }
  }
  TimingTurboModule* m_turboModule;
};

static jsi::Value __hostFunction_TimingTurboModule_createTimer(
    jsi::Runtime& rt,
    react::TurboModule& turboModule,
    const jsi::Value* args,
    size_t count) {
  auto self = static_cast<TimingTurboModule*>(&turboModule);
  self->runtime = &rt;
  self->createTimer(args[0].getNumber(),
                    args[1].getNumber(),
                    args[2].getNumber(),
                    args[3].getBool()
                    );
  return jsi::Value::undefined();
}

static jsi::Value __hostFunction_TimingTurboModule_deleteTimer(
    jsi::Runtime& rt,
    react::TurboModule& turboModule,
    const jsi::Value* args,
    size_t count) {
  auto self = static_cast<TimingTurboModule*>(&turboModule);
  self->deleteTimer(args[0].getNumber());
  return jsi::Value::undefined();
}

static jsi::Value __hostFunction_TimingTurboModule_setSendIdleEvents(
    jsi::Runtime& rt,
    react::TurboModule& turboModule,
    const jsi::Value* args,
    size_t count) {
  auto self = static_cast<TimingTurboModule*>(&turboModule);
  self->setSendIdleEvents(args[0].getBool());
  return jsi::Value::undefined();
}

TimingTurboModule::TimingTurboModule(
    const ArkTSTurboModule::Context ctx,
    const std::string name)
    : ArkTSTurboModule(ctx, name) {
  initLoop();
  if (auto instance = m_ctx.instance.lock(); instance != nullptr) {
    auto instanceCAPI = dynamic_cast<RNInstanceCAPI*>(instance.get());
    auto messageHandler = std::make_shared<TimingArkTSMessageHandler>(this);
    instanceCAPI->addArkTSMessageHandler(messageHandler);
  }
  methodMap_ = {
      {"createTimer", {4, __hostFunction_TimingTurboModule_createTimer}},
      {"deleteTimer", {1, __hostFunction_TimingTurboModule_deleteTimer}},
      {"setSendIdleEvents",
       {1, __hostFunction_TimingTurboModule_setSendIdleEvents}},
  };
}

folly::dynamic getObject(double callbackID) {
  auto object1 = folly::dynamic(callbackID);
  folly::dynamic object2 = folly::dynamic::array();
  object2.push_back(object1);
  folly::dynamic object3 = folly::dynamic::array();
  object3.push_back(object2);
  return object3;
}

void TimingTurboModule::initLoop() {
  loop = new uv::EventLoop();
  std::thread([&]() {
    loop->run();
  }).detach();
}

void TimingTurboModule::createTimer(
    double id,
    double duration,
    double jsSchedulingTime,
    bool repeat) {
  auto isReady = [&]()->bool{
      return this->call(*runtime, "isReady", nullptr, 0).getBool();};
  auto isPaused = [&]()->bool{
      return this->call(*runtime, "isPaused", nullptr, 0).getBool();};
  auto callback = [=](){
      facebook::jsi::Value testargs[4] ={
        facebook::jsi::Value(id),
        facebook::jsi::Value(duration),
        facebook::jsi::Value(repeat)};
      this->call(*runtime, "createTimerInCpp", testargs, 3);};
  if (auto instance = m_ctx.instance.lock(); instance != nullptr) {
    auto triggerTimer = [=](uv::Timer* timer) {
      if (isReady()) {
        instance->callFunction(
          "JSTimers", "callTimers", std::move(getObject(id)));
        if (!repeat) {
          this->deleteTimer(id);
        }
      } else if (isPaused()) {
        this->deleteTimer(id);
        callback();
      }
    };

    loop->runInThisLoopEn([=]()
    {
      std::chrono::system_clock::time_point now = std::chrono::system_clock::now();
      std::chrono::milliseconds milliseconds =
        std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch());
      uint64_t delay = milliseconds.count() - static_cast<uint64_t>(jsSchedulingTime);

      uint64_t timeout = static_cast<uint64_t>(duration)
       > delay ?(static_cast<uint64_t>(duration) - delay) : 0;
      uint64_t interval = repeat? static_cast<uint64_t>(duration) : 0;

      uv::Timer * timer = new uv::Timer(loop, timeout, interval, triggerTimer);
      nativeTimerMap[id] = timer;
      timer->start();
    });
  }
}

void TimingTurboModule::deleteTimer(double id) {
  loop->runInThisLoopEn([=]() {
    auto it = nativeTimerMap.find(id);
    if (it != nativeTimerMap.end()) {
      auto timer = it->second;
      timer->stop();
      timer->close([](uv::Timer* t)
      {
        delete t;
      });
      nativeTimerMap.erase(it);
    }
  });
}

void TimingTurboModule::setSendIdleEvents(bool enabled) {
  LOG(INFO) << "TimingTurboModule::setSendIdleEvents("
            << enabled
            << "): not implemented";
}

TimingTurboModule::~TimingTurboModule() {
  for (auto it = nativeTimerMap.begin(); it != nativeTimerMap.end(); ++it) {
    auto timer = it->second;
    timer->stop();
    timer->close([](uv::Timer* t)
    {
      delete t;
    });
  }
  nativeTimerMap.clear();
  delete loop;
  loop = nullptr;
}

} // namespace rnoh