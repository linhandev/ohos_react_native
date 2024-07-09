#pragma once

#include <memory>
#include "EventLoopTaskRunner.h"
#include "uv/EventLoop.h"

namespace rnoh {

class ThreadTaskRunner : public EventLoopTaskRunner {
 public:
  ThreadTaskRunner(
      std::string name,
      std::unique_ptr<uv::EventLoop> eventLoop =
          std::make_unique<uv::EventLoop>(),
      ExceptionHandler exceptionHandler = defaultExceptionHandler);
  ~ThreadTaskRunner() override;

  bool isOnCurrentThread() const override;

 protected:
  std::unique_ptr<uv::EventLoop> m_eventLoop;
  std::thread m_thread;
};
} // namespace rnoh