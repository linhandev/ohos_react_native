#pragma once
#include <jsi/jsi.h>
#include <string>
#include "RNOHCorePackage/TurboModules/BlobTurboModule.h"
#include "ReactCommon/TurboModule.h"

namespace rnoh {

class BlobCollector : public facebook::jsi::HostObject {
 public:
  BlobCollector(
      std::weak_ptr<BlobTurboModule> weakBlobTurboModule,
      const std::string& blobId);
  ~BlobCollector();

  static void install(
      facebook::jsi::Runtime& rt,
      std::weak_ptr<BlobTurboModule> weakBlobTurboModule);

 private:
  const std::string m_blobId;
  std::weak_ptr<BlobTurboModule> m_weakBlobTurboModule;
};

} // namespace rnoh