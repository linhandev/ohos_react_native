#include "RNInstanceInternal.h"

#include <cxxreact/JSBundleType.h>
#include <jsireact/JSIExecutor.h>
#include <react/renderer/animations/LayoutAnimationDriver.h>
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include <react/renderer/scheduler/Scheduler.h>
#include "NativeLogger.h"
#include "RNOH/EventBeat.h"
#include "RNOH/MessageQueueThread.h"
#include "RNOH/Performance/NativeTracing.h"
#include "RNOH/RNOHError.h"
#include "RNOH/SchedulerDelegate.h"
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/TurboModuleProvider.h"
#include "hermes/executor/HermesExecutorFactory.h"

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
      DLOG(ERROR) << "TurboModule '" << name
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
  initialize();
  m_turboModuleProvider = createTurboModuleProvider();
  initializeScheduler(m_turboModuleProvider);
  m_reactInstance->getRuntimeExecutor()(
      [binders = m_globalJSIBinders,
       turboModuleProvider =
           m_turboModuleProvider](facebook::jsi::Runtime& rt) {
        for (auto& binder : binders) {
          binder->createBindings(rt, turboModuleProvider);
        }
      });
}

void RNInstanceInternal::initialize() {
  DLOG(INFO) << "RNInstanceInternal::initialize";
  // create a new event dispatcher every time RN is initialized
  m_eventDispatcher = std::make_shared<EventDispatcher>();
  std::vector<std::unique_ptr<react::NativeModule>> modules;
  auto instanceCallback = std::make_unique<react::InstanceCallback>();
  auto jsExecutorFactory = std::make_shared<react::HermesExecutorFactory>(
      // runtime installer, which is run when the runtime
      // is first initialized and provides access to the runtime
      // before the JS code is executed
      [](facebook::jsi::Runtime& rt) {
        // install `console.log` (etc.) implementation
        react::bindNativeLogger(rt, nativeLogger);
        // install tracing functions
        rnoh::setupTracing(rt);
      });
  jsExecutorFactory->setEnableDebugger(m_shouldEnableDebugger);
  m_jsQueue = std::make_shared<MessageQueueThread>(m_taskExecutor);
  auto moduleRegistry =
      std::make_shared<react::ModuleRegistry>(std::move(modules));
  m_reactInstance->initializeBridge(
      std::move(instanceCallback),
      std::move(jsExecutorFactory),
      m_jsQueue,
      std::move(moduleRegistry));
}

void RNInstanceInternal::initializeScheduler(
    std::shared_ptr<TurboModuleProvider> turboModuleProvider) {
  DLOG(INFO) << "RNInstanceInternal::initializeScheduler";
  auto reactConfig = std::make_shared<react::EmptyReactNativeConfig>();
  m_contextContainer->insert("ReactNativeConfig", std::move(reactConfig));

  react::EventBeat::Factory eventBeatFactory =
      [runtimeExecutor = m_reactInstance->getRuntimeExecutor()](auto ownerBox) {
        return std::make_unique<EventBeat>(runtimeExecutor, ownerBox);
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
      .runtimeExecutor = m_reactInstance->getRuntimeExecutor(),
      .asynchronousEventBeatFactory = eventBeatFactory,
      .synchronousEventBeatFactory = eventBeatFactory,
  };

  if (m_shouldEnableBackgroundExecutor) {
    schedulerToolbox.backgroundExecutor =
        [executor = m_taskExecutor](std::function<void()>&& callback) {
          if (executor->isOnTaskThread(TaskThread::MAIN)) {
            callback();
            return;
          }

          executor->runTask(TaskThread::BACKGROUND, std::move(callback));
        };
  }

  m_animationDriver = std::make_shared<react::LayoutAnimationDriver>(
      m_reactInstance->getRuntimeExecutor(), m_contextContainer, this);
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
  m_taskExecutor->runTask(
      TaskThread::JS,
      [weakInstance = std::weak_ptr(m_reactInstance),
       module = std::move(module),
       method = std::move(method),
       params = std::move(params)]() mutable {
        if (auto instance = weakInstance.lock()) {
          facebook::react::SystraceSection s(
              "#RNOH::RNInstanceInternal::callJSFunction::lambda");
          instance->callJSFunction(
              std::move(module), std::move(method), std::move(params));
        }
      });
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
void RNInstanceInternal::onUITick(UITicker::Timestamp recentVSyncTimestamp) {
  facebook::react::SystraceSection s("#RNOH::RNInstanceInternal::onUITick");
  if (m_shouldRelayUITick.load()) {
    m_scheduler->animationTick();
  }
}

void RNInstanceInternal::loadScript(
    std::vector<uint8_t> bundle,
    std::string const sourceURL,
    std::function<void(const std::string)> onFinish) {
  m_taskExecutor->runTask(
      TaskThread::JS,
      [this,
       bundle = std::move(bundle),
       sourceURL,
       onFinish = std::move(onFinish)]() mutable {
        std::unique_ptr<react::JSBigBufferString> jsBundle;
        jsBundle = std::make_unique<react::JSBigBufferString>(bundle.size());
        memcpy(jsBundle->data(), bundle.data(), bundle.size());

        react::BundleHeader header;
        memcpy(&header, bundle.data(), sizeof(react::BundleHeader));
        react::ScriptTag scriptTag = react::parseTypeFromHeader(header);
        // NOTE: Hermes bytecode bundles are treated as String bundles,
        // and don't throw an error here.
        if (scriptTag != react::ScriptTag::String) {
          throw new std::runtime_error("RAM bundles are not yet supported");
        }
        try {
          m_reactInstance->loadScriptFromString(
              std::move(jsBundle), sourceURL, true);
          onFinish("");
        } catch (std::exception const& e) {
          try {
            std::rethrow_if_nested(e);
            onFinish(e.what());
          } catch (const std::exception& nested) {
            onFinish(e.what() + std::string("\n") + nested.what());
          }
        }
      });
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
    m_reactInstance->handleMemoryPressure(memoryLevels[memoryLevel]);
  }
}

void RNInstanceInternal::handleArkTSMessage(
    const std::string& name,
    folly::dynamic const& payload) {
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::handleArkTSMessage");
  for (auto const& arkTSMessageHandler : m_arkTSMessageHandlers) {
    arkTSMessageHandler->handleArkTSMessage(
        {.messageName = name,
         .messagePayload = payload,
         .rnInstance = shared_from_this()});
  }
}

void RNInstanceInternal::onAnimationStarted() {
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::onAnimationStarted");
  m_shouldRelayUITick.store(true);
}

void RNInstanceInternal::onAllAnimationsComplete() {
  facebook::react::SystraceSection s(
      "#RNOH::RNInstanceInternal::onAllAnimationsComplete");
  m_shouldRelayUITick.store(false);
}
} // namespace rnoh