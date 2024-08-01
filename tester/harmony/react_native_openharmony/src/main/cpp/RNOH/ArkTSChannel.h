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
      executor->runTask(TaskThread::MAIN, [=]() {
        auto napi_event_handler =
            m_arkJS.getReferenceValue(m_napi_event_dispatcher_ref);
        m_arkJS.call<2>(
            napi_event_handler,
            {m_arkJS.createString(type), m_arkJS.createFromDynamic(payload)});
      });
    }
  }
};
} // namespace rnoh