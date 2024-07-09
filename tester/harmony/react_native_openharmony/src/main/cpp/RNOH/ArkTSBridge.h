#pragma once

#include "ArkJS.h"
#include "DisplayMetricsManager.h"
#include "ThreadGuard.h"

namespace rnoh {

class ArkTSErrorHandler {
 public:
  virtual void handleError(std::exception_ptr ex) = 0;
};

/**
 * @internal
 * @thread: MAIN
 */
class ArkTSBridge final : public DisplayMetricsManager,
                          public ArkTSErrorHandler {
 public:
  using Shared = std::shared_ptr<ArkTSBridge>;

  ArkTSBridge(napi_env env, napi_ref napiBridgeRef);

  ArkTSBridge(ArkTSBridge const&) = delete;
  ArkTSBridge& operator=(ArkTSBridge const&) = delete;

  ~ArkTSBridge() noexcept;

  void handleError(std::exception_ptr ex) override;
  DisplayMetrics getDisplayMetrics() override;
  uint32_t getFoldStatus() override;
  bool getIsSplitScreenMode() override;
  float getFontSizeScale() override;

 protected:
  ArkJS m_arkJS;
  napi_ref m_arkTSBridgeRef;
  ThreadGuard m_threadGuard;
};
} // namespace rnoh