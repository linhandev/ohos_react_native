/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include <cxxreact/JSExecutor.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <jsinspector-modern/InspectorFlags.h>
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
#include "RNOH/InspectorHostTarget.h"
#include "RNOH/JSEngineProvider.h"
#include "RNOH/JSInspectorHostTargetDelegate.h"
#include "RNOH/LogSink.h"
#include "RNOH/Performance/HiTraceRNOHMarkerListener.h"
#include "RNOH/Performance/RNOHMarker.h"
#include "RNOH/RNFeatureFlags.h"
#include "RNOH/RNInstance.h"
#include "RNOH/RNInstanceCAPI.h"
#include "RNOH/RNInstanceInternal.h"
#include "RNOH/Result.h"
#include "RNOH/TaskExecutor/NapiTaskRunner.h"
#include "RNOH/TaskExecutor/ThreadTaskRunner.h"
#include "RNOH/UITicker.h"

#ifndef USE_HERMES
#define USE_HERMES 1
#endif

#if USE_HERMES
#include <react/runtime/hermes/HermesInstance.h>
#else
#include "JSVMInstance.h"
#endif

template <typename Map, typename K, typename V>
auto getOrDefault(const Map& map, K&& key, V&& defaultValue)
    -> std::common_type_t<decltype(map.at(std::forward<K>(key))), V&&> {
  auto it = map.find(std::forward<K>(key));
  if (it != map.end()) {
    return it->second;
  }
  return std::forward<V>(defaultValue);
}

template <typename Map, typename K, typename V>
auto extractOrDefault(Map& map, K&& key, V&& defaultValue)
    -> std::common_type_t<decltype(map.at(std::forward<K>(key))), V&&> {
  auto it = map.find(std::forward<K>(key));
  if (it != map.end()) {
    auto value = std::move(it->second);
    map.erase(it);
    return value;
  }
  return std::forward<V>(defaultValue);
}

std::mutex RN_INSTANCE_BY_ID_MTX;
std::unordered_map<size_t, std::shared_ptr<RNInstanceInternal>>
    RN_INSTANCE_BY_ID;

std::shared_ptr<RNInstanceInternal> maybeGetInstanceById(size_t instanceId) {
  auto lock = std::lock_guard<std::mutex>(RN_INSTANCE_BY_ID_MTX);
  auto it = RN_INSTANCE_BY_ID.find(instanceId);
  if (it == RN_INSTANCE_BY_ID.end()) {
    return nullptr;
  }
  return it->second;
}

std::unordered_map<size_t, std::shared_ptr<InspectorHostTarget>>
    INSPECTOR_HOST_TARGET_BY_INSTANCE_ID;

std::unordered_map<int, ArkTSBridge::Shared> ARK_TS_BRIDGE_BY_ENV_ID;

std::unordered_map<int, std::pair<NapiRef, napi_env>>
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
    RNOHMarker::setLogMarkerIfNeeded();
#ifdef WITH_HITRACE_REACT_MARKER
    RNOHMarker::addListener(&HiTraceRNOHMarkerListener::getInstance());
#endif
    LogSink::initializeLogging();
    auto logVerbosityLevel = 0;
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
#if USE_HERMES
    auto jsEngineName = "hermes";
#else
    auto jsEngineName = "jsvm";
#endif
    auto arkTSBridgeHandler = arkJS.createNapiRef(args[1]);
    ARK_TS_BRIDGE_BY_ENV_ID.emplace(
        nextEnvId,
        std::make_shared<ArkTSBridge>(
            env, std::move(arkTSBridgeHandler), isDebugModeEnabled));

    facebook::react::ReactNativeFeatureFlags::override(
        std::make_unique<RNFeatureFlags>());

    return arkJS.createObjectBuilder()
        .addProperty("isDebugModeEnabled", isDebugModeEnabled)
        .addProperty("jsEngineName", jsEngineName)
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
    auto args = arkJS.getCallbackArgs(info, 2);
    auto workerTurboModuleProviderRef = arkJS.createNapiRef(args[0]);
    auto rnInstanceId = arkJS.getDouble(args[1]);
    auto lock = std::lock_guard(WORKER_DATA_MTX);
    WORKER_TURBO_MODULE_PROVIDER_REF_AND_ENV_BY_RN_INSTANCE_ID.emplace(
        rnInstanceId,
        std::make_pair(std::move(workerTurboModuleProviderRef), env));
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

static napi_value createInspectorHostTarget(
    napi_env env,
    napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto& inspectorFlags =
        facebook::react::jsinspector_modern::InspectorFlags::getInstance();
    if (!inspectorFlags.getFuseboxEnabled()) {
      return arkJS.getNull();
    }

    auto args = arkJS.getCallbackArgs(info, 2);
    auto inspectorTaskRunner =
        std::make_shared<NapiTaskRunner>("RNOH_INSPECTOR", env);

    auto rnInstanceId = arkJS.getInteger(args[0]);
    auto eventDispatcherRef = arkJS.createNapiRef(args[1]);
    auto arkTSChannel = std::make_shared<ArkTSChannel>(
        inspectorTaskRunner, ArkJS(env), eventDispatcherRef);
    auto inspectorHostTarget = std::make_shared<InspectorHostTarget>(
        arkTSChannel, inspectorTaskRunner);

    if (INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.find(rnInstanceId) !=
        INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.end()) {
      LOG(ERROR) << "InspectorHostTarget for RNInstance with id "
                 << std::to_string(rnInstanceId) << " has been already created";
      return arkJS.getNull();
    }
    INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.emplace(
        rnInstanceId, inspectorHostTarget);
    return arkJS.getNull();
  });
}

static napi_value releaseInspectorHostTarget(
    napi_env env,
    napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 1);
    auto rnInstanceId = arkJS.getInteger(args[0]);

    if (INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.find(rnInstanceId) !=
        INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.end()) {
      INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.erase(rnInstanceId);
    }

    return arkJS.getNull();
  });
}

static napi_value resumeDebugger(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 1);
    auto instanceId = arkJS.getInteger(args[0]);

    if (INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.find(instanceId) !=
        INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.end()) {
      auto inspector = INSPECTOR_HOST_TARGET_BY_INSTANCE_ID.at(instanceId);
      inspector->resumeDebugger();
    }
    return arkJS.getNull();
  });
}

static napi_value onCreateRNInstance(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    DLOG(INFO) << "onCreateRNInstance";
    RNOHMarker::setAppStartTime(facebook::react::JSExecutor::performanceNow());
    auto args = arkJS.getCallbackArgs(info, 12);
    size_t rnInstanceId = arkJS.getDouble(args[0]);
    auto mainArkTSTurboModuleProviderRef = arkJS.createNapiRef(args[1]);
    auto mutationsListenerRef = arkJS.createNapiRef(args[2]);
    auto commandDispatcherRef = arkJS.createNapiRef(args[3]);
    auto eventDispatcherRef = arkJS.createNapiRef(args[4]);
    auto shouldEnableDebugger = arkJS.getBoolean(args[5]);
    auto featureFlagRegistry = std::make_shared<FeatureFlagRegistry>();
    for (const auto& featureFlagNameAndStatus :
         arkJS.getObjectProperties(args[6])) {
      featureFlagRegistry->setFeatureFlagStatus(
          arkJS.getString(featureFlagNameAndStatus.first),
          arkJS.getBoolean(featureFlagNameAndStatus.second));
    }
    auto frameNodeFactoryRef = arkJS.createNapiRef(args[7]);
    auto jsResourceManager = args[8];
    int envId = arkJS.getDouble(args[9]);
    auto fontPathByFontFamilyEntries = arkJS.getObjectProperties(args[10]);
    std::unordered_map<std::string, std::string> fontPathByFontFamily;
    for (auto& [fontFamily, fontPathRelativeToRawfileDir] :
         fontPathByFontFamilyEntries) {
      fontPathByFontFamily.emplace(
          arkJS.getString(fontFamily),
          arkJS.getString(fontPathRelativeToRawfileDir));
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
    auto [workerTurboModuleProviderRef, workerEnv] = extractOrDefault(
        WORKER_TURBO_MODULE_PROVIDER_REF_AND_ENV_BY_RN_INSTANCE_ID,
        rnInstanceId,
        std::make_pair(NapiRef{}, nullptr));
    auto taskExecutor =
        std::make_shared<TaskExecutor>(env, std::move(workerTaskRunner));

    auto instanceArkTSChannelTaskRunner =
        std::make_shared<NapiTaskRunner>("INSTANCE_ARK_TS_CHANNEL", env);

    auto arkTSChannel = std::make_shared<ArkTSChannel>(
        instanceArkTSChannelTaskRunner, ArkJS(env), eventDispatcherRef);

    auto inspectorHostTarget = getOrDefault(
        INSPECTOR_HOST_TARGET_BY_INSTANCE_ID, rnInstanceId, nullptr);

    auto markerListener =
        std::make_unique<RNInstanceInternal::RNInstanceRNOHMarkerListener>(
            arkTSChannel);
    RNOHMarker::logMarker(RNOHMarker::RNOHMarkerId::APP_STARTUP_START);
#if USE_HERMES
    DLOG(INFO) << "Using HermesInstance";
    auto jsEngineProvider =
        std::make_shared<JSEngineProvider<facebook::react::HermesInstance>>(
            std::make_shared<facebook::react::EmptyReactNativeConfig>());
#else
    DLOG(INFO) << "Using JSVMInstance";
    auto jsEngineProvider =
        std::make_shared<JSEngineProvider<jsvm::JSVMInstance>>(
            std::make_shared<facebook::react::EmptyReactNativeConfig>(),
            arkJS.getDynamic(args[11]));
#endif
    auto rnInstance = createRNInstance(
        rnInstanceId,
        env,
        workerEnv,
        std::move(taskExecutor),
        std::move(arkTSChannel),
        std::move(markerListener),
        std::move(workerTaskRunner),
        getOrDefault(ARK_TS_BRIDGE_BY_ENV_ID, envId, nullptr),
        std::move(mainArkTSTurboModuleProviderRef),
        std::move(workerTurboModuleProviderRef),
        std::move(frameNodeFactoryRef),
        [env,
         rnInstanceId,
         mutationsListenerRef = std::move(mutationsListenerRef)](
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
        [env,
         rnInstanceId,
         commandDispatcherRef = std::move(commandDispatcherRef)](
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
        featureFlagRegistry,
        UI_TICKER,
        jsResourceManager,
        shouldEnableDebugger,
        std::move(fontPathByFontFamily),
        std::move(jsEngineProvider),
        inspectorHostTarget);

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
    std::shared_ptr<RNInstanceInternal> instance;
    {
      auto lock = std::lock_guard(RN_INSTANCE_BY_ID_MTX);
      instance = extractOrDefault(RN_INSTANCE_BY_ID, rnInstanceId, nullptr);
    }
    if (instance != nullptr) {
      auto taskExecutor = instance->getTaskExecutor();
      // Unregister the instance from the inspector synchronously to avoid
      // relying on the instance destructor, which is scheduled on the JS thread
      // and may cause crash when registering a new instance before the
      // destructor was executed.
      instance->unregisterFromInspector();
      taskExecutor->runTask(
          TaskThread::JS, [instance = std::move(instance)] {});
    }
    return arkJS.getNull();
  });
}

static napi_value loadScript(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "loadScript";
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 4);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    auto onFinishRef = arkJS.createNapiRef(args[3]);

    auto callback = [env, onFinishRef = std::move(onFinishRef), rnInstance](
                        const std::string& errorMsg) mutable {
      auto taskExecutor = rnInstance->getTaskExecutor();
      taskExecutor->runTask(
          TaskThread::MAIN,
          [env, onFinishRef = std::move(onFinishRef), errorMsg]() {
            ArkJS arkJS(env);
            auto listener = arkJS.getReferenceValue(onFinishRef);
            arkJS.call<1>(listener, {arkJS.createString(errorMsg)});
          });
    };

    if (arkJS.isArrayBuffer(args[1])) {
      std::vector<uint8_t> bundleContents = arkJS.getArrayBuffer(args[1]);
      rnInstance->loadScriptFromBuffer(
          std::move(bundleContents), arkJS.getString(args[2]), callback);
    } else {
      if (arkJS.hasProperty(args[1], "filePath")) {
        auto filePathNapiValue = arkJS.getObjectProperty(args[1], "filePath");
        std::string filePath = arkJS.getString(filePathNapiValue);
        rnInstance->loadScriptFromFile(filePath, callback);
      } else if (arkJS.hasProperty(args[1], "rawFilePath")) {
        auto rawFilePathNapiValue =
            arkJS.getObjectProperty(args[1], "rawFilePath");
        std::string rawFilePath = arkJS.getString(rawFilePathNapiValue);
        rnInstance->loadScriptFromRawFile(rawFilePath, callback);
      }
    }

    return arkJS.getNull();
  });
}

static napi_value updateSurfaceConstraints(
    napi_env env,
    napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "updateSurfaceConstraints";
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 10);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }

    rnInstance->updateSurfaceConstraints(
        arkJS.getDouble(args[1]),
        arkJS.getDouble(args[2]),
        arkJS.getDouble(args[3]),
        arkJS.getDouble(args[4]),
        arkJS.getDouble(args[5]),
        arkJS.getDouble(args[6]),
        arkJS.getDouble(args[7]),
        arkJS.getDouble(args[8]),
        arkJS.getBoolean(args[9]));
    return arkJS.getNull();
  });
}

static napi_value measureSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    DLOG(INFO) << "measureSurface";
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 10);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    auto size = rnInstance->measureSurface(
        arkJS.getDouble(args[1]),
        arkJS.getDouble(args[2]),
        arkJS.getDouble(args[3]),
        arkJS.getDouble(args[4]),
        arkJS.getDouble(args[5]),
        arkJS.getDouble(args[6]),
        arkJS.getDouble(args[7]),
        arkJS.getDouble(args[8]),
        arkJS.getBoolean(args[9]));
    return arkJS.createObjectBuilder()
        .addProperty("width", size.width)
        .addProperty("height", size.height)
        .build();
  });
}

static napi_value createSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 3);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
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
    auto args = arkJS.getCallbackArgs(info, 11);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    facebook::react::Tag surfaceId = arkJS.getDouble(args[1]);
    DLOG(INFO) << "startSurface: surfaceId=" << surfaceId << "\n";
    rnInstance->startSurface(
        surfaceId,
        arkJS.getDouble(args[2]),
        arkJS.getDouble(args[3]),
        arkJS.getDouble(args[4]),
        arkJS.getDouble(args[5]),
        arkJS.getDouble(args[6]),
        arkJS.getDouble(args[7]),
        arkJS.getDouble(args[8]),
        arkJS.getBoolean(args[9]),
        arkJS.getDynamic(args[10]));
    return arkJS.getNull();
  });
}

static napi_value stopSurface(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 3);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    facebook::react::Tag surfaceId = arkJS.getDouble(args[1]);
    auto n_onStopRef = arkJS.createNapiRef(args[2]);
    DLOG(INFO) << "stopSurface: surfaceId=" << surfaceId << "\n";
    rnInstance->stopSurface(
        surfaceId, [env, n_onStopRef = std::move(n_onStopRef)]() {
          ArkJS arkJS(env);
          arkJS.call(arkJS.getReferenceValue(n_onStopRef), {});
        });
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
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    rnInstance->destroySurface(surfaceId);
    return arkJS.getNull();
  });
}

static napi_value setSurfaceDisplayMode(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 3);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
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
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    rnInstance->emitComponentEvent(
        env, arkJS.getDouble(args[1]), arkJS.getString(args[2]), args[3]);
    return arkJS.getNull();
  });
}

/**
 * @thread: MAIN/WORKER
 */
static napi_value callRNFunction(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 4);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto moduleString = arkJS.getString(args[1]);
    auto nameString = arkJS.getString(args[2]);
    auto argsDynamic = arkJS.getDynamic(args[3]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    rnInstance->callJSFunction(
        std::move(moduleString), std::move(nameString), std::move(argsDynamic));
    return arkJS.getNull();
  });
}

static napi_value onMemoryLevel(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 1);
    auto memoryLevel = arkJS.getDouble(args[0]);
    auto lock = std::unique_lock<std::mutex>(RN_INSTANCE_BY_ID_MTX);
    auto instances = RN_INSTANCE_BY_ID;
    lock.unlock();
    for (auto& [id, instance] : instances) {
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
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    auto componentName = arkJS.getString(args[1]);
    auto tag = arkJS.getDouble(args[2]);
    auto state = args[3];
    rnInstance->updateState(
        env, componentName, static_cast<facebook::react::Tag>(tag), state);
    return arkJS.getNull();
  });
}

static napi_value logMarker(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    auto markerId = arkJS.getString(args[0]);
    auto rnInstanceId = std::to_string(arkJS.getDouble(args[1]));
    RNOHMarker::logMarker(markerId, rnInstanceId.c_str());
    return arkJS.getNull();
  });
}

/**
 * @thread: MAIN/WORKER
 */
static napi_value onArkTSMessage(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    auto messageName = arkJS.getString(args[0]);
    auto wrappedPayload = arkJS.getDynamic(args[1]);
    auto rnInstanceId = wrappedPayload["rnInstanceId"].getDouble();
    const auto& messagePayload = wrappedPayload["payload"];
    auto rnInstance = maybeGetInstanceById(rnInstanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    std::weak_ptr<RNInstanceInternal> weakRNInstance = rnInstance;
    auto taskExecutor = rnInstance->getTaskExecutor();
    if (taskExecutor->isOnTaskThread(TaskThread::MAIN)) {
      rnInstance->handleArkTSMessage(messageName, messagePayload);
    } else {
      taskExecutor->runTask(
          TaskThread::MAIN, [weakRNInstance, messageName, messagePayload] {
            auto rnInstance = weakRNInstance.lock();
            if (rnInstance == nullptr) {
              return;
            }
            rnInstance->handleArkTSMessage(messageName, messagePayload);
          });
    }
    return arkJS.getNull();
  });
}

static napi_value attachRootView(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 3);
    auto instanceId = arkJS.getInteger(args[0]);
    auto surfaceId = arkJS.getInteger(args[1]);
    auto nodeContentHandle = NodeContentHandle::fromNapiValue(env, args[2]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.createFromRNOHError(
          RNOHError("Failed to get the RNInstance"));
    }
    auto rnInstanceCAPIRawPtr =
        std::dynamic_pointer_cast<RNInstanceCAPI>(rnInstance);
    if (rnInstanceCAPIRawPtr != nullptr) {
      rnInstanceCAPIRawPtr->attachRootView(
          std::move(nodeContentHandle), surfaceId);
    }
    return arkJS.getNull();
  });
}

static napi_value detachRootView(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    auto instanceId = arkJS.getInteger(args[0]);
    auto surfaceId = arkJS.getInteger(args[1]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.createFromRNOHError(
          RNOHError("Failed to get the RNInstance"));
    }
    auto rnInstanceCAPIRawPtr =
        std::dynamic_pointer_cast<RNInstanceCAPI>(rnInstance);
    if (rnInstanceCAPIRawPtr != nullptr) {
      rnInstanceCAPIRawPtr->detachRootView(surfaceId);
    }
    return arkJS.getNull();
  });
}

static napi_value getNativeNodeIdByTag(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 2);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    auto rnInstanceCAPI = std::dynamic_pointer_cast<RNInstanceCAPI>(rnInstance);
    if (rnInstanceCAPI == nullptr) {
      return arkJS.getUndefined();
    }
    auto tag = arkJS.getDouble(args[1]);
    auto nativeNodeId = rnInstanceCAPI->getNativeNodeIdByTag(tag);
    return nativeNodeId.has_value() ? arkJS.createString(nativeNodeId.value())
                                    : arkJS.getUndefined();
  });
}

static napi_value registerFont(napi_env env, napi_callback_info info) {
  return invoke(env, [&] {
    ArkJS arkJS(env);
    auto args = arkJS.getCallbackArgs(info, 3);
    size_t instanceId = arkJS.getDouble(args[0]);
    auto rnInstance = maybeGetInstanceById(instanceId);
    if (!rnInstance) {
      return arkJS.getUndefined();
    }
    auto fontName = arkJS.getString(args[1]);
    auto fontPath = arkJS.getString(args[2]);

    rnInstance->registerFont(fontName, fontPath);

    return arkJS.getUndefined();
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
      {"createInspectorHostTarget",
       nullptr,
       createInspectorHostTarget,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"releaseInspectorHostTarget",
       nullptr,
       releaseInspectorHostTarget,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"resumeDebugger",
       nullptr,
       resumeDebugger,
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
      {"measureSurface",
       nullptr,
       measureSurface,
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
      {"logMarker",
       nullptr,
       logMarker,
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
      {"getInspectorPackagerConnection",
       nullptr,
       rnoh::getInspectorPackagerConnection,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"getInspectorFlagIsFuseboxEnabled",
       nullptr,
       rnoh::getInspectorFlagIsFuseboxEnabled,
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
      {"registerFont",
       nullptr,
       ::registerFont,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"attachRootView",
       nullptr,
       ::attachRootView,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"detachRootView",
       nullptr,
       ::detachRootView,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
  };

  napi_define_properties(
      env, exports, sizeof(desc) / sizeof(napi_property_descriptor), desc);

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
