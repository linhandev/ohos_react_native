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
#include "RNOH/RNInstanceInternal.h"
#include "RNOH/Result.h"
#include "RNOH/TaskExecutor/ThreadTaskRunner.h"
#include "RNOH/UITicker.h"
#include "RNOH/arkui/ArkUINodeRegistry.h"
#include "napi/native_api.h"

std::mutex RN_INSTANCE_BY_ID_MTX;
std::unordered_map<size_t, std::shared_ptr<RNInstanceInternal>>
    RN_INSTANCE_BY_ID;
std::unordered_map<int, ArkTSBridge::Shared> ARK_TS_BRIDGE_BY_ENV_ID;
auto UI_TICKER = std::make_shared<UITicker>();
static auto CLEANUP_RUNNER = std::make_unique<ThreadTaskRunner>("RNOH_CLEANUP");

napi_value invoke(napi_env env, std::function<napi_value()> operation) {
  ArkJS arkJs(env);
  try {
    return arkJs.createResult(Ok<napi_value>(operation()));
  } catch (...) {
    return arkJs.createResult(Err<napi_value>(std::current_exception()));
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
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    nextEnvId++;
    auto shouldClearRNInstances = arkJs.getBoolean(args[0]);
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
    auto arkTsBridgeHandler = arkJs.createReference(args[1]);
    ARK_TS_BRIDGE_BY_ENV_ID.emplace(
        nextEnvId,
        std::make_shared<ArkTSBridge>(env, std::move(arkTsBridgeHandler)));
    return arkJs.createObjectBuilder()
        .addProperty("isDebugModeEnabled", isDebugModeEnabled)
        .addProperty("envId", nextEnvId)
        .build();
  });
}

static napi_value getNextRNInstanceId(
    napi_env env,
    napi_callback_info /*info*/) {
  ArkJS arkJs(env);
  static std::atomic_size_t nextId = 0;
  return invoke(env, [&] {
    auto id = nextId++;
    DLOG(INFO) << "getNextRNInstanceId: " << id;
    return arkJs.createInt(id);
  });
}

static napi_value onCreateRNInstance(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    DLOG(INFO) << "onCreateRNInstance";
    HarmonyReactMarker::setAppStartTime(
        facebook::react::JSExecutor::performanceNow());
    auto args = arkJs.getCallbackArgs(info, 12);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto arkTsTurboModuleProviderRef = arkJs.createReference(args[1]);
    auto mutationsListenerRef = arkJs.createReference(args[2]);
    auto commandDispatcherRef = arkJs.createReference(args[3]);
    auto eventDispatcherRef = arkJs.createReference(args[4]);
    auto measureTextFnRef = arkJs.createReference(args[5]);
    auto shouldEnableDebugger = arkJs.getBoolean(args[6]);
    auto shouldEnableBackgroundExecutor = arkJs.getBoolean(args[7]);
    auto featureFlagRegistry = std::make_shared<FeatureFlagRegistry>();
    for (auto featureFlagNameAndStatus : arkJs.getObjectProperties(args[8])) {
      featureFlagRegistry->setFeatureFlagStatus(
          arkJs.getString(featureFlagNameAndStatus.first),
          arkJs.getBoolean(featureFlagNameAndStatus.second));
    }
    auto frameNodeFactoryRef = arkJs.createReference(args[9]);
    auto jsResourceManager = args[10];
    int envId = arkJs.getDouble(args[11]);
    auto rnInstance = createRNInstance(
        instanceId,
        env,
        ARK_TS_BRIDGE_BY_ENV_ID[envId],
        arkTsTurboModuleProviderRef,
        frameNodeFactoryRef,
        [env, instanceId, mutationsListenerRef](
            auto const& mutationsToNapiConverter, auto const& mutations) {
          {
            auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
            if (RN_INSTANCE_BY_ID.find(instanceId) == RN_INSTANCE_BY_ID.end()) {
              LOG(WARNING) << "RNInstance with the following id " +
                      std::to_string(instanceId) + " does not exist";
              return;
            }
          }
          ArkJS arkJs(env);
          auto napiMutations = mutationsToNapiConverter.convert(env, mutations);
          std::array<napi_value, 1> args = {napiMutations};
          auto listener = arkJs.getReferenceValue(mutationsListenerRef);
          arkJs.call<1>(listener, args);
        },
        [env, instanceId, commandDispatcherRef](
            auto tag, auto const& commandName, auto args) {
          {
            auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
            if (RN_INSTANCE_BY_ID.find(instanceId) == RN_INSTANCE_BY_ID.end()) {
              LOG(WARNING) << "RNInstance with the following id " +
                      std::to_string(instanceId) + " does not exist";
              return;
            }
          }
          ArkJS arkJs(env);
          auto napiArgs = arkJs.convertIntermediaryValueToNapiValue(args);
          std::array<napi_value, 3> napiArgsArray = {
              arkJs.createDouble(tag),
              arkJs.createString(commandName),
              napiArgs};
          auto commandDispatcher =
              arkJs.getReferenceValue(commandDispatcherRef);
          arkJs.call<3>(commandDispatcher, napiArgsArray);
        },
        measureTextFnRef,
        eventDispatcherRef,
        featureFlagRegistry,
        UI_TICKER,
        jsResourceManager,
        shouldEnableDebugger,
        shouldEnableBackgroundExecutor);

    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    if (RN_INSTANCE_BY_ID.find(instanceId) != RN_INSTANCE_BY_ID.end()) {
      LOG(FATAL) << "RNInstance with the following id " +
              std::to_string(instanceId) + " has been already created";
    }
    auto [it, _inserted] =
        RN_INSTANCE_BY_ID.emplace(instanceId, std::move(rnInstance));
    it->second->start();
    return arkJs.getNull();
  });
}

static napi_value onDestroyRNInstance(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "onDestroyRNInstance";
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 1);
    size_t rnInstanceId = arkJs.getDouble(args[0]);
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
    return arkJs.getNull();
  });
}

static napi_value loadScript(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "loadScript";
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 4);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    auto onFinishRef = arkJs.createReference(args[3]);
    rnInstance->loadScript(
        arkJs.getArrayBuffer(args[1]),
        arkJs.getString(args[2]),
        [taskExecutor = rnInstance->getTaskExecutor(), env, onFinishRef](
            const std::string& errorMsg) {
          taskExecutor->runTask(
              TaskThread::MAIN, [env, onFinishRef, errorMsg]() {
                ArkJS arkJs(env);
                auto listener = arkJs.getReferenceValue(onFinishRef);
                arkJs.call<1>(listener, {arkJs.createString(errorMsg)});
                arkJs.deleteReference(onFinishRef);
              });
        });
    return arkJs.getNull();
  });
}

static napi_value updateSurfaceConstraints(
    napi_env env,
    napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "updateSurfaceConstraints";
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 8);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->updateSurfaceConstraints(
        arkJs.getDouble(args[1]),
        arkJs.getDouble(args[2]),
        arkJs.getDouble(args[3]),
        arkJs.getDouble(args[4]),
        arkJs.getDouble(args[5]),
        arkJs.getDouble(args[6]),
        arkJs.getBoolean(args[7]));
    return arkJs.getNull();
  });
}

static napi_value createSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    DLOG(INFO) << "createSurface: surfaceId=" << surfaceId;
    auto appKey = arkJs.getString(args[2]);
    rnInstance->createSurface(surfaceId, appKey);
    return arkJs.getNull();
  });
}

static napi_value startSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 9);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    DLOG(INFO) << "startSurface: surfaceId=" << surfaceId << "\n";
    rnInstance->startSurface(
        surfaceId,
        arkJs.getDouble(args[2]),
        arkJs.getDouble(args[3]),
        arkJs.getDouble(args[4]),
        arkJs.getDouble(args[5]),
        arkJs.getDouble(args[6]),
        arkJs.getBoolean(args[7]),
        arkJs.getDynamic(args[8]));
    return arkJs.getNull();
  });
}

static napi_value stopSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    DLOG(INFO) << "stopSurface: surfaceId=" << surfaceId << "\n";
    rnInstance->stopSurface(surfaceId);
    return arkJs.getNull();
  });
}

static napi_value destroySurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    size_t instanceId = arkJs.getDouble(args[0]);
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    DLOG(INFO) << "destroySurface: surfaceId=" << surfaceId << "\n";
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->destroySurface(surfaceId);
    return arkJs.getNull();
  });
}

static napi_value setSurfaceDisplayMode(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    DLOG(INFO) << "setSurfaceDisplayMode: surfaceId=" << surfaceId << "\n";
    rnInstance->setSurfaceDisplayMode(
        surfaceId,
        static_cast<facebook::react::DisplayMode>(arkJs.getDouble(args[2])));
    return arkJs.getNull();
  });
}

static napi_value emitComponentEvent(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 5);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->emitComponentEvent(
        env, arkJs.getDouble(args[1]), arkJs.getString(args[2]), args[3]);
    return arkJs.getNull();
  });
}

static napi_value callRNFunction(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 4);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    auto moduleString = arkJs.getString(args[1]);
    auto nameString = arkJs.getString(args[2]);
    auto argsDynamic = arkJs.getDynamic(args[3]);
    rnInstance->callFunction(
        std::move(moduleString), std::move(nameString), std::move(argsDynamic));
    return arkJs.getNull();
  });
}

static napi_value onMemoryLevel(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 1);
    auto memoryLevel = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    for (auto& [id, instance] : RN_INSTANCE_BY_ID) {
      if (instance != nullptr) {
        instance->onMemoryLevel(static_cast<size_t>(memoryLevel));
      }
    }
    return arkJs.getNull();
  });
}

static napi_value updateState(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 4);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    auto componentName = arkJs.getString(args[1]);
    auto tag = arkJs.getDouble(args[2]);
    auto state = args[3];
    rnInstance->updateState(
        env, componentName, static_cast<facebook::react::Tag>(tag), state);
    return arkJs.getNull();
  });
}

static napi_value onArkTSMessage(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    auto messageName = arkJs.getString(args[0]);
    auto wrappedPayload = arkJs.getDynamic(args[1]);
    auto rnInstanceId = wrappedPayload["rnInstanceId"].getDouble();
    auto messagePayload = wrappedPayload["payload"];
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(rnInstanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto& rnInstance = it->second;
    rnInstance->handleArkTSMessage(messageName, messagePayload);
    return arkJs.getNull();
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
    LOG(ERROR) << "registerNativeXComponent: napi_get_named_property fail"
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
    LOG(ERROR) << "RNInstance with the following id " +
            std::to_string(instanceIdNum) + " does not exist";
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
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto it = RN_INSTANCE_BY_ID.find(instanceId);
    if (it == RN_INSTANCE_BY_ID.end()) {
      return arkJs.getUndefined();
    }
    auto rnInstanceCApi = std::dynamic_pointer_cast<RNInstanceCAPI>(it->second);
    if (rnInstanceCApi == nullptr) {
      return arkJs.getUndefined();
    }
    auto tag = arkJs.getDouble(args[1]);
    auto nativeNodeId = rnInstanceCApi->getNativeNodeIdByTag(tag);
    return nativeNodeId.has_value() ? arkJs.createString(nativeNodeId.value())
                                    : arkJs.getUndefined();
  });
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
