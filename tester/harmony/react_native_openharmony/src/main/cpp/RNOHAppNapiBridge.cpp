#include <ace/xcomponent/native_interface_xcomponent.h>
#include <cxxreact/JSExecutor.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <array>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>
#include "RNInstanceFactory.h"
#include "RNOH/ArkJS.h"
#include "RNOH/ArkTSBridge.h"
#include "RNOH/Inspector.h"
#include "RNOH/LogSink.h"
#include "RNOH/Performance/HarmonyReactMarker.h"
#include "RNOH/RNInstance.h"
#include "RNOH/RNInstanceCAPI.h"
#include "RNOH/Result.h"
#include "RNOH/Result.h"
#include "RNOH/TaskExecutor/NapiTaskRunner.h"
#include "RNOH/TaskExecutor/ThreadTaskRunner.h"
#include "RNOH/UITicker.h"
#include "RNOH/arkui/ArkUINodeRegistry.h"
#include "napi/native_api.h"

template <typename Map, typename K, typename V>
auto getOrDefault(const Map& map, K&& key, V&& defaultValue)
    -> std::common_type_t<decltype(map.at(std::forward<K>(key))), V&&> {
  auto it = map.find(std::forward<K>(key));
  if (it != map.end()) {
    return it->second;
  }
  return std::forward<V>(defaultValue);
}

std::mutex RN_INSTANCE_BY_ID_MTX;
std::unordered_map<size_t, std::shared_ptr<RNInstanceInternal>>
    RN_INSTANCE_BY_ID;
std::unordered_map<int, ArkTSBridge::Shared> ARK_TS_BRIDGE_BY_ENV_ID;

std::unordered_map<int, std::pair<napi_ref, napi_env>>
    WORKER_TURBO_MODULE_PROVIDER_REF_AND_ENV_BY_RN_INSTANCE_ID;
std::unordered_map<int, std::unique_ptr<NapiTaskRunner>>
    WORKER_TASK_RUNNER_BY_RN_INSTANCE_ID;
std::mutex WORKER_DATA_MTX;

auto UI_TICKER = std::make_shared<UITicker>();
static auto CLEANUP_RUNNER = std::make_unique<ThreadTaskRunner>("RNOH_CLEANUP");

napi_value invoke(napi_env env, std::function<napi_value()> operation) {
  ArkJS arkJS(env);
  try {
    return arkJS.createResult(Ok<napi_value>(operation()));
  } catch (...) {
    return arkJS.createResult(Err<napi_value>(std::current_exception()));
  }
}

static napi_value onInit(napi_env env, napi_callback_info info) {
  static int nextEnvId = 0;
  return invoke(env, [&] {
    HarmonyReactMarker::setLogPerfMarkerIfNeeded();
    LogSink::initializeLogging();
    auto logVerbosityLevel = 0;
    if (!ArkUINodeRegistry::isInitialized()) {
      /**
       * RNOH captures errors emitted when handling ArkUI events to prevent
       * applications from crashing.
       *
       * RNOH displays these errors in a RedBox. However, the C++ environment
       * can be shared by multiple ArkTS environments when a bundle uses RNOH
       * in multiple UIAbilities. In such scenarios, RNOH logs those errors in
       * the console. RNOH theoretically could display a RedBox in multiple
       * ArkTS environments. However, it is unknown which ArkTS environment is
       * alive, because `UIAbility::onDestroy` is not called.
       *
       * At the moment of creating this error-handling solution,
       * ArkUINodeRegistry is a singleton. The initial C-API version only
       * allowed registering one global event handler for all ArkUI nodes, hence
       * the choice of singleton. ArkUINodeRegistry captures all errors emitted
       * during event handling and passes them to the callback below. Future
       * C-API versions will allow registering event handlers per node, and a
       * node will be responsible for handling events. To display such errors,
       * RNOH needs to provide ArkTSErrorHandler to ArkUINode (in a non-breaking
       * manner). Once libraries migrate to that new ArkUINode's constructor,
       * this event handler could be removed.
       */
      ArkUINodeRegistry::initialize([](std::exception_ptr ex) {
        if (ARK_TS_BRIDGE_BY_ENV_ID.size() > 1) {
          try {
            std::rethrow_exception(ex);
          } catch (const RNOHError& e) {
            std::string errMsg = e.getMessage() + '\n';
            for (auto& trace : e.getStacktrace()) {
              errMsg += trace + "\n";
            }
            for (auto& suggestion : e.getSuggestions()) {
              errMsg += suggestion + "\n";
            }
            LOG(ERROR) << errMsg;
          } catch (const facebook::jsi::JSError& e) {
            LOG(ERROR) << e.getMessage() << "\n" << e.getStack();
          } catch (const std::exception& e) {
            LOG(ERROR) << e.what();
          }
        } else {
          for (auto& envIdAndArkTsBridge : ARK_TS_BRIDGE_BY_ENV_ID) {
            envIdAndArkTsBridge.second->handleError(ex);
          }
        }
      });
    }
#ifdef LOG_VERBOSITY_LEVEL
    FLAGS_v = LOG_VERBOSITY_LEVEL;
    logVerbosityLevel = LOG_VERBOSITY_LEVEL;
#endif
    DLOG(INFO) << "onInit (LOG_VERBOSITY_LEVEL=" << logVerbosityLevel << ")";
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    nextEnvId++;
    auto shouldClearRNInstances = arkJS.getBoolean(args[0]);
    if (shouldClearRNInstances) {
      /**
       * This CPP code can survive closing an app. The app can be closed before
       * removing all RNInstances. As a workaround, all rnInstances are removed
       * on the start.
       */
      CLEANUP_RUNNER->runAsyncTask([] {
        decltype(RN_INSTANCE_BY_ID) instances;
        {
          std::lock_guard<std::mutex> lock(RN_INSTANCE_BY_ID_MTX);
          std::swap(RN_INSTANCE_BY_ID, instances);
        }
        instances.clear();
      });
      ARK_TS_BRIDGE_BY_ENV_ID.clear();
    }
    auto isDebugModeEnabled = false;
#ifdef REACT_NATIVE_DEBUG
    isDebugModeEnabled = true;
#endif
    auto arkTSBridgeHandler = arkJS.createReference(args[1]);
    ARK_TS_BRIDGE_BY_ENV_ID.emplace(
        nextEnvId,
        std::make_shared<ArkTSBridge>(env, std::move(arkTSBridgeHandler)));
    return arkJS.createObjectBuilder()
        .addProperty("isDebugModeEnabled", isDebugModeEnabled)
        .addProperty("envId", nextEnvId)
        .build();
  });
}

/**
 * @thread: WORKER
 */
static napi_value registerWorkerTurboModuleProvider(
    napi_env env,
    napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "registerWorkerTurboModuleProvider";
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 3);
    auto workerTurboModuleProviderRef = arkJS.createReference(args[0]);
    auto rnInstanceId = arkJS.getDouble(args[1]);
    auto lock = std::lock_guard(WORKER_DATA_MTX);
    WORKER_TURBO_MODULE_PROVIDER_REF_AND_ENV_BY_RN_INSTANCE_ID.emplace(
        rnInstanceId, std::make_pair(workerTurboModuleProviderRef, env));
    if (WORKER_TASK_RUNNER_BY_RN_INSTANCE_ID.find(rnInstanceId) ==
        WORKER_TASK_RUNNER_BY_RN_INSTANCE_ID.end()) {
      WORKER_TASK_RUNNER_BY_RN_INSTANCE_ID.emplace(
          rnInstanceId,
          std::make_unique<NapiTaskRunner>(
              "RNOH_WORKER_" + std::to_string(static_cast<int>(rnInstanceId)),
              env));
    }
    return arkJS.getUndefined();
  });
}

static napi_value getNextRNInstanceId(
    napi_env env,
    napi_callback_info /*info*/) {
  ArkJS arkJS(env);
  static std::atomic_size_t nextId = 0;
  return invoke(env, [&] {
    auto id = nextId++;
    DLOG(INFO) << "getNextRNInstanceId: " << id;
    return arkJS.createInt(id);
  });
}

static napi_value onCreateRNInstance(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    DLOG(INFO) << "onCreateRNInstance";
    HarmonyReactMarker::setAppStartTime(
        facebook::react::JSExecutor::performanceNow());
    auto args = arkJS.getCallbackArgs(info, 14);
    size_t rnInstanceId = arkJS.getDouble(args[0]);
    auto mainArkTSTurboModuleProviderRef = arkJS.createReference(args[1]);
    auto mutationsListenerRef = arkJS.createReference(args[2]);
    auto commandDispatcherRef = arkJS.createReference(args[3]);
    auto eventDispatcherRef = arkJS.createReference(args[4]);
    auto measureTextFnRef = arkJS.createReference(args[5]);
    auto shouldEnableDebugger = arkJS.getBoolean(args[6]);
    auto shouldEnableBackgroundExecutor = arkJS.getBoolean(args[7]);
    auto featureFlagRegistry = std::make_shared<FeatureFlagRegistry>();
    for (auto featureFlagNameAndStatus : arkJS.getObjectProperties(args[8])) {
      featureFlagRegistry->setFeatureFlagStatus(
          arkJS.getString(featureFlagNameAndStatus.first),
          arkJS.getBoolean(featureFlagNameAndStatus.second));
    }
    auto frameNodeFactoryRef = arkJS.createReference(args[9]);
    auto jsResourceManager = args[10];
    auto arkTsComponentNamesDynamic = arkJS.getDynamic(args[11]);
    std::unordered_set<std::string> arkTsComponentNames = {};
    for (size_t i = 0; i < arkTsComponentNamesDynamic.size(); ++i) {
        arkTsComponentNames.emplace(arkTsComponentNamesDynamic[i].asString());
    }
    auto fontOptionsDynamic = arkJS.getDynamic(args[12]);
    std::unordered_map<std::string, std::string> fontFamilySrcByName;
    for (size_t i = 0; i < fontOptionsDynamic.size(); ++i) {
      fontFamilySrcByName.emplace(
            fontOptionsDynamic[i]["familyName"].asString(),
            fontOptionsDynamic[i]["familySrc"].asString()
            );
    }
        auto workerLock = std::lock_guard(WORKER_DATA_MTX);
    std::unique_ptr<NapiTaskRunner> workerTaskRunner = nullptr;
    auto workerTaskRunnerIt =
        WORKER_TASK_RUNNER_BY_RN_INSTANCE_ID.find(rnInstanceId);
    if (workerTaskRunnerIt != WORKER_TASK_RUNNER_BY_RN_INSTANCE_ID.end()) {
      workerTaskRunner = std::move(
          WORKER_TASK_RUNNER_BY_RN_INSTANCE_ID.extract(workerTaskRunnerIt)
              .mapped());
    }
    auto workerTurboModuleProviderRefAndEnv = getOrDefault(
        WORKER_TURBO_MODULE_PROVIDER_REF_AND_ENV_BY_RN_INSTANCE_ID,
        rnInstanceId,
        std::make_pair(nullptr, nullptr));
	int envId = arkJS.getDouble(args[13]);
    auto rnInstance = createRNInstance(
        rnInstanceId,
        env,
        workerTurboModuleProviderRefAndEnv.second,
        std::move(workerTaskRunner),
        getOrDefault(ARK_TS_BRIDGE_BY_ENV_ID, envId, nullptr),
        mainArkTSTurboModuleProviderRef,
        workerTurboModuleProviderRefAndEnv.first,
        frameNodeFactoryRef,
        [env, rnInstanceId, mutationsListenerRef](
            auto const& mutationsToNapiConverter, auto const& mutations) {
          {
            auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
            if (RN_INSTANCE_BY_ID.find(rnInstanceId) ==
                RN_INSTANCE_BY_ID.end()) {
              LOG(WARNING) << "RNInstance with the following id "
                           << std::to_string(rnInstanceId) << " does not exist";
              return;
            }
          }
          ArkJS arkJS(env);
          auto napiMutations = mutationsToNapiConverter.convert(env, mutations);
          std::array<napi_value, 1> args = {napiMutations};
          auto listener = arkJS.getReferenceValue(mutationsListenerRef);
          arkJS.call<1>(listener, args);
        },
        [env, rnInstanceId, commandDispatcherRef](
            auto tag, auto const& commandName, auto args) {
          {
            auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
            if (RN_INSTANCE_BY_ID.find(rnInstanceId) ==
                RN_INSTANCE_BY_ID.end()) {
              LOG(WARNING) << "RNInstance with the following id "
                           << std::to_string(rnInstanceId) << " does not exist";
              return;
            }
          }
          ArkJS arkJS(env);
          auto napiArgs = arkJS.convertIntermediaryValueToNapiValue(args);
          std::array<napi_value, 3> napiArgsArray = {
              arkJS.createDouble(tag),
              arkJS.createString(commandName),
              napiArgs};
          auto commandDispatcher =
              arkJS.getReferenceValue(commandDispatcherRef);
          arkJS.call<3>(commandDispatcher, napiArgsArray);
        },
        measureTextFnRef,
        eventDispatcherRef,
        featureFlagRegistry,
        UI_TICKER,
        jsResourceManager,
        shouldEnableDebugger,
        shouldEnableBackgroundExecutor,
        arkTsComponentNames,
        fontFamilySrcByName);

    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    if (RN_INSTANCE_BY_ID.find(rnInstanceId) != RN_INSTANCE_BY_ID.end()) {
      LOG(FATAL) << "RNInstance with the following id "
                 << std::to_string(rnInstanceId) << " has been already created";
    }
    auto [it, _inserted] =
        RN_INSTANCE_BY_ID.emplace(rnInstanceId, std::move(rnInstance));
    it->second->start();
    return arkJS.getNull();
  });
}

static napi_value onDestroyRNInstance(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "onDestroyRNInstance";
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 1);
    size_t rnInstanceId = arkJS.getDouble(args[0]);
    CLEANUP_RUNNER->runAsyncTask([rnInstanceId] {
      std::shared_ptr<RNInstanceInternal> instance;
      {
        auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
        if (auto it = RN_INSTANCE_BY_ID.find(rnInstanceId);
            it != RN_INSTANCE_BY_ID.end()) {
          std::swap(it->second, instance);
          RN_INSTANCE_BY_ID.erase(rnInstanceId);
        }
      }
    });
    return arkJS.getNull();
  });
}

static napi_value loadScript(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "loadScript";
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 4);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    auto onFinishRef = arkJS.createReference(args[3]);
    rnInstance->loadScript(
        arkJS.getArrayBuffer(args[1]),
        arkJS.getString(args[2]),
        [taskExecutor = rnInstance->getTaskExecutor(), env, onFinishRef](
            const std::string& errorMsg) {
          taskExecutor->runTask(
              TaskThread::MAIN, [env, onFinishRef, errorMsg]() {
                ArkJS arkJS(env);
                auto listener = arkJS.getReferenceValue(onFinishRef);
                arkJS.call<1>(listener, {arkJS.createString(errorMsg)});
                arkJS.deleteReference(onFinishRef);
              });
        });
    return arkJS.getNull();
  });
}

static napi_value updateSurfaceConstraints(
    napi_env env,
    napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "updateSurfaceConstraints";
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 8);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->updateSurfaceConstraints(
        arkJS.getDouble(args[1]),
        arkJS.getDouble(args[2]),
        arkJS.getDouble(args[3]),
        arkJS.getDouble(args[4]),
        arkJS.getDouble(args[5]),
        arkJS.getDouble(args[6]),
        arkJS.getBoolean(args[7]));
    return arkJS.getNull();
  });
}

static napi_value createSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 3);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    facebook::react::Tag surfaceId = arkJS.getDouble(args[1]);
    DLOG(INFO) << "createSurface: surfaceId=" << surfaceId;
    auto appKey = arkJS.getString(args[2]);
    rnInstance->createSurface(surfaceId, appKey);
    return arkJS.getNull();
  });
}

static napi_value startSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 9);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    facebook::react::Tag surfaceId = arkJS.getDouble(args[1]);
    DLOG(INFO) << "startSurface: surfaceId=" << surfaceId << "\n";
    rnInstance->startSurface(
        surfaceId,
        arkJS.getDouble(args[2]),
        arkJS.getDouble(args[3]),
        arkJS.getDouble(args[4]),
        arkJS.getDouble(args[5]),
        arkJS.getDouble(args[6]),
        arkJS.getBoolean(args[7]),
        arkJS.getDynamic(args[8]));
    return arkJS.getNull();
  });
}

static napi_value stopSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    facebook::react::Tag surfaceId = arkJS.getDouble(args[1]);
    DLOG(INFO) << "stopSurface: surfaceId=" << surfaceId << "\n";
    rnInstance->stopSurface(surfaceId);
    return arkJS.getNull();
  });
}

static napi_value destroySurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    size_t instanceId = arkJS.getDouble(args[0]);
    facebook::react::Tag surfaceId = arkJS.getDouble(args[1]);
    DLOG(INFO) << "destroySurface: surfaceId=" << surfaceId << "\n";
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->destroySurface(surfaceId);
    return arkJS.getNull();
  });
}

static napi_value setSurfaceDisplayMode(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 3);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    facebook::react::Tag surfaceId = arkJS.getDouble(args[1]);
    DLOG(INFO) << "setSurfaceDisplayMode: surfaceId=" << surfaceId << "\n";
    rnInstance->setSurfaceDisplayMode(
        surfaceId,
        static_cast<facebook::react::DisplayMode>(arkJS.getDouble(args[2])));
    return arkJS.getNull();
  });
}

static napi_value emitComponentEvent(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 5);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->emitComponentEvent(
        env, arkJS.getDouble(args[1]), arkJS.getString(args[2]), args[3]);
    return arkJS.getNull();
  });
}

static napi_value callRNFunction(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 4);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    auto moduleString = arkJS.getString(args[1]);
    auto nameString = arkJS.getString(args[2]);
    auto argsDynamic = arkJS.getDynamic(args[3]);
    rnInstance->callFunction(
        std::move(moduleString), std::move(nameString), std::move(argsDynamic));
    return arkJS.getNull();
  });
}

static napi_value onMemoryLevel(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 1);
    auto memoryLevel = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    for (auto& [id, instance] : RN_INSTANCE_BY_ID) {
      if (instance != nullptr) {
        instance->onMemoryLevel(static_cast<size_t>(memoryLevel));
      }
    }
    return arkJS.getNull();
  });
}

static napi_value updateState(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 4);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    auto componentName = arkJS.getString(args[1]);
    auto tag = arkJS.getDouble(args[2]);
    auto state = args[3];
    rnInstance->updateState(
        env, componentName, static_cast<facebook::react::Tag>(tag), state);
    return arkJS.getNull();
  });
}

static napi_value onArkTSMessage(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    auto messageName = arkJS.getString(args[0]);
    auto wrappedPayload = arkJS.getDynamic(args[1]);
    auto rnInstanceId = wrappedPayload["rnInstanceId"].getDouble();
    auto messagePayload = wrappedPayload["payload"];
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(rnInstanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->handleArkTSMessage(messageName, messagePayload);
    return arkJS.getNull();
  });
}

static void registerNativeXComponent(napi_env env, napi_value exports) {
  if ((env == nullptr) || (exports == nullptr)) {
    LOG(ERROR) << "registerNativeXComponent: env or exports is null"
               << "\n";
    return;
  }

  napi_value exportInstance = nullptr;
  if (napi_get_named_property(
          env, exports, OH_NATIVE_XCOMPONENT_OBJ, &exportInstance) != napi_ok) {
    LOG(ERROR) << "registerNativeXComponent: napi_get_named_property fail"
               << "\n";
    return;
  }

  OH_NativeXComponent* nativeXComponent = nullptr;
  if (napi_unwrap(
          env, exportInstance, reinterpret_cast<void**>(&nativeXComponent)) !=
      napi_ok) {
    LOG(ERROR) << "registerNativeXComponent: napi_unwrap fail"
               << "\n";
    return;
  }

  char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
  uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
  if (OH_NativeXComponent_GetXComponentId(nativeXComponent, idStr, &idSize) !=
      OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
    LOG(ERROR)
        << "registerNativeXComponent: OH_NativeXComponent_GetXComponentId fail"
        << "\n";
    return;
  }
  std::string xcomponentStr(idStr);
  std::stringstream ss(xcomponentStr);
  std::string instanceId;
  std::getline(ss, instanceId, '_');
  std::string surfaceId;
  std::getline(ss, surfaceId, '_');
  size_t instanceIdNum = std::stod(instanceId, nullptr);
  if (RN_INSTANCE_BY_ID.find(instanceIdNum) == RN_INSTANCE_BY_ID.end()) {
    LOG(ERROR) << "RNInstance with the following id "
               << std::to_string(instanceIdNum) << " does not exist";
    return;
  }
  auto& rnInstance = RN_INSTANCE_BY_ID.at(instanceIdNum);

  auto* rnInstanceCPIRawPtr = dynamic_cast<RNInstanceCAPI*>(rnInstance.get());
  if (rnInstanceCPIRawPtr != nullptr) {
    rnInstanceCPIRawPtr->registerNativeXComponentHandle(
        nativeXComponent, std::stoi(surfaceId));
  }
  DLOG(INFO) << "registerNativeXComponent: id = " << instanceId << "\n";
}

static napi_value getNativeNodeIdByTag(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJS.getUndefined();
    }
    auto rnInstanceCAPI = std::dynamic_pointer_cast<RNInstanceCAPI>(it->second);
    if (rnInstanceCAPI == nullptr) {
      return arkJS.getUndefined();
    }
    auto tag = arkJS.getDouble(args[1]);
    auto nativeNodeId = rnInstanceCAPI->getNativeNodeIdByTag(tag);
    return nativeNodeId.has_value() ? arkJS.createString(nativeNodeId.value())
                                    : arkJS.getUndefined();
  });
}

static napi_value setBundlePath(napi_env env, napi_callback_info info) {
  DLOG(INFO) << "setBundlePath";
  ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->setBundlePath(arkJs.getString(args[1]));
    return arkJs.getUndefined();
}
    
EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports) {
  napi_property_descriptor desc[] = {
      {"onInit",
       nullptr,
       onInit,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"setBundlePath",
       nullptr,
       setBundlePath,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"registerWorkerTurboModuleProvider",
       nullptr,
       registerWorkerTurboModuleProvider,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"getNextRNInstanceId",
       nullptr,
       getNextRNInstanceId,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"onCreateRNInstance",
       nullptr,
       onCreateRNInstance,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"onDestroyRNInstance",
       nullptr,
       onDestroyRNInstance,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"loadScript",
       nullptr,
       loadScript,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"startSurface",
       nullptr,
       startSurface,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"stopSurface",
       nullptr,
       stopSurface,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"destroySurface",
       nullptr,
       destroySurface,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"createSurface",
       nullptr,
       createSurface,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"updateSurfaceConstraints",
       nullptr,
       updateSurfaceConstraints,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"setSurfaceDisplayMode",
       nullptr,
       setSurfaceDisplayMode,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"onArkTSMessage",
       nullptr,
       onArkTSMessage,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"emitComponentEvent",
       nullptr,
       emitComponentEvent,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"callRNFunction",
       nullptr,
       callRNFunction,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"onMemoryLevel",
       nullptr,
       onMemoryLevel,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"updateState",
       nullptr,
       updateState,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"getInspectorWrapper",
       nullptr,
       rnoh::getInspectorWrapper,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"getNativeNodeIdByTag",
       nullptr,
       ::getNativeNodeIdByTag,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
  };

  napi_define_properties(
      env, exports, sizeof(desc) / sizeof(napi_property_descriptor), desc);
  registerNativeXComponent(
      env, exports); // NOTE: shouldn't this be called when creating surface?
  return exports;
}
EXTERN_C_END

static napi_module demoModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = Init,
    .nm_modname = "rnoh_app",
    .nm_priv = ((void*)nullptr),
    .reserved = {nullptr},
};

extern "C" __attribute__((constructor)) void RegisterEntryModule(void) {
  napi_module_register(&demoModule);
}
