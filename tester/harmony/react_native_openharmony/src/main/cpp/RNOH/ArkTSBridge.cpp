#include "ArkTSBridge.h"

#include <boost/exception/diagnostic_information.hpp>
#include <glog/logging.h>
#include <jsi/jsi.h>
#include "RNOH/Assert.h"
#include "RNOH/RNOHError.h"

namespace rnoh {

auto physicalPixelsFromNapiValue(napi_env env, napi_value value)
    -> PhysicalPixels {
  ArkJS arkJs(env);
  return {
      static_cast<float>(
          arkJs.getDouble(arkJs.getObjectProperty(value, "width"))),
      static_cast<float>(
          arkJs.getDouble(arkJs.getObjectProperty(value, "height"))),
      static_cast<float>(
          arkJs.getDouble(arkJs.getObjectProperty(value, "scale"))),
      static_cast<float>(
          arkJs.getDouble(arkJs.getObjectProperty(value, "fontScale"))),
      static_cast<float>(
          arkJs.getDouble(arkJs.getObjectProperty(value, "densityDpi"))),
  };
}

auto displayMetricsFromNapiValue(napi_env env, napi_value value)
    -> DisplayMetrics {
  ArkJS arkJs(env);
  return {
      physicalPixelsFromNapiValue(
          env, arkJs.getObjectProperty(value, "windowPhysicalPixels")),
      physicalPixelsFromNapiValue(
          env, arkJs.getObjectProperty(value, "screenPhysicalPixels")),
  };
}

ArkTSBridge::ArkTSBridge(napi_env env, napi_ref napiBridgeRef)
    : m_arkJs(ArkJS(env)), m_arkTsBridgeRef(napiBridgeRef) {
  LOG(INFO) << "ArkTSBridge::ArkTSBridge";
}

ArkTSBridge::~ArkTSBridge() noexcept {
  LOG(INFO) << "ArkTSBridge::~ArkTSBridge";
  m_threadGuard.assertThread();
  m_arkJs.deleteReference(m_arkTsBridgeRef);
}

void ArkTSBridge::handleError(std::exception_ptr ex) {
  m_threadGuard.assertThread();
  try {
    LOG(ERROR) << boost::diagnostic_information(ex);
    std::rethrow_exception(ex);
  } catch (const RNOHError& e) {
    m_arkJs.getObject(m_arkTsBridgeRef)
        .call("handleError", {m_arkJs.createFromRNOHError(e)});
  } catch (const facebook::jsi::JSError& e) {
    m_arkJs.getObject(m_arkTsBridgeRef)
        .call("handleError", {m_arkJs.createFromJSError(e)});
  } catch (const std::exception& e) {
    m_arkJs.getObject(m_arkTsBridgeRef)
        .call("handleError", {m_arkJs.createFromException(e)});
  }
}

auto ArkTSBridge::getDisplayMetrics() -> DisplayMetrics {
  m_threadGuard.assertThread();
  auto napiBridgeObject = m_arkJs.getReferenceValue(m_arkTsBridgeRef);
  auto methodImpl =
      m_arkJs.getObjectProperty(napiBridgeObject, "getDisplayMetrics");
  auto napiResult = m_arkJs.call<0>(methodImpl, {});
  return displayMetricsFromNapiValue(m_arkJs.getEnv(), napiResult);
}

} // namespace rnoh