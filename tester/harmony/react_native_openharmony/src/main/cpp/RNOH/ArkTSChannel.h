#pragma once
#include <folly/dynamic.h>
#include <glog/logging.h>
#include <string>
#include "ArkJS.h"
#include "TaskExecutor/TaskExecutor.h"

namespace rnoh {
class ArkTSChannel {
  ArkJS m_arkJS;
  napi_ref m_napi_event_dispatcher_ref;
  TaskExecutor::Shared m_taskExecutor;

 public:
  using Shared = std::shared_ptr<ArkTSChannel>;

  ArkTSChannel(
      TaskExecutor::Shared taskExecutor,
      ArkJS arkJS,
      napi_ref napiEventDispatcherRef)
      : m_arkJS(arkJS),
        m_napi_event_dispatcher_ref(napiEventDispatcherRef),
        m_taskExecutor(taskExecutor) {}

  void postMessage(std::string type, folly::dynamic payload) {
    m_taskExecutor->runTask(TaskThread::MAIN, [=]() {
      auto napi_event_handler =
          m_arkJS.getReferenceValue(m_napi_event_dispatcher_ref);
      m_arkJS.call<2>(
          napi_event_handler,
          {m_arkJS.createString(type), m_arkJS.createFromDynamic(payload)});
    });
  }
};
} // namespace rnoh