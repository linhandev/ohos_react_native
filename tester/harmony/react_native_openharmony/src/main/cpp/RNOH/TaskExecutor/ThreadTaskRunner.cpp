#include "ThreadTaskRunner.h"
#include "RNOH/Assert.h"

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
  RNOH_ASSERT(!isOnCurrentThread());
  DLOG(INFO) << "ThreadTaskRunner::~ThreadTaskRunner()::start";
  cleanup();
  m_thread.join();
  DLOG(INFO) << "ThreadTaskRunner::~ThreadTaskRunner()::stop";
}

bool ThreadTaskRunner::isOnCurrentThread() const {
  return m_thread.get_id() == std::this_thread::get_id();
}

} // namespace rnoh