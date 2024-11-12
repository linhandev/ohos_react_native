#include "HarmonyReactMarker.h"
#include <glog/logging.h>
#include "RNOH/Assert.h"

namespace rnoh {

std::vector<HarmonyReactMarker::HarmonyReactMarkerListener*>
    HarmonyReactMarker::listeners = {};

void HarmonyReactMarker::setLogMarkerIfNeeded() {
  static std::once_flag flag{};
  std::call_once(flag, []() {
    ReactMarker::logTaggedMarkerImpl = HarmonyReactMarker::logMarker;
    ReactMarker::logTaggedMarkerBridgelessImpl = HarmonyReactMarker::logMarker;
  });
}

void HarmonyReactMarker::logMarker(HarmonyReactMarkerId markerId) {
  logMarker(markerId, "");
}

void HarmonyReactMarker::logMarker(
    HarmonyReactMarkerId markerId,
    facebook::react::Tag tag) {
  logMarker(markerId, std::to_string(tag).c_str());
}

void HarmonyReactMarker::logMarker(
    HarmonyReactMarkerId markerId,
    const char* tag) {
  logMarker(markerId, tag, facebook::react::JSExecutor::performanceNow());
}

void HarmonyReactMarker::logMarker(
    const std::string& markerId,
    const char* tag) {
  logMarker(harmonyMarkerIdForString(markerId), tag);
}

void HarmonyReactMarker::logMarker(
    ReactMarker::ReactMarkerId markerId,
    const char* tag) {
  logMarker(harmonyMarkerIdForReactMarkerId(markerId), tag);
}

void HarmonyReactMarker::logMarker(
    HarmonyReactMarkerId markerId,
    const char* tag,
    double timestamp) {
  auto tagStr = tag == nullptr ? "" : std::string(tag);
  for (auto& listener : listeners) {
    listener->logMarker(markerId, tagStr, timestamp);
  }
}

void HarmonyReactMarker::setAppStartTime(double appStartTime) {
  sAppStartTime = appStartTime;
}

double HarmonyReactMarker::getAppStartTime() {
  return sAppStartTime;
}

void HarmonyReactMarker::addListener(HarmonyReactMarkerListener* listener) {
  listeners.push_back(listener);
}

void HarmonyReactMarker::removeListener(HarmonyReactMarkerListener* listener) {
  listeners.erase(
      std::remove(listeners.begin(), listeners.end(), listener),
      listeners.end());
}

HarmonyReactMarker::HarmonyReactMarkerId
HarmonyReactMarker::harmonyMarkerIdForReactMarkerId(
    const ReactMarker::ReactMarkerId markerId) {
  switch (markerId) {
    case ReactMarker::ReactMarkerId::RUN_JS_BUNDLE_START:
      return HarmonyReactMarkerId::RUN_JS_BUNDLE_START;
    case ReactMarker::ReactMarkerId::RUN_JS_BUNDLE_STOP:
      return HarmonyReactMarkerId::RUN_JS_BUNDLE_STOP;
    case ReactMarker::ReactMarkerId::CREATE_REACT_CONTEXT_STOP:
      return HarmonyReactMarkerId::CREATE_REACT_CONTEXT_STOP;
    case ReactMarker::ReactMarkerId::JS_BUNDLE_STRING_CONVERT_START:
      return HarmonyReactMarkerId::JS_BUNDLE_STRING_CONVERT_START;
    case ReactMarker::ReactMarkerId::JS_BUNDLE_STRING_CONVERT_STOP:
      return HarmonyReactMarkerId::JS_BUNDLE_STRING_CONVERT_STOP;
    case ReactMarker::ReactMarkerId::NATIVE_MODULE_SETUP_START:
      return HarmonyReactMarkerId::NATIVE_MODULE_SETUP_START;
    case ReactMarker::ReactMarkerId::NATIVE_MODULE_SETUP_STOP:
      return HarmonyReactMarkerId::NATIVE_MODULE_SETUP_STOP;
    case ReactMarker::ReactMarkerId::REGISTER_JS_SEGMENT_START:
      return HarmonyReactMarkerId::REGISTER_JS_SEGMENT_START;
    case ReactMarker::ReactMarkerId::REGISTER_JS_SEGMENT_STOP:
      return HarmonyReactMarkerId::REGISTER_JS_SEGMENT_STOP;
    case ReactMarker::ReactMarkerId::NATIVE_REQUIRE_START:
      return HarmonyReactMarkerId::NATIVE_REQUIRE_START;
    case ReactMarker::ReactMarkerId::NATIVE_REQUIRE_STOP:
      return HarmonyReactMarkerId::NATIVE_REQUIRE_STOP;
    case ReactMarker::ReactMarkerId::REACT_INSTANCE_INIT_START:
      return HarmonyReactMarkerId::REACT_INSTANCE_INIT_START;
    case ReactMarker::ReactMarkerId::REACT_INSTANCE_INIT_STOP:
      return HarmonyReactMarkerId::REACT_INSTANCE_INIT_STOP;
    case ReactMarker::ReactMarkerId::APP_STARTUP_START:
      return HarmonyReactMarkerId::APP_STARTUP_START;
    case ReactMarker::ReactMarkerId::APP_STARTUP_STOP:
      return HarmonyReactMarkerId::APP_STARTUP_STOP;
    case ReactMarker::ReactMarkerId::INIT_REACT_RUNTIME_START:
      return HarmonyReactMarkerId::INIT_REACT_RUNTIME_START;
    case ReactMarker::ReactMarkerId::INIT_REACT_RUNTIME_STOP:
      return HarmonyReactMarkerId::INIT_REACT_RUNTIME_STOP;
    default:
      DLOG(WARNING) << "Unhandled ReactMarkerId " << markerId;
      RNOH_ASSERT(false);
      return HarmonyReactMarkerId::UNKNOWN_REACT_MARKER;
  }
}

std::string HarmonyReactMarker::harmonyMarkerIdToString(
    const HarmonyReactMarkerId markerId) {
  switch (markerId) {
    case HarmonyReactMarkerId::UNKNOWN_REACT_MARKER:
      return "UNKNOWN_REACT_MARKER";
    case HarmonyReactMarkerId::APP_STARTUP_START:
      return "APP_STARTUP_START";
    case HarmonyReactMarkerId::APP_STARTUP_STOP:
      return "APP_STARTUP_STOP";
    case HarmonyReactMarkerId::INIT_REACT_RUNTIME_START:
      return "INIT_REACT_RUNTIME_START";
    case HarmonyReactMarkerId::INIT_REACT_RUNTIME_STOP:
      return "INIT_REACT_RUNTIME_STOP";
    case HarmonyReactMarkerId::NATIVE_REQUIRE_START:
      return "NATIVE_REQUIRE_START";
    case HarmonyReactMarkerId::NATIVE_REQUIRE_STOP:
      return "NATIVE_REQUIRE_STOP";
    case HarmonyReactMarkerId::RUN_JS_BUNDLE_START:
      return "RUN_JS_BUNDLE_START";
    case HarmonyReactMarkerId::RUN_JS_BUNDLE_STOP:
      return "RUN_JS_BUNDLE_STOP";
    case HarmonyReactMarkerId::CREATE_REACT_CONTEXT_START:
      return "CREATE_REACT_CONTEXT_START";
    case HarmonyReactMarkerId::CREATE_REACT_CONTEXT_STOP:
      return "CREATE_REACT_CONTEXT_STOP";
    case HarmonyReactMarkerId::JS_BUNDLE_STRING_CONVERT_START:
      return "JS_BUNDLE_STRING_CONVERT_START";
    case HarmonyReactMarkerId::JS_BUNDLE_STRING_CONVERT_STOP:
      return "JS_BUNDLE_STRING_CONVERT_STOP";
    case HarmonyReactMarkerId::NATIVE_MODULE_SETUP_START:
      return "NATIVE_MODULE_SETUP_START";
    case HarmonyReactMarkerId::NATIVE_MODULE_SETUP_STOP:
      return "NATIVE_MODULE_SETUP_STOP";
    case HarmonyReactMarkerId::REGISTER_JS_SEGMENT_START:
      return "REGISTER_JS_SEGMENT_START";
    case HarmonyReactMarkerId::REGISTER_JS_SEGMENT_STOP:
      return "REGISTER_JS_SEGMENT_STOP";
    case HarmonyReactMarkerId::REACT_INSTANCE_INIT_START:
      return "REACT_INSTANCE_INIT_START";
    case HarmonyReactMarkerId::REACT_INSTANCE_INIT_STOP:
      return "REACT_INSTANCE_INIT_STOP";
    case HarmonyReactMarkerId::CONTENT_APPEARED:
      return "CONTENT_APPEARED";
    case HarmonyReactMarkerId::DOWNLOAD_START:
      return "DOWNLOAD_START";
    case HarmonyReactMarkerId::DOWNLOAD_END:
      return "DOWNLOAD_END";
    case HarmonyReactMarkerId::REACT_BRIDGE_LOADING_START:
      return "REACT_BRIDGE_LOADING_START";
    case HarmonyReactMarkerId::REACT_BRIDGE_LOADING_END:
      return "REACT_BRIDGE_LOADING_END";
    case HarmonyReactMarkerId::ON_HOST_RESUME_START:
      return "ON_HOST_RESUME_START";
    case HarmonyReactMarkerId::ON_HOST_RESUME_END:
      return "ON_HOST_RESUME_END";
    case HarmonyReactMarkerId::ON_HOST_PAUSE_START:
      return "ON_HOST_PAUSE_START";
    case HarmonyReactMarkerId::ON_HOST_PAUSE_END:
      return "ON_HOST_PAUSE_END";
    case HarmonyReactMarkerId::CHANGE_THREAD_PRIORITY:
      return "CHANGE_THREAD_PRIORITY";
    case HarmonyReactMarkerId::INITIALIZE_MODULE_START:
      return "INITIALIZE_MODULE_START";
    case HarmonyReactMarkerId::INITIALIZE_MODULE_END:
      return "INITIALIZE_MODULE_END";
    case HarmonyReactMarkerId::PROCESS_PACKAGES_START:
      return "PROCESS_PACKAGES_START";
    case HarmonyReactMarkerId::PROCESS_PACKAGES_END:
      return "PROCESS_PACKAGES_END";
    case HarmonyReactMarkerId::CREATE_UI_MANAGER_MODULE_START:
      return "CREATE_UI_MANAGER_MODULE_START";
    case HarmonyReactMarkerId::CREATE_UI_MANAGER_MODULE_END:
      return "CREATE_UI_MANAGER_MODULE_END";
    case HarmonyReactMarkerId::CREATE_MODULE_START:
      return "CREATE_MODULE_START";
    case HarmonyReactMarkerId::CREATE_MODULE_END:
      return "CREATE_MODULE_END";
    case HarmonyReactMarkerId::PROCESS_CORE_REACT_PACKAGE_START:
      return "PROCESS_CORE_REACT_PACKAGE_START";
    case HarmonyReactMarkerId::PROCESS_CORE_REACT_PACKAGE_END:
      return "PROCESS_CORE_REACT_PACKAGE_END";
    case HarmonyReactMarkerId::FABRIC_COMMIT_START:
      return "FABRIC_COMMIT_START";
    case HarmonyReactMarkerId::FABRIC_COMMIT_END:
      return "FABRIC_COMMIT_END";
    case HarmonyReactMarkerId::FABRIC_FINISH_TRANSACTION_START:
      return "FABRIC_FINISH_TRANSACTION_START";
    case HarmonyReactMarkerId::FABRIC_FINISH_TRANSACTION_END:
      return "FABRIC_FINISH_TRANSACTION_END";
    case HarmonyReactMarkerId::FABRIC_DIFF_START:
      return "FABRIC_DIFF_START";
    case HarmonyReactMarkerId::FABRIC_DIFF_END:
      return "FABRIC_DIFF_END";
    case HarmonyReactMarkerId::FABRIC_LAYOUT_START:
      return "FABRIC_LAYOUT_START";
    case HarmonyReactMarkerId::FABRIC_LAYOUT_END:
      return "FABRIC_LAYOUT_END";
    case HarmonyReactMarkerId::FABRIC_BATCH_EXECUTION_START:
      return "FABRIC_BATCH_EXECUTION_START";
    case HarmonyReactMarkerId::FABRIC_BATCH_EXECUTION_END:
      return "FABRIC_BATCH_EXECUTION_END";
    case HarmonyReactMarkerId::FABRIC_UPDATE_UI_MAIN_THREAD_START:
      return "FABRIC_UPDATE_UI_MAIN_THREAD_START";
    case HarmonyReactMarkerId::FABRIC_UPDATE_UI_MAIN_THREAD_END:
      return "FABRIC_UPDATE_UI_MAIN_THREAD_END";
    default:
      DLOG(WARNING) << "Unknown HarmonyReactMarkerId "
                    << static_cast<int>(markerId);
      return "UNKNOWN";
  }
}

HarmonyReactMarker::HarmonyReactMarkerId
HarmonyReactMarker::harmonyMarkerIdForString(const std::string& markerId) {
  if (markerId == "CREATE_REACT_CONTEXT_START") {
    return HarmonyReactMarkerId::CREATE_REACT_CONTEXT_START;
  }
  if (markerId == "DOWNLOAD_START") {
    return HarmonyReactMarkerId::DOWNLOAD_START;
  }
  if (markerId == "DOWNLOAD_END") {
    return HarmonyReactMarkerId::DOWNLOAD_END;
  }
  throw std::invalid_argument("Unknown markerId: " + markerId);
}

} // namespace rnoh
