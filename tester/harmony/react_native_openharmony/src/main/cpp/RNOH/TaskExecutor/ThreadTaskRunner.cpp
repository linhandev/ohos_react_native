#include "ThreadTaskRunner.h"

namespace rnoh {
ThreadTaskRunner::ThreadTaskRunner(
    std::string name,
    std::unique_ptr<uv::EventLoop> eventLoop,
    ExceptionHandler exceptionHandler)
    : EventLoopTaskRunner(
          std::move(name),
          eventLoop->handle(),
          std::move(exceptionHandler)),
      m_eventLoop(std::move(eventLoop)),
      m_thread([this] { m_eventLoop->run(); }) {}

ThreadTaskRunner::~ThreadTaskRunner() {
  m_thread.detach();
}

bool ThreadTaskRunner::isOnCurrentThread() const {
  return m_thread.get_id() == std::this_thread::get_id();
}

} // namespace rnoh