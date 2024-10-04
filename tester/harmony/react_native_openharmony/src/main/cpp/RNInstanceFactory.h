#pragma once
#include <rawfile/raw_file_manager.h>
#include <react/renderer/components/image/ImageComponentDescriptor.h>
#include <react/renderer/components/text/ParagraphComponentDescriptor.h>
#include <react/renderer/mounting/ShadowViewMutation.h>
#include <array>
#include <memory>
#include <string>
#include <vector>
#include "RNOH/ArkJS.h"
#include "RNOH/ArkTSBridge.h"
#include "RNOH/ArkTSChannel.h"
#include "RNOH/ArkTSMessageHandler.h"
#include "RNOH/ComponentInstanceFactory.h"
#include "RNOH/ComponentInstancePreallocationRequestQueue.h"
#include "RNOH/ComponentInstanceRegistry.h"
#include "RNOH/CustomComponentArkUINodeHandleFactory.h"
#include "RNOH/EventEmitRequestHandler.h"
#include "RNOH/FeatureFlagRegistry.h"
#include "RNOH/ImageSourceResolver.h"
#include "RNOH/MountingManagerArkTS.h"
#include "RNOH/MountingManagerCAPI.h"
#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/PackageProvider.h"
#include "RNOH/Performance/HarmonyReactMarker.h"
#include "RNOH/RNInstance.h"
#include "RNOH/RNInstanceCAPI.h"
#include "RNOH/TaskExecutor/NapiTaskRunner.h"
#include "RNOH/TextMeasurer.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/UITicker.h"
#include "RNOHCorePackage/RNOHCorePackage.h"

using namespace rnoh;

class PackageToComponentInstanceFactoryDelegateAdapter
    : public ComponentInstanceFactoryDelegate {
  Package::Shared m_package;

 public:
  PackageToComponentInstanceFactoryDelegateAdapter(Package::Shared package)
      : m_package(std::move(package)) {}

  ComponentInstance::Shared create(ComponentInstance::Context ctx) override {
    return m_package->createComponentInstance(std::move(ctx));
  };
};

std::shared_ptr<RNInstanceInternal> createRNInstance(
    int id,
    napi_env env,
    napi_env workerEnv,
    std::unique_ptr<NapiTaskRunner> workerTaskRunner,
    ArkTSBridge::Shared arkTSBridge,
    NapiRef mainArkTSTurboModuleProviderRef,
    NapiRef workerArkTSTurboModuleProviderRef,
    NapiRef frameNodeFactoryRef,
    MutationsListener mutationsListener,
    MountingManagerArkTS::CommandDispatcher commandDispatcher,
    NapiRef napiEventDispatcherRef,
    FeatureFlagRegistry::Shared featureFlagRegistry,
    UITicker::Shared uiTicker,
    napi_value jsResourceManager,
    bool shouldEnableDebugger,
    bool shouldEnableBackgroundExecutor,
    std::unordered_map<std::string, std::string> fontPathByFontFamily) {
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::REACT_INSTANCE_INIT_START, id);
  auto taskExecutor = std::make_shared<TaskExecutor>(
      env, std::move(workerTaskRunner), shouldEnableBackgroundExecutor);
  auto arkTSChannel = std::make_shared<ArkTSChannel>(
      taskExecutor, ArkJS(env), napiEventDispatcherRef);

  taskExecutor->setExceptionHandler(
      [weakExecutor = std::weak_ptr(taskExecutor),
       weakArkTsBridge = std::weak_ptr(arkTSBridge)](std::exception_ptr e) {
        auto executor = weakExecutor.lock();
        if (executor == nullptr) {
          return;
        }
        executor->runTask(TaskThread::MAIN, [e, weakArkTsBridge]() {
          auto arkTSBridge = weakArkTsBridge.lock();
          if (arkTSBridge == nullptr) {
            return;
          }
          arkTSBridge->handleError(e);
        });
      });

  auto contextContainer = std::make_shared<facebook::react::ContextContainer>();
  SharedNativeResourceManager resourceManager(
      OH_ResourceManager_InitNativeResourceManager(env, jsResourceManager),
      OH_ResourceManager_ReleaseNativeResourceManager);
  auto fontRegistry = std::make_shared<FontRegistry>(resourceManager);
  for (auto& [fontFamilyName, fontPathRelativeToRawfileDir] :
       fontPathByFontFamily) {
    fontRegistry->registerFont(fontFamilyName, fontPathRelativeToRawfileDir);
  }
  auto textMeasurer =
      std::make_shared<TextMeasurer>(featureFlagRegistry, fontRegistry, id);
  auto shadowViewRegistry = std::make_shared<ShadowViewRegistry>();
  contextContainer->insert("textLayoutManagerDelegate", textMeasurer);
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::PROCESS_PACKAGES_START);
  PackageProvider packageProvider;
  auto packages = packageProvider.getPackages({});
  HarmonyReactMarker::logMarker(HarmonyReactMarker::HarmonyReactMarkerId::
                                    PROCESS_CORE_REACT_PACKAGE_START);
  packages.insert(
      packages.begin(),
      std::make_shared<RNOHCorePackage>(
          Package::Context{.shadowViewRegistry = shadowViewRegistry}));
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::PROCESS_CORE_REACT_PACKAGE_END);
  auto componentDescriptorProviderRegistry =
      std::make_shared<facebook::react::ComponentDescriptorProviderRegistry>();
  std::vector<std::shared_ptr<TurboModuleFactoryDelegate>>
      turboModuleFactoryDelegates;
  ComponentJSIBinderByString componentJSIBinderByName = {};
  GlobalJSIBinders globalJSIBinders = {};
  ComponentNapiBinderByString componentNapiBinderByName = {};
  EventEmitRequestHandlers eventEmitRequestHandlers = {};
  std::vector<ComponentInstanceFactoryDelegate::Shared>
      componentInstanceFactoryDelegates = {};
  std::vector<ArkTSMessageHandler::Shared> arkTSMessageHandlers = {};

  for (auto& package : packages) {
    auto turboModuleFactoryDelegate =
        package->createTurboModuleFactoryDelegate();
    if (turboModuleFactoryDelegate != nullptr) {
      turboModuleFactoryDelegates.push_back(
          std::move(turboModuleFactoryDelegate));
    }
    for (auto componentDescriptorProvider :
         package->createComponentDescriptorProviders()) {
      componentDescriptorProviderRegistry->add(componentDescriptorProvider);
    }
    for (auto [name, componentJSIBinder] :
         package->createComponentJSIBinderByName()) {
      componentJSIBinderByName.insert({name, componentJSIBinder});
    };
    for (auto [name, componentNapiBinder] :
         package->createComponentNapiBinderByName()) {
      componentNapiBinderByName.insert({name, componentNapiBinder});
    };
    auto packageGlobalJSIBinders = package->createGlobalJSIBinders();
    globalJSIBinders.insert(
        globalJSIBinders.end(),
        std::make_move_iterator(packageGlobalJSIBinders.begin()),
        std::make_move_iterator(packageGlobalJSIBinders.end()));
    auto packageEventEmitRequestHandlers =
        package->createEventEmitRequestHandlers();
    eventEmitRequestHandlers.insert(
        eventEmitRequestHandlers.end(),
        std::make_move_iterator(packageEventEmitRequestHandlers.begin()),
        std::make_move_iterator(packageEventEmitRequestHandlers.end()));
    auto componentInstanceFactoryDelegate =
        package->createComponentInstanceFactoryDelegate();
    if (componentInstanceFactoryDelegate != nullptr) {
      componentInstanceFactoryDelegates.push_back(
          std::move(componentInstanceFactoryDelegate));
    }
    componentInstanceFactoryDelegates.push_back(
        std::make_shared<PackageToComponentInstanceFactoryDelegateAdapter>(
            package));
    for (auto const& arkTSMessageHandler :
         package->createArkTSMessageHandlers()) {
      arkTSMessageHandlers.push_back(arkTSMessageHandler);
    }
  }
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::PROCESS_PACKAGES_END);
  auto arkTSMessageHub = std::make_shared<ArkTSMessageHub>();
  auto turboModuleFactory = TurboModuleFactory(
      {
          // clang-format off
        {TaskThread::MAIN, {.napiEnv = env, .arkTSTurboModuleProviderRef = std::move(mainArkTSTurboModuleProviderRef)}},
        {TaskThread::WORKER, {.napiEnv = workerEnv, .arkTSTurboModuleProviderRef = std::move(workerArkTSTurboModuleProviderRef)}},
      }, // clang-format on
      featureFlagRegistry,
      std::move(componentJSIBinderByName),
      taskExecutor,
      std::move(turboModuleFactoryDelegates),
      arkTSMessageHub);
  auto mutationsToNapiConverter = std::make_shared<MutationsToNapiConverter>(
      std::move(componentNapiBinderByName));
  auto mountingManager = std::make_shared<MountingManagerArkTS>(
      shadowViewRegistry,
      [mutationsListener = std::move(mutationsListener),
       mutationsToNapiConverter](
          facebook::react::ShadowViewMutationList mutations) {
        mutationsListener(*mutationsToNapiConverter, mutations);
      },
      [weakExecutor = std::weak_ptr(taskExecutor),
       commandDispatcher = commandDispatcher](
          auto tag, auto commandName, auto args) {
        if (auto taskExecutor = weakExecutor.lock()) {
          taskExecutor->runTask(
              TaskThread::MAIN,
              [tag,
               commandDispatcher,
               commandName = std::move(commandName),
               args = std::move(args)]() {
                commandDispatcher(tag, commandName, args);
              });
        }
      },
      arkTSChannel);
  arkTSMessageHandlers.emplace_back(arkTSMessageHub);
  auto componentInstanceDependencies =
      std::make_shared<ComponentInstance::Dependencies>();
  componentInstanceDependencies->arkTSChannel = arkTSChannel;
  componentInstanceDependencies->arkTsMessageHub = arkTSMessageHub;
  componentInstanceDependencies->arkTSMessageHub = arkTSMessageHub;
  componentInstanceDependencies->displayMetricsManager = arkTSBridge;
  auto customComponentArkUINodeFactory =
      std::make_shared<CustomComponentArkUINodeHandleFactory>(
          env, frameNodeFactoryRef);
  auto componentInstanceFactory = std::make_shared<ComponentInstanceFactory>(
      componentInstanceFactoryDelegates,
      componentInstanceDependencies,
      customComponentArkUINodeFactory);
  auto componentInstanceRegistry =
      std::make_shared<ComponentInstanceRegistry>();
  componentInstanceDependencies->componentInstanceRegistry =
      componentInstanceRegistry;
  auto componentInstancePreallocationRequestQueue =
      std::make_shared<ComponentInstancePreallocationRequestQueue>();
  auto componentInstanceProvider = std::make_shared<ComponentInstanceProvider>(
      taskExecutor,
      componentInstancePreallocationRequestQueue,
      componentInstanceFactory,
      uiTicker,
      componentInstanceRegistry);
  auto mountingManagerCAPI = std::make_shared<MountingManagerCAPI>(
      componentInstanceRegistry,
      componentInstanceProvider,
      mountingManager,
      featureFlagRegistry,
      arkTSChannel);
  auto rnInstance = std::make_shared<RNInstanceCAPI>(
      id,
      contextContainer,
      std::move(turboModuleFactory),
      taskExecutor,
      componentDescriptorProviderRegistry,
      mutationsToNapiConverter,
      eventEmitRequestHandlers,
      globalJSIBinders,
      uiTicker,
      shadowViewRegistry,
      std::move(mountingManagerCAPI),
      std::move(arkTSMessageHandlers),
      std::move(arkTSChannel),
      arkTSMessageHub,
      componentInstanceRegistry,
      componentInstanceFactory,
      componentInstancePreallocationRequestQueue,
      std::move(resourceManager),
      shouldEnableDebugger,
      shouldEnableBackgroundExecutor,
      arkTSBridge,
      std::move(fontRegistry));
  componentInstanceDependencies->rnInstance = rnInstance;
  auto imageSourceResolver =
      std::make_shared<ImageSourceResolver>(arkTSMessageHub, rnInstance);
  componentInstanceDependencies->imageSourceResolver = imageSourceResolver;
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::REACT_INSTANCE_INIT_STOP, id);
  return rnInstance;
}
