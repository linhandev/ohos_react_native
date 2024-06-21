#pragma once
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include "RNOH/ArkTSMessageHandler.h"
#include "RNOH/ComponentInstanceFactory.h"
#include "RNOH/EventEmitRequestHandler.h"
#include "RNOH/GlobalJSIBinder.h"
#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModule.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/UIManagerModule.h"

namespace rnoh {
/**
 * @api
 */
class Package {
 public:
  using Shared = std::shared_ptr<Package>;

  struct Context : ComponentInstance::Context {
    ShadowViewRegistry::Shared shadowViewRegistry;
  };

  Package(Context ctx);
  virtual ~Package(){};

  virtual std::unique_ptr<TurboModuleFactoryDelegate>
  createTurboModuleFactoryDelegate();

  virtual GlobalJSIBinders createGlobalJSIBinders();

  /**
   * @internal
   * Used by codegen.
   */
  virtual std::vector<facebook::react::ComponentDescriptorProvider>
  createComponentDescriptorProviders();

  /**
   * @internal
   * Used by codegen.
   */
  virtual ComponentJSIBinderByString createComponentJSIBinderByName();

  /**
   * @architecture: ArkTS
   * @internal
   * RNOH sends all props to ArkTS side (in ArkTS architecture) by default,
   * however transform property is processed on C++ side. The result of that
   * processing is send to the ArkTS side by providing custom
   * ComponentNapiBinder.
   */
  virtual ComponentNapiBinderByString createComponentNapiBinderByName();

  /**
   * @architecture: ArkTS
   * Receives events from the ArkTS side and invokes the appropriate method on
   * the corresponding EventEmitter on the C++ side.
   */
  virtual EventEmitRequestHandlers createEventEmitRequestHandlers();

  /**
   * @architecture: C-API
   */
  virtual std::vector<ArkTSMessageHandler::Shared>
  createArkTSMessageHandlers() {
    return {};
  };

  /**
   * @architecture: C-API
   * @deprecated: Override `createComponentInstance` instead (latestRNOHVersion:
   * 0.72.27)
   */
  virtual ComponentInstanceFactoryDelegate::Shared
  createComponentInstanceFactoryDelegate();

  /**
   * @architecture: C-API
   */
  virtual ComponentInstance::Shared createComponentInstance(
      const ComponentInstance::Context& ctx) {
    return nullptr;
  };

 protected:
  Context m_ctx;
};
} // namespace rnoh