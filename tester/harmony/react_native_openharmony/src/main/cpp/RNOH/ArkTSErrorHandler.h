#pragma once

#include <boost/exception/diagnostic_information.hpp>
#include "ArkJS.h"

namespace rnoh {
class ArkTSErrorHandler {
  ArkJS m_arkJS;
  napi_ref m_arkTSErrorHandlerRef;

 public:
  using Shared = std::shared_ptr<ArkTSErrorHandler>;
  
  ArkTSErrorHandler(napi_env env, napi_ref ref)
      : m_arkJS(env), m_arkTSErrorHandlerRef(ref) {}

  void handleError(std::exception_ptr ex) {
    try {
      LOG(ERROR) << boost::diagnostic_information(ex);
      std::rethrow_exception(ex);
    } catch (const RNOHError& e) {
      m_arkJS.getObject(m_arkTSErrorHandlerRef)
          .call("handleError", {m_arkJS.createFromRNOHError(e)});
    } catch (const facebook::jsi::JSError& e) {
      m_arkJS.getObject(m_arkTSErrorHandlerRef)
          .call("handleError", {m_arkJS.createFromJSError(e)});
    } catch (const std::exception& e) {
      m_arkJS.getObject(m_arkTSErrorHandlerRef)
          .call("handleError", {m_arkJS.createFromException(e)});
    }
  }
};
} // namespace rnoh