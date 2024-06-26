#pragma once
#include <react/renderer/components/rncore/Props.h>
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"

namespace rnoh {

class PullToRefreshViewNapiBinder : public ViewComponentNapiBinder {
 public:
  napi_value createProps(
      napi_env env,
      facebook::react::ShadowView const shadowView) override {
    ArkJS arkJS(env);
    auto pullToRefreshViewProps = std::dynamic_pointer_cast<
        const facebook::react::PullToRefreshViewProps>(shadowView.props);
    if (!pullToRefreshViewProps) {
      LOG(ERROR)
          << "PullToRefreshViewNapiBinder::createProps: props is not PullToRefreshViewProps";
      return arkJS.getUndefined();
    }

    napi_value napiBaseProps =
        ViewComponentNapiBinder::createProps(env, shadowView);
    auto propsBuilder = arkJS.getObjectBuilder(napiBaseProps);

    return propsBuilder.build();
  };
};

} // namespace rnoh
