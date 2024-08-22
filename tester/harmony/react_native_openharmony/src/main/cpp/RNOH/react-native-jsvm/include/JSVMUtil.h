#ifndef JSVM_UTIL_H
#define JSVM_UTIL_H

#include "ark_runtime/jsvm.h"

namespace JSVMUtil {
class HandleScopeWrapper {
 public:
  HandleScopeWrapper(JSVM_Env env) : env(env) {
    OH_JSVM_OpenHandleScope(env, &handleScope);
  }

  ~HandleScopeWrapper() {
    OH_JSVM_CloseHandleScope(env, handleScope);
  }

  HandleScopeWrapper(const HandleScopeWrapper&) = delete;
  HandleScopeWrapper& operator=(const HandleScopeWrapper&) = delete;
  HandleScopeWrapper(HandleScopeWrapper&&) = delete;
  void* operator new(size_t) = delete;
  void* operator new[](size_t) = delete;

 protected:
  JSVM_Env env;

 private:
  JSVM_HandleScope handleScope;
};

} // namespace JSVMUtil

#endif