#pragma once
#include "RNOH/RNInstanceInternal.h"

namespace rnoh {

class RNInstanceArkTS : public RNInstanceInternal {
 public:
  using RNInstanceInternal::RNInstanceInternal;

  ~RNInstanceArkTS() noexcept override {
    if (m_unsubscribeUITickListener != nullptr) {
      m_unsubscribeUITickListener();
    }
    // synchronization primitives used to ensure all tasks currently in queue
    // run before this destructor returns. This ensures the tasks scheduled by
    // this object are not running after the object is destroyed.
    std::mutex surfacesUnregisteredMutex;
    std::condition_variable cv;
    std::unique_lock lock(surfacesUnregisteredMutex);
    m_taskExecutor->runTask(
        TaskThread::JS, [this, &cv, &surfacesUnregisteredMutex] {
          std::unique_lock lock(surfacesUnregisteredMutex);
          for (auto& [_tag, surfaceHandler] : surfaceHandlers) {
            if (surfaceHandler->getStatus() ==
                facebook::react::SurfaceHandler::Status::Running) {
              surfaceHandler->stop();
            }
            m_scheduler->unregisterSurface(*surfaceHandler);
          }
          cv.notify_one();
        });
    // block until the task has finished running,
    // to ensure that the instance is not destroyed before all surface are
    // unregistered
    cv.wait(lock);
  }

  void createSurface(
      facebook::react::Tag surfaceId,
      std::string const& moduleName) override;
  void updateSurfaceConstraints(
      facebook::react::Tag surfaceId,
      float width,
      float height,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL) override;
  void startSurface(
      facebook::react::Tag surfaceId,
      float width,
      float height,
      float viewportOffsetX,
      float viewportOffsetY,
      float pixelRatio,
      bool isRTL,
      folly::dynamic&& initialProps) override;
  void setSurfaceProps(facebook::react::Tag surfaceId, folly::dynamic&& props)
      override;
  void stopSurface(facebook::react::Tag surfaceId) override;
  void destroySurface(facebook::react::Tag surfaceId) override;
  void setSurfaceDisplayMode(
      facebook::react::Tag surfaceId,
      facebook::react::DisplayMode displayMode) override;
  void synchronouslyUpdateViewOnUIThread(
      facebook::react::Tag tag,
      folly::dynamic props) override;
  NativeResourceManager const* getNativeResourceManager() const override;

 protected:
  std::shared_ptr<TurboModuleProvider> createTurboModuleProvider() override;

  std::map<
      facebook::react::Tag,
      std::shared_ptr<facebook::react::SurfaceHandler>>
      surfaceHandlers;
};

} // namespace rnoh
