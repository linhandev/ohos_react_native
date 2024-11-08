#include "RNInstanceInternal.h"

#include <cxxreact/JSBundleType.h>
#include <jsireact/JSIExecutor.h>
#include <react/renderer/animations/LayoutAnimationDriver.h>
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include <react/renderer/runtimescheduler/RuntimeSchedulerBinding.h>
#include <react/renderer/scheduler/Scheduler.h>
#include <react/runtime/hermes/HermesInstance.h>
#include <memory>
#include "HarmonyTimerRegistry.h"
#include "RNOH/AsynchronousEventBeat.h"
#include "RNOH/MessageQueueThread.h"
#include "RNOH/Performance/HarmonyReactMarker.h"
#include "RNOH/SchedulerDelegate.h"
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModuleProvider.h"
#include "TextMeasurer.h"

namespace rnoh {

using namespace facebook;

TaskExecutor::Shared RNInstanceInternal::getTaskExecutor() {
  return m_taskExecutor;
}

facebook::react::ContextContainer const&
rnoh::RNInstanceInternal::getContextContainer() const {
  DLOG(INFO) << "RNInstanceInternal::getContextContainer";
  return *m_contextContainer;
}

TurboModule::Shared RNInstanceInternal::getTurboModule(
    const std::string& name) {
  auto turboModule = m_turboModuleProvider->getTurboModule(name);
  if (turboModule != nullptr) {
    auto rnohTurboModule = std::dynamic_pointer_cast<TurboModule>(turboModule);
    if (rnohTurboModule != nullptr) {
      return rnohTurboModule;
    } else {
      LOG(ERROR) << "TurboModule '" << name
                 << "' should extend rnoh::TurboModule";
      return nullptr;
    }
  }
  return nullptr;
}

void RNInstanceInternal::postMessageToArkTS(
    const std::string& name,
    folly::dynamic const& payload) {
  m_arkTSChannel->postMessage(name, payload);
}

void RNInstanceInternal::start() {
  DLOG(INFO) << "RNInstanceInternal::start";
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::CREATE_REACT_CONTEXT_START);
  initialize();

  m_runtimeScheduler = m_reactInstance->getRuntimeScheduler();
  m_contextContainer->insert<std::weak_ptr<react::RuntimeScheduler>>(
      "RuntimeScheduler", m_runtimeScheduler);

  m_turboModuleProvider = createTurboModuleProvider();
  initializeScheduler(m_turboModuleProvider);
  m_reactInstance->getBufferedRuntimeExecutor()(
      [runtimeScheduler = m_runtimeScheduler,
       binders = m_globalJSIBinders,
       turboModuleProvider =
           m_turboModuleProvider](facebook::jsi::Runtime& rt) {
        for (auto& binder : binders) {
          binder->createBindings(rt, turboModuleProvider);
        }
      });

  auto textMeasurer =
      m_contextContainer->at<std::shared_ptr<rnoh::TextMeasurer>>(
          "textLayoutManagerDelegate");

  RNOH_ASSERT(textMeasurer != nullptr);

  auto displayMetrics = m_arkTSBridge->getDisplayMetrics().screenPhysicalPixels;
  float fontScale = displayMetrics.fontScale;
  float scale = displayMetrics.scale;

  auto halfLeading = m_arkTSBridge->getMetadata("halfLeading") == "true";

  textMeasurer->setTextMeasureParams(fontScale, scale, halfLeading);
}

void RNInstanceInternal::initialize() {
  DLOG(INFO) << "RNInstanceInternal::initialize";
  auto reactConfig = std::make_shared<react::EmptyReactNativeConfig>();
  m_contextContainer->insert("ReactNativeConfig", std::move(reactConfig));

  // create a new event dispatcher every time RN is initialized
  m_eventDispatcher = std::make_shared<EventDispatcher>();
  m_jsQueue = std::make_shared<MessageQueueThread>(m_taskExecutor);
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::REACT_BRIDGE_LOADING_START);

  auto onJSError = [this](const JsErrorHandler::ParsedError& error) {
    // TODO: implement `ArkTSBridge::handleError(ParsedError)` and call it here
    LOG(ERROR) << "Error raised when executing JS: " << error.message;
  };

  auto jsRuntime = facebook::react::HermesInstance::createJSRuntime(
      std::move(reactConfig), nullptr, m_jsQueue);

  auto timerRegistry = std::make_unique<HarmonyTimerRegistry>(m_taskExecutor);
  auto rawTimerRegistry = timerRegistry.get();
  auto timerManager =
      std::make_shared<facebook::react::TimerManager>(std::move(timerRegistry));
  rawTimerRegistry->setTimerManager(timerManager);
  m_reactInstance = std::make_shared<facebook::react::ReactInstance>(
      std::move(jsRuntime), m_jsQueue, timerManager, onJSError);
  m_reactInstance->initializeRuntime(
      {},
      // runtime installer, which is run when the runtime
      // is first initialized and provides access to the runtime
      // before the JS code is executed
      [this](facebook::jsi::Runtime& rt) { installJSBindings(rt); });
  timerManager->setRuntimeExecutor(
      m_reactInstance->getBufferedRuntimeExecutor());
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::REACT_BRIDGE_LOADING_END);
}

void RNInstanceInternal::initializeScheduler(
    std::shared_ptr<TurboModuleProvider> turboModuleProvider) {
  DLOG(INFO) << "RNInstanceInternal::initializeScheduler";
  auto runtimeExecutor = m_reactInstance->getBufferedRuntimeExecutor();

  react::EventBeat::Factory asyncEventBeatFactory =
      [runtimeExecutor, uiTicker = m_uiTicker](auto ownerBox) {
        return std::make_unique<AsynchronousEventBeat>(
            ownerBox, runtimeExecutor, uiTicker);
      };

  react::ComponentRegistryFactory componentRegistryFactory =
      [registry = m_componentDescriptorProviderRegistry](
          auto eventDispatcher, auto contextContainer) {
        return registry->createComponentDescriptorRegistry(
            {eventDispatcher, contextContainer});
      };

  react::SchedulerToolbox schedulerToolbox{
      .contextContainer = m_contextContainer,
      .componentRegistryFactory = componentRegistryFactory,
      .runtimeExecutor = runtimeExecutor,
      .asynchronousEventBeatFactory = asyncEventBeatFactory};

  m_animationDriver = std::make_shared<react::LayoutAnimationDriver>(
      runtimeExecutor, m_contextContainer, this);
  m_schedulerDelegate = std::make_unique<rnoh::SchedulerDelegate>(
      m_mountingManager,
      m_taskExecutor,
      m_componentInstancePreallocationRequestQueue);
  m_scheduler = std::make_shared<react::Scheduler>(
      schedulerToolbox, m_animationDriver.get(), m_schedulerDelegate.get());
  turboModuleProvider->setScheduler(m_scheduler);
  DLOG(INFO) << "RNInstanceInternal::initializeScheduler::end";
}

void RNInstanceInternal::callJSFunction(
    std::string module,
    std::string method,
    folly::dynamic params) {
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::callJSFunction");
  m_reactInstance->callFunctionOnModule(
      std::move(module), std::move(method), std::move(params));
}

void RNInstanceInternal::updateState(
    napi_env env,
    std::string const& componentName,
    facebook::react::Tag tag,
    napi_value newState) {
  facebook::react::SystraceSection s("#RNOH::RNInstanceInternal::updateState");
  if (auto state =
          m_shadowViewRegistry->getFabricState<facebook::react::State>(tag)) {
    m_mutationsToNapiConverter->updateState(
        env, componentName, state, newState);
  }
}

void RNInstanceInternal::onUITick(
    UITicker::Timestamp /*recentVSyncTimestamp*/) {
  facebook::react::SystraceSection s("#RNOH::RNInstanceInternal::onUITick");
  if (m_scheduler != nullptr) {
    m_scheduler->animationTick();
  }
}

void RNInstanceInternal::loadScript(
    std::vector<uint8_t> bundle,
    std::string const sourceURL,
    std::function<void(const std::string)> onFinish) {
  if (m_bundlePath.empty()) {
    m_bundlePath = sourceURL;
  }

  std::unique_ptr<react::JSBigBufferString> jsBundle;
  jsBundle = std::make_unique<react::JSBigBufferString>(bundle.size());
  memcpy(jsBundle->data(), bundle.data(), bundle.size());

  try {
    m_reactInstance->loadScript(std::move(jsBundle), sourceURL);
    onFinish("");
  } catch (std::exception const& e) {
    try {
      std::rethrow_if_nested(e);
      onFinish(e.what());
    } catch (const std::exception& nested) {
      onFinish(e.what() + std::string("\n") + nested.what());
    }
  }
}

void RNInstanceInternal::emitComponentEvent(
    napi_env env,
    react::Tag tag,
    std::string eventName,
    napi_value payload) {
  DLOG(INFO) << "RNInstanceInternal::emitComponentEvent";
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::emitComponentEvent");
  EventEmitRequestHandler::Context ctx{
      .env = env,
      .tag = tag,
      .eventName = std::move(eventName),
      .payload = payload,
      .shadowViewRegistry = m_shadowViewRegistry,
  };

  if (m_eventDispatcher != nullptr) {
    m_eventDispatcher->sendEvent(ctx);
  }

  for (auto& eventEmitRequestHandler : m_eventEmitRequestHandlers) {
    eventEmitRequestHandler->handleEvent(ctx);
  }
}

void RNInstanceInternal::onMemoryLevel(size_t memoryLevel) {
  // Android memory levels are 5, 10, 15, while Ark's are 0, 1, 2
  static const int memoryLevels[] = {5, 10, 15};
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::onMemoryLevel");
  if (m_reactInstance) {
    m_reactInstance->handleMemoryPressureJs(memoryLevels[memoryLevel]);
  }
}

void RNInstanceInternal::handleArkTSMessage(
    const std::string& name,
    folly::dynamic const& payload) {
  facebook::react::SystraceSection s("RNInstanceInternal::handleArkTSMessage");
  for (auto const& arkTSMessageHandler : m_arkTSMessageHandlers) {
    arkTSMessageHandler->handleArkTSMessage(
        {.messageName = name,
         .messagePayload = payload,
         .rnInstance = shared_from_this()});
  }
}

void RNInstanceInternal::onAnimationStarted() {
  facebook::react::SystraceSection s("RNInstanceInternal::onAnimationStarted");
  if (m_unsubscribeUITickListener != nullptr) {
    return;
  }
  m_unsubscribeUITickListener =
      m_uiTicker->subscribe([this](auto recentVSyncTimestamp) {
        m_taskExecutor->runTask(
            TaskThread::MAIN, [this, recentVSyncTimestamp]() {
              this->onUITick(recentVSyncTimestamp);
            });
      });
}

void RNInstanceInternal::onAllAnimationsComplete() {
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::onAllAnimationsComplete");
  if (m_unsubscribeUITickListener == nullptr) {
    return;
  }
  m_unsubscribeUITickListener();
  m_unsubscribeUITickListener = nullptr;
}

void RNInstanceInternal::registerFont(
    std::string const& fontFamily,
    std::string const& fontFilePath) {
  m_fontRegistry->registerFont(fontFamily, fontFilePath);
}

std::string RNInstanceInternal::getBundlePath() const {
  return m_bundlePath;
}

RNInstanceInternal::RNInstanceInternal(
    int id,
    std::shared_ptr<facebook::react::ContextContainer> contextContainer,
    TurboModuleFactory turboModuleFactory,
    TaskExecutor::Shared taskExecutor,
    std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry>
        componentDescriptorProviderRegistry,
    MutationsToNapiConverter::Shared mutationsToNapiConverter,
    EventEmitRequestHandlers eventEmitRequestHandlers,
    GlobalJSIBinders globalJSIBinders,
    UITicker::Shared uiTicker,
    ShadowViewRegistry::Shared shadowViewRegistry,
    ArkTSChannel::Shared arkTSChannel,
    MountingManager::Shared mountingManager,
    std::vector<ArkTSMessageHandler::Shared> arkTSMessageHandlers,
    ComponentInstancePreallocationRequestQueue::Shared
        componentInstancePreallocationRequestQueue,
    bool shouldEnableDebugger,
    ArkTSBridge::Shared arkTSBridge,
    FontRegistry::Shared fontRegistry)
    : m_id(id),
      m_taskExecutor(std::move(taskExecutor)),
      m_contextContainer(std::move(contextContainer)),
      m_mountingManager(std::move(mountingManager)),
      m_componentDescriptorProviderRegistry(
          std::move(componentDescriptorProviderRegistry)),
      m_shadowViewRegistry(std::move(shadowViewRegistry)),
      m_turboModuleFactory(std::move(turboModuleFactory)),
      m_mutationsToNapiConverter(std::move(mutationsToNapiConverter)),
      m_eventEmitRequestHandlers(std::move(eventEmitRequestHandlers)),
      m_globalJSIBinders(std::move(globalJSIBinders)),
      m_uiTicker(std::move(uiTicker)),
      m_shouldEnableDebugger(shouldEnableDebugger),
      m_arkTSMessageHandlers(std::move(arkTSMessageHandlers)),
      m_arkTSChannel(std::move(arkTSChannel)),
      m_arkTSBridge(std::move(arkTSBridge)),
      m_componentInstancePreallocationRequestQueue(
          std::move(componentInstancePreallocationRequestQueue)) {
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::INIT_REACT_RUNTIME_START);
  m_fontRegistry = std::move(fontRegistry);
}

} // namespace rnoh
