#pragma once

#include <boost/exception/diagnostic_information.hpp>
#include "ArkJS.h"
#include "ThreadGuard.h"

namespace rnoh {
/**
 * @thread: MAIN
 */
class ArkTSErrorHandler {
  ArkJS m_arkJS;
  napi_ref m_arkTSErrorHandlerRef;
  ThreadGuard m_threadGuard;

 public:
  using Shared = std::shared_ptr<ArkTSErrorHandler>;

  ArkTSErrorHandler(napi_env env, napi_ref&& ref)
      : m_arkJS(env), m_arkTSErrorHandlerRef(std::move(ref)) {}

  void handleError(std::exception_ptr ex) {
    m_threadGuard.assertThread();
    try {
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

  ~ArkTSErrorHandler() {
    m_threadGuard.assertThread();
    m_arkJS.deleteReference(m_arkTSErrorHandlerRef);
  }
};
} // namespace rnoh