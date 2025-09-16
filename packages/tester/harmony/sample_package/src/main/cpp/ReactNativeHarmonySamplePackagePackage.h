#include "RNOH/Package.h"
#include "RNOH/generated/BaseReactNativeHarmonySamplePackage2Package.h"

namespace rnoh {
class ReactNativeHarmonySamplePackagePackage
    : public BaseReactNativeHarmonySamplePackage2Package {
  using Super = BaseReactNativeHarmonySamplePackage2Package;

 public:
  ReactNativeHarmonySamplePackagePackage(Package::Context ctx)
      : BaseReactNativeHarmonySamplePackage2Package(ctx) {}

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
