#pragma once

#include "ArkJS.h"
#include "DisplayMetricsManager.h"
#include "ThreadGuard.h"

namespace rnoh {

/**
 * @thread: MAIN
 */
class ArkTSBridge final : public DisplayMetricsManager {
 public:
  using Shared = std::shared_ptr<ArkTSBridge>;

  ArkTSBridge(napi_env env, napi_ref napiBridgeRef);

  ArkTSBridge(ArkTSBridge const&) = delete;
  ArkTSBridge& operator=(ArkTSBridge const&) = delete;

  ~ArkTSBridge();

  void handleError(std::exception_ptr ex);
  DisplayMetrics getDisplayMetrics() override;

 protected:
  ArkJS m_arkJs;
  napi_ref m_arkTSBridgeRef;
  ThreadGuard m_threadGuard;
};
} // namespace rnoh