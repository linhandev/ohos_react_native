#pragma once
#include <jsi/jsi.h>
#include <unordered_map>

namespace rnoh {
/**
 * @internal
 */
class ComponentJSIBinder {
 public:
  virtual facebook::jsi::Object createBindings(facebook::jsi::Runtime&) = 0;
};

/**
 * @internal
 */
using ComponentJSIBinderByString =
    std::unordered_map<std::string, std::shared_ptr<ComponentJSIBinder>>;

} // namespace rnoh
