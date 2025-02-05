#include "RNOH/Package.h"
#include "RNOH/generated/BaseReactNativeHarmonySamplePackagePackage.h"

namespace rnoh {
class ReactNativeHarmonySamplePackagePackage
    : public BaseReactNativeHarmonySamplePackagePackage {
  using Super = BaseReactNativeHarmonySamplePackagePackage;

 public:
  ReactNativeHarmonySamplePackagePackage(Package::Context ctx)
      : BaseReactNativeHarmonySamplePackagePackage(ctx) {}

  std::vector<facebook::react::ComponentDescriptorProvider>
  createComponentDescriptorProviders() override;

  std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate()
      override;

  ComponentNapiBinderByString createComponentNapiBinderByName() override;

  ComponentJSIBinderByString createComponentJSIBinderByName() override;

  std::vector<ArkTSMessageHandler::Shared> createArkTSMessageHandlers()
      override;

  ComponentInstance::Shared createComponentInstance(
      const ComponentInstance::Context& ctx) override;

  ComponentInstanceFactoryDelegate::Shared
  createComponentInstanceFactoryDelegate() override;
};
} // namespace rnoh
