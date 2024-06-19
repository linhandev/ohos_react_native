#include "RNInstanceCAPI.h"

#include "RNOH/Assert.h"

using namespace facebook;
namespace rnoh {

RNInstanceCAPI::~RNInstanceCAPI() noexcept {
  DLOG(INFO) << "~RNInstanceCAPI::start";
  if (m_unsubscribeUITickListener != nullptr) {
    m_unsubscribeUITickListener();
  }
  // clear non-thread-safe objects on the main thread
  // by moving them into a task
  m_taskExecutor->runTask(
      TaskThread::MAIN,
      [mountingManager = std::move(m_mountingManager),
       componentInstanceRegistry = std::move(m_componentInstanceRegistry),
       componentInstanceFactory = std::move(m_componentInstanceFactory),
       // NOTE: `XComponentSurface` is not copyable, but `std::function` is, so
       // we need to move the map into a shared_ptr first in order to capture it
       surfaces = std::make_shared<decltype(m_surfaceById)>(
           std::move(m_surfaceById))] {});
  DLOG(INFO) << "~RNInstanceCAPI::stop";
}

void RNInstanceCAPI::synchronouslyUpdateViewOnUIThread(
    facebook::react::Tag tag,
    folly::dynamic props) {
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceCAPI::synchronouslyUpdateViewOnUIThread");
  DLOG(INFO) << "RNInstanceCAPI::synchronouslyUpdateViewOnUIThread";
  RNOH_ASSERT(m_taskExecutor->getCurrentTaskThread() == TaskThread::MAIN);

  auto componentInstance = m_componentInstanceRegistry->findByTag(tag);
  if (componentInstance == nullptr) {
    LOG(ERROR)
        << "RNInstanceCAPI::synchronouslyUpdateViewOnUIThread: could not find componentInstance for tag: "
        << tag;
    return;
  }

  auto componentHandle = componentInstance->getComponentHandle();
  auto componentDescriptor =
      m_scheduler->findComponentDescriptorByHandle_DO_NOT_USE_THIS_IS_BROKEN(
          componentHandle);
  if (componentDescriptor == nullptr) {
    LOG(ERROR)
        << "RNInstanceCAPI::synchronouslyUpdateViewOnUIThread: could not find componentDescriptor for tag: "
        << tag;
    return;
  }

  m_mountingManager->updateView(tag, std::move(props), *componentDescriptor);
}

void RNInstanceCAPI::registerNativeXComponentHandle(
    OH_NativeXComponent* nativeXComponent,
    facebook::react::Tag surfaceId) {
  DLOG(INFO) << "RNInstanceCAPI::registerNativeXComponentHandle";
  if (nativeXComponent == nullptr) {
    return;
  }
  // NOTE: for some reason, attaching in the NAPI call made by XComponent
  // fails to mount the ArkUI node. Posting a task to be executed separately
  // fixes the issue.
  m_taskExecutor->runTask(
      TaskThread::MAIN, [this, nativeXComponent, surfaceId] {
        auto it = m_surfaceById.find(surfaceId);
        if (it == m_surfaceById.end()) {
          LOG(ERROR) << "Surface with id: " << surfaceId << " not found";
          return;
        }
        it->second.attachNativeXComponent(nativeXComponent);
      });
}

void RNInstanceCAPI::createSurface(
    facebook::react::Tag surfaceId,
    std::string const& moduleName) {
  DLOG(INFO) << "RNInstanceCAPI::createSurface";
  m_surfaceById.emplace(
      surfaceId,
      XComponentSurface(
          m_scheduler,
          m_componentInstanceRegistry,
          m_componentInstanceFactory,
          m_arkTsMessageHub,
          surfaceId,
          m_id,
          moduleName));
}

void RNInstanceCAPI::updateSurfaceConstraints(
    facebook::react::Tag surfaceId,
    float width,
    float height,
    float viewportOffsetX,
    float viewportOffsetY,
    float pixelRatio,
    bool isRTL) {
  DLOG(INFO) << "RNInstanceCAPI::updateSurfaceConstraints";
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceCAPI::updateSurfaceConstraints");
  auto it = m_surfaceById.find(surfaceId);
  if (it == m_surfaceById.end()) {
    return;
  }
  it->second.updateConstraints(
      width, height, viewportOffsetX, viewportOffsetY, pixelRatio, isRTL);
}

void RNInstanceCAPI::startSurface(
    facebook::react::Tag surfaceId,
    float width,
    float height,
    float viewportOffsetX,
    float viewportOffsetY,
    float pixelRatio,
    bool isRTL,
    folly::dynamic&& initialProps) {
  DLOG(INFO) << "RNInstanceCAPI::startSurface";
  auto it = m_surfaceById.find(surfaceId);
  if (it == m_surfaceById.end()) {
    return;
  }
  it->second.start(
      width,
      height,
      viewportOffsetX,
      viewportOffsetY,
      pixelRatio,
      isRTL,
      std::move(initialProps),
      m_animationDriver);
}

void RNInstanceCAPI::setSurfaceProps(
    facebook::react::Tag surfaceId,
    folly::dynamic&& props) {
  DLOG(INFO) << "RNInstanceCAPI::setSurfaceProps";
  facebook::react::SystraceSection s("#RNOH::RNInstanceCAPI::setSurfaceProps");
  auto it = m_surfaceById.find(surfaceId);
  if (it == m_surfaceById.end()) {
    return;
  }
  it->second.setProps(std::move(props));
}

void RNInstanceCAPI::stopSurface(facebook::react::Tag surfaceId) {
  DLOG(INFO) << "RNInstanceCAPI::stopSurface";
  auto it = m_surfaceById.find(surfaceId);
  if (it == m_surfaceById.end()) {
    return;
  }
  it->second.stop();
}

void RNInstanceCAPI::destroySurface(facebook::react::Tag surfaceId) {
  DLOG(INFO) << "RNInstanceCAPI::destroySurface";
  auto it = m_surfaceById.find(surfaceId);
  if (it == m_surfaceById.end()) {
    return;
  }
  m_surfaceById.erase(it);
}

void RNInstanceCAPI::setSurfaceDisplayMode(
    facebook::react::Tag surfaceId,
    facebook::react::DisplayMode displayMode) {
  DLOG(INFO) << "RNInstanceCAPI::setSurfaceDisplayMode";
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceCAPI::setSurfaceDisplayMode");
  auto it = m_surfaceById.find(surfaceId);
  if (it == m_surfaceById.end()) {
    return;
  }
  it->second.setDisplayMode(displayMode);
}

ComponentInstance::Shared RNInstanceCAPI::findComponentInstanceByTag(
    facebook::react::Tag tag) {
  return m_componentInstanceRegistry->findByTag(tag);
}

std::optional<facebook::react::Tag>
RNInstanceCAPI::findComponentInstanceTagById(const std::string& id) {
  return m_componentInstanceRegistry->findTagById(id);
}

std::optional<std::string> RNInstanceCAPI::getNativeNodeIdByTag(
    facebook::react::Tag tag) const {
  auto componentInstance = m_componentInstanceRegistry->findByTag(tag);
  if (componentInstance == nullptr) {
    return std::nullopt;
  }
  return componentInstance->getLocalRootArkUINode().getId();
}

NativeResourceManager const* RNInstanceCAPI::getNativeResourceManager() const {
  RNOH_ASSERT(m_nativeResourceManager != nullptr);
  return m_nativeResourceManager.get();
}

std::shared_ptr<TurboModuleProvider>
RNInstanceCAPI::createTurboModuleProvider() {
  DLOG(INFO) << "RNInstanceCAPI::createTurboModuleProvider";
  auto sharedInstance = shared_from_this();
  auto turboModuleProvider = std::make_shared<TurboModuleProvider>(
      m_reactInstance->getJSCallInvoker(),
      std::move(m_turboModuleFactory),
      m_eventDispatcher,
      std::move(m_jsQueue),
      sharedInstance);
  turboModuleProvider->installJSBindings(m_reactInstance->getRuntimeExecutor());
  return turboModuleProvider;
}
} // namespace rnoh
