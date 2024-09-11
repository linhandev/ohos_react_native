#include "RNOH/Package.h"
#include "RNOH/generated/BaseReactNativeOpenharmonySamplePackagePackage.h"

namespace rnoh {
class SamplePackage : public BaseReactNativeOpenharmonySamplePackagePackage {
  using Super = BaseReactNativeOpenharmonySamplePackagePackage;

 public:
  SamplePackage(Package::Context ctx)
      : BaseReactNativeOpenharmonySamplePackagePackage(ctx) {}

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
