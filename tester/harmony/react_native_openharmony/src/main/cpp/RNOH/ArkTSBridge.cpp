#include "ArkTSBridge.h"

#include <boost/exception/diagnostic_information.hpp>
#include <glog/logging.h>
#include <jsi/jsi.h>
#include <react/renderer/debug/SystraceSection.h>
#include "RNOH/Assert.h"
#include "RNOH/RNOHError.h"

namespace rnoh {

auto physicalPixelsFromNapiValue(napi_env env, napi_value value)
    -> PhysicalPixels {
  ArkJS arkJS(env);
  return {
      static_cast<float>(
          arkJS.getDouble(arkJS.getObjectProperty(value, "width"))),
      static_cast<float>(
          arkJS.getDouble(arkJS.getObjectProperty(value, "height"))),
      static_cast<float>(
          arkJS.getDouble(arkJS.getObjectProperty(value, "scale"))),
      static_cast<float>(
          arkJS.getDouble(arkJS.getObjectProperty(value, "fontScale"))),
      static_cast<float>(
          arkJS.getDouble(arkJS.getObjectProperty(value, "densityDpi"))),
  };
}

auto displayMetricsFromNapiValue(napi_env env, napi_value value)
    -> DisplayMetrics {
  ArkJS arkJS(env);
  return {
      physicalPixelsFromNapiValue(
          env, arkJS.getObjectProperty(value, "windowPhysicalPixels")),
      physicalPixelsFromNapiValue(
          env, arkJS.getObjectProperty(value, "screenPhysicalPixels")),
  };
}

ArkTSBridge::ArkTSBridge(napi_env env, NapiRef napiBridgeRef)
    : m_arkJS(ArkJS(env)), m_arkTSBridgeRef(std::move(napiBridgeRef)) {
  LOG(INFO) << "ArkTSBridge::ArkTSBridge";
}

ArkTSBridge::~ArkTSBridge() noexcept {
  LOG(INFO) << "ArkTSBridge::~ArkTSBridge";
  m_threadGuard.assertThread();
}

void ArkTSBridge::handleError(std::exception_ptr ex) {
  m_threadGuard.assertThread();
  try {
    LOG(ERROR) << boost::diagnostic_information(ex);
    std::rethrow_exception(ex);
  } catch (const RNOHError& e) {
    m_arkJS.getObject(m_arkTSBridgeRef)
        .call("handleError", {m_arkJS.createFromRNOHError(e)});
  } catch (const facebook::jsi::JSError& e) {
    m_arkJS.getObject(m_arkTSBridgeRef)
        .call("handleError", {m_arkJS.createFromJSError(e)});
  } catch (const std::exception& e) {
    m_arkJS.getObject(m_arkTSBridgeRef)
        .call("handleError", {m_arkJS.createFromException(e)});
  }
}

auto ArkTSBridge::getDisplayMetrics() -> DisplayMetrics {
  m_threadGuard.assertThread();
  facebook::react::SystraceSection s("#RNOH::ArkTSBridge::getDisplayMetrics");
  auto napiBridgeObject = m_arkJS.getReferenceValue(m_arkTSBridgeRef);
  auto methodImpl =
      m_arkJS.getObjectProperty(napiBridgeObject, "getDisplayMetrics");
  auto napiResult = m_arkJS.call<0>(methodImpl, {});
  return displayMetricsFromNapiValue(m_arkJS.getEnv(), napiResult);
}

auto ArkTSBridge::getFontSizeScale() -> float {
  auto napiBridgeObject = m_arkJS.getReferenceValue(m_arkTSBridgeRef);
  auto methodImpl =
      m_arkJS.getObjectProperty(napiBridgeObject, "getFontSizeScale");
  auto napiResult = m_arkJS.call<0>(methodImpl, {});
  return m_arkJS.getDouble(napiResult);
}

} // namespace rnoh