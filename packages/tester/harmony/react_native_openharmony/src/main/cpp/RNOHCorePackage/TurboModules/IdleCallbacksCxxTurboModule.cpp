/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "IdleCallbacksCxxTurboModule.h"
#include <react/bridging/Bridging.h>
#include <react/renderer/runtimescheduler/RuntimeScheduler.h>
#include <react/renderer/runtimescheduler/RuntimeSchedulerBinding.h>
#include <react/renderer/runtimescheduler/Task.h>
#include <chrono>
#include <utility>

namespace rnoh {
using namespace facebook;

jsi::Value requestIdleCallback(
    facebook::jsi::Runtime& rt,
    react::TurboModule& turboModule,
    const facebook::jsi::Value* args,
    size_t count) {
  auto self = static_cast<IdleCallbacksCxxTurboModule*>(&turboModule);
  std::optional<IdleCallbacksCxxTurboModule::RequestIdleCallbackOptions>
      options = std::nullopt;
  if (count > 1 && args[1].isObject() &&
      args[1].getObject(rt).hasProperty(rt, "timeout")) {
    auto timeout = args[1].getObject(rt).getProperty(rt, "timeout").asNumber();
    options = {.timeout = timeout};
  }
  return self->requestIdleCallback(
      rt, std::move(args[0].getObject(rt).getFunction(rt)), options);
}

jsi::Value cancelIdleCallback(
    facebook::jsi::Runtime& rt,
    react::TurboModule& turboModule,
    const facebook::jsi::Value* args,
    size_t count) {
  auto self = static_cast<IdleCallbacksCxxTurboModule*>(&turboModule);
  self->cancelIdleCallback(rt, args[0].getObject(rt));
  return facebook::jsi::Value::undefined();
}

IdleCallbacksCxxTurboModule::IdleCallbacksCxxTurboModule(
    const TurboModule::Context ctx,
    const std::string name)
    : TurboModule(ctx, name) {
  methodMap_ = {
      {"requestIdleCallback", {2, rnoh::requestIdleCallback}},
      {"cancelIdleCallback", {1, rnoh::cancelIdleCallback}},
  };
}

class IdleTaskRef : public jsi::NativeState {
 public:
  IdleTaskRef(std::shared_ptr<react::Task> task) : task(std::move(task)) {}

  std::shared_ptr<react::Task> task;
};

/**
 * NOTE: This function is copied from:
 * <react-native>/packages/react-native/ReactCommon/react/nativemodule/idlecallbacks/NativeIdleCallbacks.cpp
 */
jsi::Function makeTimeRemainingFunction(
    jsi::Runtime& runtime,
    std::shared_ptr<react::RuntimeScheduler> runtimeScheduler,
    react::RuntimeSchedulerTimePoint deadline) {
  return jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(runtime, "timeRemaining"),
      0,
      [runtimeScheduler, deadline, expired = false](
          jsi::Runtime& runtime,
          const jsi::Value& /* unused */,
          const jsi::Value* /* unused */,
          size_t /* unused */) mutable {
        double remainingTime = 0;

        // No need to access the runtime scheduler if this idle callback expired
        // already.
        if (!expired) {
          if (runtimeScheduler->getShouldYield()) {
            expired = true;
          } else {
            auto now = runtimeScheduler->now();

            remainingTime = std::max(
                static_cast<double>(
                    std::chrono::duration_cast<std::chrono::milliseconds>(
                        deadline - now)
                        .count()),
                0.0);

            if (remainingTime == 0) {
              expired = true;
            }
          }
        }

        return jsi::Value(runtime, remainingTime);
      });
}

IdleCallbacksCxxTurboModule::CallbackHandle
IdleCallbacksCxxTurboModule::requestIdleCallback(
    facebook::jsi::Runtime& runtime,
    facebook::jsi::Function userCallback_,
    std::optional<RequestIdleCallbackOptions> options) {
  react::SyncCallback<void(jsi::Object)> userCallback(
      runtime, std::move(userCallback_), jsInvoker_);
  /**
   * NOTE: Code below is copied from React Native and slightly adapted by using
   * namespaces explicitly.
   * <react-native>/packages/react-native/ReactCommon/react/nativemodule/idlecallbacks/NativeIdleCallbacks.cpp
   */
  auto binding = react::RuntimeSchedulerBinding::getBinding(runtime);
  auto runtimeScheduler = binding->getRuntimeScheduler();

  // handle timeout parameter
  std::optional<react::RuntimeSchedulerTimeout> timeout;
  std::optional<react::RuntimeSchedulerTimePoint> expirationTime;

  if (options.has_value() && options.value().timeout.has_value()) {
    auto userTimeout = (options.value().timeout.value());
    if (userTimeout > 0) {
      timeout = std::chrono::duration_cast<std::chrono::milliseconds>(
          std::chrono::duration<double, std::milli>(userTimeout));
      expirationTime = runtimeScheduler->now() + timeout.value();
    }
  }

  auto userCallbackShared =
      std::make_shared<react::SyncCallback<void(jsi::Object)>>(
          std::move(userCallback));

  auto wrappedCallback = [runtimeScheduler, expirationTime, userCallbackShared](
                             jsi::Runtime& runtime) -> void {
    // This implementation gives each idle callback a 50ms deadline, instead of
    // being shared by all idle callbacks. This is ok because we don't really
    // have idle periods, and if a higher priority task comes in while we're
    // executing an idle callback, we don't execute any more idle callbacks and
    // we interrupt the current one. The general outcome should be the same.

    auto executionStartTime = runtimeScheduler->now();
    auto deadline = executionStartTime + std::chrono::milliseconds(50);
    auto didTimeout = expirationTime.has_value()
        ? executionStartTime > expirationTime
        : false;

    jsi::Object idleDeadline{runtime};
    idleDeadline.setProperty(runtime, "didTimeout", didTimeout);
    idleDeadline.setProperty(
        runtime,
        "timeRemaining",
        makeTimeRemainingFunction(runtime, runtimeScheduler, deadline));

    userCallbackShared->call(std::move(idleDeadline));
  };

  std::shared_ptr<react::Task> task;
  if (timeout.has_value()) {
    task = runtimeScheduler->scheduleIdleTask(
        std::move(wrappedCallback), timeout.value());
  } else {
    task = runtimeScheduler->scheduleIdleTask(std::move(wrappedCallback));
  }

  if (task == nullptr) {
    throw jsi::JSError(
        runtime,
        "requestIdleCallback is not supported in legacy runtime scheduler");
  }

  jsi::Object taskHandle{runtime};
  auto taskNativeState = std::make_shared<IdleTaskRef>(task);
  taskHandle.setNativeState(runtime, std::move(taskNativeState));

  return taskHandle;
}

void IdleCallbacksCxxTurboModule::cancelIdleCallback(
    jsi::Runtime& runtime,
    jsi::Object handle) {
  /**
   * NOTE: This implementation was copied from React Native.
   * <react-native>/packages/react-native/ReactCommon/react/nativemodule/idlecallbacks/NativeIdleCallbacks.cpp
   */
  auto binding = react::RuntimeSchedulerBinding::getBinding(runtime);
  auto runtimeScheduler = binding->getRuntimeScheduler();

  if (!handle.hasNativeState(runtime)) {
    return;
  }

  auto taskHandle =
      std::dynamic_pointer_cast<IdleTaskRef>(handle.getNativeState(runtime));
  if (!taskHandle) {
    return;
  }

  runtimeScheduler->cancelTask(*taskHandle->task);
}

} // namespace rnoh
