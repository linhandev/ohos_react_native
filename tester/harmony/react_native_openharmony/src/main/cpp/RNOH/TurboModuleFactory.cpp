#include "RNOH/TurboModuleFactory.h"
#include "Assert.h"
#include "RNOH/RNInstance.h"
#include "RNOH/RNOHError.h"
#include "RNOH/StubModule.h"
#include "RNOH/UIManagerModule.h"
#include "TaskExecutor/TaskExecutor.h"
#include "TurboModuleFactory.h"

using namespace rnoh;
using namespace facebook;

TurboModuleFactory::TurboModuleFactory(
   std::unordered_map<TaskThread, ArkTSTurboModuleEnvironment>
        arkTSTurboModuleEnvironmentByTaskThread,
    FeatureFlagRegistry::Shared featureFlagRegistry,
    const ComponentJSIBinderByString&& componentBinderByString,
    std::shared_ptr<TaskExecutor> taskExecutor,
    std::vector<std::shared_ptr<TurboModuleFactoryDelegate>> delegates)
   : m_arkTSTurboModuleEnvironmentByTaskThread(
          arkTSTurboModuleEnvironmentByTaskThread),
      m_featureFlagRegistry(std::move(featureFlagRegistry)),
      m_componentBinderByString(std::move(componentBinderByString)),
      m_taskExecutor(taskExecutor),
      m_delegates(delegates) {}

TurboModuleFactory::SharedTurboModule TurboModuleFactory::create(
    std::shared_ptr<facebook::react::CallInvoker> jsInvoker,
    const std::string& name,
    std::shared_ptr<EventDispatcher> eventDispatcher,
    std::shared_ptr<MessageQueueThread> jsQueue,
    std::shared_ptr<facebook::react::Scheduler> scheduler,
    std::weak_ptr<RNInstance> instance) const {
  LOG(INFO) << "Creating Turbo Module: " << name;
  auto arkTSTurboModuleThread =
      this->findArkTSTurboModuleThread(name).value_or(TaskThread::JS);
  auto arkTSTurboModuleEnvironment =
      this->getArkTSTurboModuleEnvironmentByTaskThread(arkTSTurboModuleThread);
  Context ctx{
      {.jsInvoker = jsInvoker, .instance = instance},
     .env = arkTSTurboModuleEnvironment.napiEnv,
      .arkTSTurboModuleInstanceRef = arkTSTurboModuleThread == TaskThread::JS
          ? nullptr
          : this->maybeGetArkTsTurboModuleInstanceRef(
                name, arkTSTurboModuleEnvironment),
      .turboModuleThread = arkTSTurboModuleThread,
      .taskExecutor = m_taskExecutor,
      .eventDispatcher = eventDispatcher,
      .jsQueue = jsQueue,
      .scheduler = scheduler};
  if (name == "UIManager") {
    return std::make_shared<UIManagerModule>(
        ctx, name, std::move(m_componentBinderByString));
  } else {
    auto result = this->delegateCreatingTurboModule(ctx, name);
    if (result != nullptr) {
      auto arkTSTurboModule =
          std::dynamic_pointer_cast<const ArkTSTurboModule>(result);
      if (arkTSTurboModule != nullptr &&
          ctx.arkTSTurboModuleInstanceRef == nullptr) {
                 std::vector<std::string> suggestions = {
            "Have you linked a package that provides this turbo module on the ArkTS side?"};
        if (!m_featureFlagRegistry->isFeatureFlagOn("WORKER_THREAD_ENABLED")) {
          suggestions.push_back(
              "Is this a WorkerTurboModule? If so, it requires the Worker thread to be enabled. Check RNAbility::getRNOHWorkerScriptUrl.");
        }
        throw FatalRNOHError(
            std::string("Couldn't find Turbo Module '")
                .append(name)
                .append("' on the ArkTS side."),
            suggestions);
      }
      return result;
    }
  }

  return this->handleUnregisteredModuleRequest(ctx, name);
}

std::optional<TaskThread> TurboModuleFactory::findArkTSTurboModuleThread(
    const std::string& turboModuleName) const {
  if (m_featureFlagRegistry->isFeatureFlagOn("WORKER_THREAD_ENABLED")) {
    auto workerArkTSTurboModuleEnv =
        this->getArkTSTurboModuleEnvironmentByTaskThread(TaskThread::WORKER);
    if (this->hasArkTSTurboModule(
            turboModuleName,
            TaskThread::WORKER,
            workerArkTSTurboModuleEnv.napiEnv,
            workerArkTSTurboModuleEnv.arkTSTurboModuleProviderRef)) {
      return TaskThread::WORKER;
    }
  }
  auto mainArkTSTurboModuleEnv =
      this->getArkTSTurboModuleEnvironmentByTaskThread(TaskThread::MAIN);
  if (this->hasArkTSTurboModule(
          turboModuleName,
          TaskThread::MAIN,
          mainArkTSTurboModuleEnv.napiEnv,
          mainArkTSTurboModuleEnv.arkTSTurboModuleProviderRef)) {
    return TaskThread::MAIN;
  }
  return std::nullopt;
}

bool TurboModuleFactory::hasArkTSTurboModule(
    const std::string& turboModuleName,
    TaskThread thread,
    napi_env env,
    napi_ref arkTSTurboModuleProviderRef) const {
  ArkJS arkJS(env);
  bool result = false;
  m_taskExecutor->runSyncTask(thread, [&] {
    RNOH_ASSERT(arkTSTurboModuleProviderRef != nullptr);
    result = arkJS.getBoolean(
        arkJS.getObject(arkTSTurboModuleProviderRef)
            .call("hasModule", {arkJS.createString(turboModuleName)}));
  });
  return result;
}

TurboModuleFactory::ArkTSTurboModuleEnvironment
TurboModuleFactory::getArkTSTurboModuleEnvironmentByTaskThread(
    TaskThread taskThread) const {
  auto it = m_arkTSTurboModuleEnvironmentByTaskThread.find(taskThread);
  if (it != m_arkTSTurboModuleEnvironmentByTaskThread.end()) {
    return it->second;
  }
  return {.napiEnv = nullptr, .arkTSTurboModuleProviderRef = nullptr};
}

TurboModuleFactory::SharedTurboModule
TurboModuleFactory::delegateCreatingTurboModule(
    Context ctx,
    const std::string& name) const {
  for (auto delegate : m_delegates) {
    auto result = delegate->createTurboModule(ctx, name);
    if (result != nullptr) {
      return result;
    }
  }
  return nullptr;
}

napi_ref TurboModuleFactory::maybeGetArkTsTurboModuleInstanceRef(
    const std::string& name,
    ArkTSTurboModuleEnvironment arkTSTurboModuleEnv) const {
  VLOG(3) << "TurboModuleFactory::maybeGetArkTsTurboModuleInstanceRef: start";
  RNOH_ASSERT(arkTSTurboModuleEnv.arkTSTurboModuleProviderRef != nullptr);
  napi_ref result = nullptr;
  m_taskExecutor->runSyncTask(
      TaskThread::MAIN, [tmEnv = arkTSTurboModuleEnv, name, &result]() {
        VLOG(3)
            << "TurboModuleFactory::maybeGetArkTsTurboModuleInstanceRef: started calling hasModule";
        ArkJS arkJS(tmEnv.napiEnv);
        {
          auto result = arkJS.getObject(tmEnv.arkTSTurboModuleProviderRef)
                            .call("hasModule", {arkJS.createString(name)});
          if (!arkJS.getBoolean(result)) {
            return;
          }
        }
        auto n_turboModuleInstance =
            arkJS.getObject(tmEnv.arkTSTurboModuleProviderRef)
                .call("getModule", {arkJS.createString(name)});
        result = arkJS.createReference(n_turboModuleInstance);
      });
  VLOG(3) << "TurboModuleFactory::maybeGetArkTsTurboModuleInstanceRef: stop";
  return result;
}

TurboModuleFactory::SharedTurboModule
TurboModuleFactory::handleUnregisteredModuleRequest(
    Context ctx,
    const std::string& name) const {
  LOG(WARNING) << "Turbo Module '" << name << "' not found.";
  return nullptr;
}
