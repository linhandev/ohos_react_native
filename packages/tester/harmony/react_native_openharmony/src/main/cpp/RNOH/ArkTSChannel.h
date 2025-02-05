/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <folly/dynamic.h>
#include <glog/logging.h>
#include <string>
#include "ArkJS.h"
#include "TaskExecutor/TaskExecutor.h"

namespace rnoh {
class ArkTSChannel {
  ArkJS m_arkJS;
  NapiRef m_napi_event_dispatcher_ref;
  TaskExecutor::Weak m_taskExecutor;

 public:
  using Shared = std::shared_ptr<ArkTSChannel>;
  using Weak = std::weak_ptr<ArkTSChannel>;

  ArkTSChannel(
      TaskExecutor::Shared taskExecutor,
      ArkJS arkJS,
      NapiRef napiEventDispatcherRef)
      : m_arkJS(arkJS),
        m_napi_event_dispatcher_ref(std::move(napiEventDispatcherRef)),
        m_taskExecutor(taskExecutor) {}

  ~ArkTSChannel() {
    auto executor = m_taskExecutor.lock();
    if (executor) {
      executor->runTask(
          TaskThread::MAIN, [ref = std::move(m_napi_event_dispatcher_ref)] {});
    } else {
      // Since we cannot schedule on the main thread anymore, it's safest to
      // just leak the reference
      new NapiRef(std::move(m_napi_event_dispatcher_ref));
    }
  }

  void postMessage(std::string type, folly::dynamic payload) {
    auto executor = m_taskExecutor.lock();
    if (executor) {
      executor->runTask(
          TaskThread::MAIN,
          [env = m_arkJS.getEnv(),
           eventDispatcherRef = m_napi_event_dispatcher_ref,
           type = std::move(type),
           payload = std::move(payload)]() {
            ArkJS arkJS(env);
            auto napi_event_handler =
                arkJS.getReferenceValue(eventDispatcherRef);
            arkJS.call<2>(
                napi_event_handler,
                {arkJS.createString(type), arkJS.createFromDynamic(payload)});
          });
    }
  }
};
} // namespace rnoh
