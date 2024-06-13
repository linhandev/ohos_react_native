#include "RNInstanceArkTS.h"

using namespace facebook;
using namespace rnoh;

void rnoh::RNInstanceArkTS::createSurface(
    react::Tag surfaceId,
    std::string const& appKey) {
  m_taskExecutor->runTask(TaskThread::JS, [this, surfaceId, appKey] {
    if (surfaceHandlers.count(surfaceId)) {
      LOG(ERROR) << "createSurface: Surface with surface id " << surfaceId
                 << " already exists.";
      return;
    }
    auto surfaceHandler =
        std::make_shared<react::SurfaceHandler>(appKey, surfaceId);
    m_scheduler->registerSurface(*surfaceHandler);
    surfaceHandlers.insert({surfaceId, std::move(surfaceHandler)});
  });
}

void RNInstanceArkTS::startSurface(
    react::Tag surfaceId,
    float width,
    float height,
    float viewportOffsetX,
    float viewportOffsetY,
    float pixelRatio,
    bool isRTL,
    folly::dynamic&& initialProps) {
  m_taskExecutor->runTask(TaskThread::JS, [=] {
    try {
      auto it = surfaceHandlers.find(surfaceId);
      if (it == surfaceHandlers.end()) {
        LOG(ERROR) << "startSurface: No surface with id " << surfaceId;
        return;
      }

      auto surfaceHandler = it->second;
      surfaceHandler->setProps(std::move(initialProps));
      auto layoutConstraints = surfaceHandler->getLayoutConstraints();
      layoutConstraints.layoutDirection = isRTL
          ? react::LayoutDirection::RightToLeft
          : react::LayoutDirection::LeftToRight;
      layoutConstraints.minimumSize =
          layoutConstraints.maximumSize = {.width = width, .height = height};
      auto layoutContext = surfaceHandler->getLayoutContext();
      layoutContext.viewportOffset = {viewportOffsetX, viewportOffsetY};
      layoutContext.pointScaleFactor = pixelRatio;
      surfaceHandler->constraintLayout(layoutConstraints, layoutContext);
      LOG(INFO) << "startSurface::starting: surfaceId=" << surfaceId;
      surfaceHandler->start();
      LOG(INFO) << "startSurface::started surfaceId=" << surfaceId;
      auto mountingCoordinator = surfaceHandler->getMountingCoordinator();
      mountingCoordinator->setMountingOverrideDelegate(m_animationDriver);
    } catch (const std::exception& e) {
      LOG(ERROR) << "startSurface: " << e.what() << "\n";
      throw e;
    };
  });
}

void rnoh::RNInstanceArkTS::setSurfaceProps(
    facebook::react::Tag surfaceId,
    folly::dynamic&& props) {
  m_taskExecutor->runTask(TaskThread::JS, [=] {
    auto it = surfaceHandlers.find(surfaceId);
    if (it == surfaceHandlers.end()) {
      LOG(ERROR) << "setSurfaceProps: No surface with id " << surfaceId;
      return;
    }
    it->second->setProps(std::move(props));
  });
}

void rnoh::RNInstanceArkTS::stopSurface(react::Tag surfaceId) {
  m_taskExecutor->runTask(TaskThread::JS, [=] {
    auto it = surfaceHandlers.find(surfaceId);
    if (it == surfaceHandlers.end()) {
      LOG(ERROR) << "stopSurface: No surface with id " << surfaceId;
      return;
    }
    auto surfaceHandle = it->second;
    LOG(INFO) << "stopSurface: stopping " << surfaceId;
    try {
      surfaceHandle->stop();
      LOG(INFO) << "stopSurface: stopped " << surfaceId;
    } catch (const std::exception& e) {
      LOG(ERROR) << "stopSurface: failed - " << e.what() << "\n";
      throw e;
    };
  });
}

void rnoh::RNInstanceArkTS::destroySurface(react::Tag surfaceId) {
  m_taskExecutor->runTask(TaskThread::JS, [=] {
    auto it = surfaceHandlers.find(surfaceId);
    if (it == surfaceHandlers.end()) {
      LOG(ERROR) << "destroySurface: No surface with id " << surfaceId;
      return;
    }
    m_scheduler->unregisterSurface(*it->second);
    surfaceHandlers.erase(it);
  });
}

void rnoh::RNInstanceArkTS::setSurfaceDisplayMode(
    facebook::react::Tag surfaceId,
    facebook::react::DisplayMode displayMode) {
  m_taskExecutor->runTask(TaskThread::JS, [this, surfaceId, displayMode]() {
    try {
      auto surfaceIt = surfaceHandlers.find(surfaceId);
      if (surfaceIt == surfaceHandlers.end()) {
        LOG(ERROR) << "setSurfaceDisplayMode: No surface with id " << surfaceId;
        return;
      }
      auto surfaceHandler = surfaceIt->second;
      surfaceHandler->setDisplayMode(displayMode);
    } catch (const std::exception& e) {
      LOG(ERROR) << "setSurfaceDisplayMode: " << e.what() << "\n";
      throw e;
    }
  });
}

void RNInstanceArkTS::updateSurfaceConstraints(
    react::Tag surfaceId,
    float width,
    float height,
    float viewportOffsetX,
    float viewportOffsetY,
    float pixelRatio,
    bool isRTL) {
  m_taskExecutor->runTask(
      TaskThread::JS,
      [this,
       surfaceId,
       width,
       height,
       viewportOffsetX,
       viewportOffsetY,
       pixelRatio,
       isRTL]() {
        try {
          if (surfaceHandlers.count(surfaceId) == 0) {
            LOG(ERROR) << "updateSurfaceConstraints: No surface with id "
                       << surfaceId;
            return;
          }
          auto layoutConstraints =
              surfaceHandlers[surfaceId]->getLayoutConstraints();
          layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
              .width = width, .height = height};
          auto layoutContext = surfaceHandlers[surfaceId]->getLayoutContext();
          layoutContext.viewportOffset = {viewportOffsetX, viewportOffsetY};
          layoutContext.pointScaleFactor = pixelRatio;

          surfaceHandlers[surfaceId]->constraintLayout(
              layoutConstraints, layoutContext);
        } catch (const std::exception& e) {
          LOG(ERROR) << "updateSurfaceConstraints: " << e.what() << "\n";
          throw e;
        }
      });
}

void RNInstanceArkTS::synchronouslyUpdateViewOnUIThread(
    facebook::react::Tag /*tag*/,
    folly::dynamic /*props*/) {
  LOG(WARNING)
      << "RNInstance::synchronouslyUpdateViewOnUIThread is not supported in ArkTS architecture";
};

NativeResourceManager const* rnoh::RNInstanceArkTS::getNativeResourceManager()
    const {
  throw RNOHError(
      "NativeResourceManager is not supported in ArkTS architecture");
}

std::shared_ptr<TurboModuleProvider>
RNInstanceArkTS::createTurboModuleProvider() {
  DLOG(INFO) << "RNInstanceArkTS::createTurboModuleProvider";
  auto turboModuleProvider = std::make_shared<TurboModuleProvider>(
      m_reactInstance->getJSCallInvoker(),
      std::move(m_turboModuleFactory),
      m_eventDispatcher,
      std::move(m_jsQueue),
      nullptr);
  turboModuleProvider->installJSBindings(m_reactInstance->getRuntimeExecutor());
  return turboModuleProvider;
}