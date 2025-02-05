#pragma once
#include "RNOH/generated/components/BaseBlankComponentInstance.h"

namespace rnoh {

class BlankComponentInstance : public BaseBlankComponentInstance {
 public:
  using BaseBlankComponentInstance::BaseBlankComponentInstance;
  ArkUINode& getLocalRootArkUINode() override {
    throw NoArkUINodeError{};
  }
};

} // namespace rnoh
