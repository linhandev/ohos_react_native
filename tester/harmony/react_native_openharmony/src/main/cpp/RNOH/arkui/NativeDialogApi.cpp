#include "NativeDialogApi.h"
#include <glog/logging.h>

namespace rnoh {

ArkUI_NativeDialogAPI_1* NativeDialogApi::getInstance() {
  static ArkUI_NativeDialogAPI_1* INSTANCE = nullptr;
  if (INSTANCE == nullptr) {
    OH_ArkUI_GetModuleInterface(
        ARKUI_NATIVE_DIALOG, ArkUI_NativeDialogAPI_1, INSTANCE);
    if (INSTANCE == nullptr) {
      LOG(FATAL) << "Failed to get native dialog API instance.";
    }
  }
  return INSTANCE;
}

} // namespace rnoh