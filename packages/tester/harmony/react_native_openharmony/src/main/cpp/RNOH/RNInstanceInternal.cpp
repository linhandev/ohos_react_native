/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "RNInstanceInternal.h"

#include <cxxreact/JSBundleType.h>
#include <jsinspector-modern/HostTarget.h>
#include <jsinspector-modern/InspectorFlags.h>
#include <jsireact/JSIExecutor.h>
#include <react/renderer/animations/LayoutAnimationDriver.h>
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include <react/renderer/runtimescheduler/RuntimeSchedulerBinding.h>
#include <react/renderer/scheduler/Scheduler.h>
#include <memory>
#include <string_view>
#include "HarmonyTimerRegistry.h"
#include "JSBigStringHelpers.h"
#include "JSEngineProvider.h"
#include "JSInspectorHostTargetDelegate.h"
#include "RNOH/EventBeat.h"
#include "RNOH/MessageQueueThread.h"
#include "RNOH/Performance/RNOHMarker.h"
#include "RNOH/RNFeatureFlags.h"
#include "RNOH/SchedulerDelegate.h"
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModuleProvider.h"
#include "TextMeasurer.h"

namespace rnoh {
using namespace facebook;

/**
 * @brief Gets TaskExecutor
 * @return m_taskExecutor
 */
TaskExecutor::Shared RNInstanceInternal::getTaskExecutor() {
  return m_taskExecutor;
}

facebook::react::ContextContainer const&
rnoh::RNInstanceInternal::getContextContainer() const {
  DLOG(INFO) << "RNInstanceInternal::getContextContainer";
  return *m_contextContainer;
}

/**
 * @brief Get turboModule instance
 * @param name turboModuleName
 */
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

/**
 * @brief Send a message to the ArkTS side in C++
 * @param name Message's name
 * @param payload The parameters passed.
 */
void RNInstanceInternal::postMessageToArkTS(
    const std::string& name,
    folly::dynamic const& payload) {
  m_arkTSChannel->postMessage(name, payload);
}

/**
 * @brief Initialize the runtime environment, scheduling, and context
 */
void RNInstanceInternal::start() {
  DLOG(INFO) << "RNInstanceInternal::start";
  RNOHMarker::logMarker(RNOHMarker::RNOHMarkerId::CREATE_REACT_CONTEXT_START);
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

  textMeasurer->setTextMeasureParams(fontScale, scale);
}

bool RNInstanceInternal::s_hasInitializedFeatureFlags = false;

/**
 * @brief Initialize runtime.
 */
void RNInstanceInternal::initialize() {
  DLOG(INFO) << "RNInstanceInternal::initialize";
  if (!RNInstanceInternal::s_hasInitializedFeatureFlags) {
    facebook::react::ReactNativeFeatureFlags::override(
        std::make_unique<RNFeatureFlags>());
    RNInstanceInternal::s_hasInitializedFeatureFlags = true;
  }

  // create a new event dispatcher every time RN is initialized
  m_eventDispatcher = std::make_shared<EventDispatcher>();
  m_jsQueue = std::make_shared<MessageQueueThread>(m_taskExecutor);
  RNOHMarker::logMarker(RNOHMarker::RNOHMarkerId::REACT_BRIDGE_LOADING_START);
  auto onJSError =
      [this](jsi::Runtime& runtime, const JsErrorHandler::ParsedError& error) {
        // TODO: implement `ArkTSBridge::handleError(ParsedError)` and call it
        // here
        std::ostringstream msg;
        msg << error.message;
        for (auto stackFrame : error.stack) {
          msg << "\n"
              << stackFrame.file.value_or("UNKNOWN_FILE") << " "
              << stackFrame.lineNumber.value_or(-1) << " ("
              << stackFrame.methodName << ")";
        }
        LOG(ERROR) << "Error raised when executing JS: " << msg.str();
      };

  auto jsRuntime = m_jsEngineProvider->createJSRuntime(m_jsQueue);

  // start the inspector
  auto& inspectorFlags = jsinspector_modern::InspectorFlags::getInstance();
  if (inspectorFlags.getFuseboxEnabled() && !m_inspectorPageId.has_value()) {
    m_inspectorHostTarget = react::jsinspector_modern::HostTarget::create(
        *m_inspectorHostDelegate, [taskExecutor = m_taskExecutor](auto fn) {
          taskExecutor->runTask(TaskThread::MAIN, std::move(fn));
        });
    m_inspectorPageId =
        react::jsinspector_modern::getInspectorInstance().addPage(
            "React Native Bridgeless (Experimental)",
            "",
            [weakSelf = weak_from_this()](auto remote)
                -> std::unique_ptr<
                    react::jsinspector_modern::ILocalConnection> {
              auto self = std::dynamic_pointer_cast<RNInstanceInternal>(
                  weakSelf.lock());
              if (!self) {
                return nullptr;
              }
              return self->m_inspectorHostTarget->connect(std::move(remote));
            },
            {.nativePageReloads = true, .prefersFuseboxFrontend = true});
  }

  auto timerRegistry = std::make_unique<HarmonyTimerRegistry>(m_taskExecutor);
  auto rawTimerRegistry = timerRegistry.get();
  auto timerManager =
      std::make_shared<facebook::react::TimerManager>(std::move(timerRegistry));
  rawTimerRegistry->setTimerManager(timerManager);
  m_reactInstance = std::make_shared<facebook::react::ReactInstance>(
      std::move(jsRuntime),
      m_jsQueue,
      timerManager,
      onJSError,
      m_inspectorHostTarget.get());
  m_reactInstance->initializeRuntime(
      {},
      // runtime installer, which is run when the runtime
      // is first initialized and provides access to the runtime
      // before the JS code is executed
      [this](facebook::jsi::Runtime& rt) { installJSBindings(rt); });
  timerManager->setRuntimeExecutor(
      m_reactInstance->getBufferedRuntimeExecutor());
  RNOHMarker::logMarker(RNOHMarker::RNOHMarkerId::REACT_BRIDGE_LOADING_END);
}

/**
 * @brief Initialize the scheduling information of turboModule
 * @param turboModuleProvider
 */
void RNInstanceInternal::initializeScheduler(
    std::shared_ptr<TurboModuleProvider> turboModuleProvider) {
  DLOG(INFO) << "RNInstanceInternal::initializeScheduler";
  auto runtimeExecutor = m_reactInstance->getBufferedRuntimeExecutor();

  react::EventBeat::Factory eventBeatFactory =
      [runtimeExecutor, uiTicker = m_uiTicker, reactInstance = m_reactInstance](
          auto ownerBox) {
        return std::make_unique<EventBeat>(
            ownerBox, *reactInstance->getRuntimeScheduler(), uiTicker);
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
      .eventBeatFactory = eventBeatFactory};

  m_animationDriver = std::make_shared<react::LayoutAnimationDriver>(
      runtimeExecutor, m_contextContainer, this);
  m_schedulerDelegate = std::make_unique<rnoh::SchedulerDelegate>(
      m_mountingManager,
      m_taskExecutor,
      m_componentInstancePreallocationRequestQueue);
  m_scheduler = std::make_shared<react::Scheduler>(
      schedulerToolbox, m_animationDriver.get(), m_schedulerDelegate.get());
  m_schedulerDelegate->setScheduler(m_scheduler);
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

/**
 * @brief Called when the component's state changes, updates the state.
 * @param env Running environment
 * @param componentName
 * @param tag Component's tag
 * @param newState The state that has changed.
 */
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

/**
 * @brief Load the bundle from the buffer.
 * @param bundle
 * @param sourceURL
 * @param onFinish
 */
void RNInstanceInternal::loadScriptFromBuffer(
    std::vector<uint8_t> bundle,
    std::string const sourceURL,
    std::function<void(const std::string)> onFinish) {
  this->loadScript(
      JSBigStringHelpers::fromBuffer(std::move(bundle)), sourceURL, onFinish);
}

/**
 * @brief Loads a bundle from sandboxed path
 * @param fileUrl
 * @param onFinish
 */
void RNInstanceInternal::loadScriptFromFile(
    std::string const fileUrl,
    std::function<void(const std::string)> onFinish) {
  auto jsBundle = JSBigStringHelpers::fromFilePath(fileUrl);
  if (jsBundle) {
    DLOG(INFO) << "Loaded bundle from file";
  }
  this->loadScript(std::move(jsBundle), fileUrl, onFinish);
}

/**
 * @brief Loads a bundle from hap resource.
 * @param rawFileUrl
 * @param onFinish
 */
void RNInstanceInternal::loadScriptFromRawFile(
    std::string const rawFileUrl,
    std::function<void(const std::string)> onFinish) {
  // Magic value used to indicate hermes bytecode
  const uint64_t hermesMagic = 0x1F1903C103BC1FC6;

  auto jsBundle = JSBigStringHelpers::fromRawFilePath(
      rawFileUrl, m_nativeResourceManager.get());
  uint64_t extractedMagic{};
  if (jsBundle->size() >= sizeof(uint64_t)) {
    const char* source = jsBundle->c_str();
    std::copy(
        source,
        source + sizeof(uint64_t),
        reinterpret_cast<uint8_t*>(&extractedMagic));
  }
  if (jsBundle) {
    DLOG(INFO) << "Loaded bundle from rawfile resource";
  }
  if (extractedMagic == hermesMagic) {
    this->loadScript(std::move(jsBundle), rawFileUrl, onFinish);
  } else {
    // NOTE: JS needs to be null terminated to be handled correctly by hermes.
    // Buffers read from a rawfile aren't null terminated, so we pass the buffer
    // as a string.
    std::string s(jsBundle->c_str(), jsBundle->c_str() + jsBundle->size());
    this->loadScript(
        std::make_unique<facebook::react::JSBigStdString>(std::move(s)),
        rawFileUrl,
        onFinish);
  }
}

void RNInstanceInternal::loadScript(
    std::unique_ptr<react::JSBigString const> jsBundle,
    std::string const sourceURL,
    std::function<void(const std::string)> onFinish) {
  if (m_bundlePath.empty()) {
    m_bundlePath = sourceURL;
  }

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

/**
 * @brief Send an event to the component
 * @param env Running environment
 * @param tag Component's tag
 * @param eventName
 * @param payload The parameters passed.
 */
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

/**
 * @brief It is called by arkts to monitor memory changes.
 * @param memoryLevel
 */
void RNInstanceInternal::onMemoryLevel(size_t memoryLevel) {
  // Android memory levels are 5, 10, 15, while Ark's are 0, 1, 2
  static const int memoryLevels[] = {5, 10, 15};
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::onMemoryLevel");
  if (m_reactInstance) {
    m_reactInstance->handleMemoryPressureJs(memoryLevels[memoryLevel]);
  }
}

/**
 * @brief It is called when the screen size changes, and it is mainly used to
 * handle fonts.
 * @param payload screenPhysicalPixels
 */
void RNInstanceInternal::onConfigurationChange(folly::dynamic const& payload) {
  if (payload.isNull()) {
    return;
  }
  auto screenPhysicalPixels = payload["screenPhysicalPixels"];
  if (screenPhysicalPixels.isNull()) {
    return;
  }
  auto scale = screenPhysicalPixels["scale"];
  auto fontScale = screenPhysicalPixels["fontScale"];
  if (!scale.isDouble() || !fontScale.isDouble()) {
    return;
  }
  auto textMeasurer =
      m_contextContainer->at<std::shared_ptr<rnoh::TextMeasurer>>(
          "textLayoutManagerDelegate");
  if (!textMeasurer) {
    return;
  }
  textMeasurer->setTextMeasureParams(fontScale.asDouble(), scale.asDouble());
}

void RNInstanceInternal::addArkTSMessageHandler(
    ArkTSMessageHandler::Shared handler) {
  m_arkTSMessageHandlers.push_back(handler);
}

void RNInstanceInternal::removeArkTSMessageHandler(
    ArkTSMessageHandler::Shared handler) {
  for (auto it = m_arkTSMessageHandlers.begin();
       it != m_arkTSMessageHandlers.end();
       it++) {
    if (*it == handler) {
      m_arkTSMessageHandlers.erase(it);
    }
  }
}

/**
 * @brief Handle the messages sent by arkts
 * @param name Message‘s name
 * @param payload The parameters passed.
 */
void RNInstanceInternal::handleArkTSMessage(
    const std::string& name,
    folly::dynamic const& payload) {
  facebook::react::SystraceSection s("RNInstanceInternal::handleArkTSMessage");
  if (name == "CONFIGURATION_UPDATE") {
    onConfigurationChange(payload);
  }
  if (m_shouldEnableDebugger && name == "RNOH::RESUME_DEBUGGER" &&
      m_inspectorHostTarget) {
    m_inspectorHostTarget->sendCommand(
        jsinspector_modern::HostCommand::DebuggerResume);
  }

  for (auto const& arkTSMessageHandler : m_arkTSMessageHandlers) {
    arkTSMessageHandler->handleArkTSMessage(
        {.messageName = name,
         .messagePayload = payload,
         .rnInstance = shared_from_this()});
  }
}

/**
 * @brief Call it when the animation is start
 */
void RNInstanceInternal::onAnimationStarted() {
  facebook::react::SystraceSection s("RNInstanceInternal::onAnimationStarted");
  if (m_unsubscribeUITickListener != nullptr) {
    return;
  }
  m_unsubscribeUITickListener =
      m_uiTicker->subscribe([this](auto recentVSyncTimestamp) {
        m_taskExecutor->runTask(
            TaskThread::MAIN,
            [weakSelf = weak_from_this(), recentVSyncTimestamp]() {
              if (auto self = std::dynamic_pointer_cast<RNInstanceInternal>(
                      weakSelf.lock())) {
                self->onUITick(recentVSyncTimestamp);
              }
            });
      });
}

/**
 * @brief Call it when the animation is finished
 */
void RNInstanceInternal::onAllAnimationsComplete() {
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::onAllAnimationsComplete");
  if (m_unsubscribeUITickListener == nullptr) {
    return;
  }
  m_unsubscribeUITickListener();
  m_unsubscribeUITickListener = nullptr;
}

/**
 * @brief Called from the arkts side for the registration of fonts
 * @param fontFamily
 * @param fontFilePath
 */
void RNInstanceInternal::registerFont(
    std::string const& fontFamily,
    std::string const& fontFilePath) {
  m_fontRegistry->registerFont(fontFamily, fontFilePath);
}

RNInstanceInternal::RNInstanceRNOHMarkerListener::RNInstanceRNOHMarkerListener(
    ArkTSChannel::Weak arkTSChannel)
    : m_arkTSChannel(arkTSChannel){};

void RNInstanceInternal::RNInstanceRNOHMarkerListener::logMarker(
    const RNOHMarker::RNOHMarkerId markerId,
    const std::string& tag,
    const double timestamp) {
  auto arkTSChannel = m_arkTSChannel.lock();
  if (!arkTSChannel) {
    return;
  }
  folly::dynamic payload = folly::dynamic::object(
      "markerId", RNOHMarker::harmonyMarkerIdToString(markerId))("tag", tag)(
      "timestamp", timestamp);
  arkTSChannel->postMessage("logRNOHMarker", payload);
}

/**
 * @brief Get the path of the bundle
 * @return m_bundlePath
 */
std::string RNInstanceInternal::getBundlePath() const {
  return m_bundlePath;
}

/**
 * @brief Get the path of the bundle
 * @return m_bundlePath
 */
NativeResourceManager const* RNInstanceInternal::getNativeResourceManager()
    const {
  RNOH_ASSERT(m_nativeResourceManager != nullptr);
  return m_nativeResourceManager.get();
}

/**
 * @brief Mainly do operations related to RNInstace
 * @param id rnInstanceId
 * @param contextContainer Running context
 * @param turboModuleFactory
 * @param taskExecutor Task execution-related scheduling.
 * @param componentDescriptorProviderRegistry The registration of the Descriptor
 * of the component
 * @param mutationsToNapiConverter Listen to the changes of mutations.
 * @param eventEmitRequestHandlers Deal with event-related issues.
 * @param globalJSIBinders Global JavaScript bridge.
 * @param uiTicker Monitor changes in the UI and update accordingly.
 * @param shadowViewRegistry View the registration of the shadow tree node.
 * @param arkTSChannel Arkts scheduling and execution.
 * @param mountingManager updating and destroying ComponentInstances
 * @param arkTSMessageHandlers Handle ARKTS messages.
 * @param componentInstancePreallocationRequestQueue Component processing queue
 * @param nativeResourceManager the native implementation of the JavaScript
 * resource manager
 * @param shouldEnableDebugger Control whether you can debug.
 * @param arkTSBridge
 * @param fontRegistry Handle font-related issues
 * @param jsEngineProvider hermes/jsvm
 * @return descriptorWrapper
 */
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
    SharedNativeResourceManager nativeResourceManager,
    bool shouldEnableDebugger,
    ArkTSBridge::Shared arkTSBridge,
    FontRegistry::Shared fontRegistry,
    std::shared_ptr<facebook::react::JSRuntimeFactory> jsEngineProvider)
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
      m_nativeResourceManager(std::move(nativeResourceManager)),
      m_shouldEnableDebugger(shouldEnableDebugger),
      m_arkTSMessageHandlers(std::move(arkTSMessageHandlers)),
      m_arkTSChannel(std::move(arkTSChannel)),
      m_arkTSBridge(std::move(arkTSBridge)),
      m_componentInstancePreallocationRequestQueue(
          std::move(componentInstancePreallocationRequestQueue)),
      m_inspectorHostDelegate(
          std::make_unique<JSInspectorHostTargetDelegate>(m_arkTSChannel)),
      m_jsEngineProvider(std::move(jsEngineProvider)) {
  m_fontRegistry = std::move(fontRegistry);
}

/**
 * @brief The destructor of RNInstanceInternal.
 */
RNInstanceInternal::~RNInstanceInternal() noexcept {
  if (m_inspectorPageId.has_value()) {
    react::jsinspector_modern::getInspectorInstance().removePage(
        m_inspectorPageId.value());
    m_inspectorPageId.reset();
  }
};

} // namespace rnoh
