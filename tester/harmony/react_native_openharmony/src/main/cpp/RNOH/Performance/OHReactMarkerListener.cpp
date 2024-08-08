#include "OHReactMarkerListener.h"

namespace rnoh {

OHReactMarkerListener& OHReactMarkerListener::getInstance() {
  static OHReactMarkerListener l;
  return l;
}

void OHReactMarkerListener::logMarker(
    const HarmonyReactMarkerId markerId,
    const char* tag,
    const double timestamp) {
  switch (markerId) {
    case HarmonyReactMarkerId::RUN_JS_BUNDLE_START:
      logMarkerStart("RUN_JS_BUNDLE", tag);
      break;
    case HarmonyReactMarkerId::RUN_JS_BUNDLE_STOP:
      logMarkerFinish("RUN_JS_BUNDLE", tag);
      break;
    case HarmonyReactMarkerId::CREATE_REACT_CONTEXT_STOP:
      logMarker("CREATE_REACT_CONTEXT_END", "");
      break;
    case HarmonyReactMarkerId::JS_BUNDLE_STRING_CONVERT_START:
      logMarkerStart("loadApplicationScript_StringConvert", "");
      break;
    case HarmonyReactMarkerId::JS_BUNDLE_STRING_CONVERT_STOP:
      logMarkerFinish("loadApplicationScript_StringConvert", "");
      break;
    case HarmonyReactMarkerId::NATIVE_MODULE_SETUP_START:
      logMarkerStart("NATIVE_MODULE_SETUP", tag);
      break;
    case HarmonyReactMarkerId::NATIVE_MODULE_SETUP_STOP:
      logMarkerFinish("NATIVE_MODULE_SETUP", tag);
      break;
    case HarmonyReactMarkerId::REGISTER_JS_SEGMENT_START:
      logMarkerStart("REGISTER_JS_SEGMENT", tag);
      break;
    case HarmonyReactMarkerId::REGISTER_JS_SEGMENT_STOP:
      logMarkerFinish("REGISTER_JS_SEGMENT", tag);
      break;
    case HarmonyReactMarkerId::CONTENT_APPEARED:
      logMarker("CONTENT_APPEARED", tag);
      break;
    case HarmonyReactMarkerId::FABRIC_COMMIT_START:
      logMarkerStart("FABRIC_COMMIT", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_COMMIT_END:
      logMarkerFinish("FABRIC_COMMIT", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_FINISH_TRANSACTION_START:
      logMarkerStart("FABRIC_FINISH_TRANSACTION", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_FINISH_TRANSACTION_END:
      logMarkerFinish("FABRIC_FINISH_TRANSACTION", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_DIFF_START:
      logMarkerStart("FABRIC_DIFF", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_DIFF_END:
      logMarkerFinish("FABRIC_DIFF", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_LAYOUT_START:
      logMarkerStart("FABRIC_LAYOUT", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_LAYOUT_END:
      logMarkerFinish("FABRIC_LAYOUT", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_BATCH_EXECUTION_START:
      logMarkerStart("FABRIC_BATCH_EXECUTION", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_BATCH_EXECUTION_END:
      logMarkerFinish("FABRIC_BATCH_EXECUTION", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_UPDATE_UI_MAIN_THREAD_START:
      logMarkerStart("FABRIC_UPDATE_UI_MAIN_THREAD", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::FABRIC_UPDATE_UI_MAIN_THREAD_END:
      logMarkerFinish(
          "FABRIC_UPDATE_UI_MAIN_THREAD", std::to_string(timestamp));
      break;
    case HarmonyReactMarkerId::NATIVE_REQUIRE_START:
    case HarmonyReactMarkerId::NATIVE_REQUIRE_STOP:
    case HarmonyReactMarkerId::REACT_INSTANCE_INIT_START:
    case HarmonyReactMarkerId::REACT_INSTANCE_INIT_STOP:
      break;
  }
}

void OHReactMarkerListener::logMarker(
    const std::string& marker,
    const std::string& tag) {
  auto message = makeMessage(marker, tag);
  OH_HiTrace_StartTrace(message.c_str());
  OH_HiTrace_FinishTrace();
}

void OHReactMarkerListener::logMarkerStart(
    const std::string& marker,
    const std::string& tag) {
  auto message = makeMessage(marker, tag);
  OH_HiTrace_StartAsyncTrace(message.c_str(), getMessageId(message.c_str()));
}

void OHReactMarkerListener::logMarkerFinish(
    const std::string& marker,
    const std::string& tag) {
  auto message = makeMessage(marker, tag);
  OH_HiTrace_FinishAsyncTrace(message.c_str(), getMessageId(message.c_str()));
}

std::string OHReactMarkerListener::makeMessage(
    const std::string& marker,
    const std::string& tag) {
  std::string message = "ReactMarker::" + marker;
  if (!tag.empty()) {
    message += "::Tag::";
    message += tag;
  }
  return message;
};

int32_t OHReactMarkerListener::getMessageId(const std::string& message) {
  std::hash<std::string> hasher;
  size_t hash = hasher(message);
  // Ensure the hash fits into int32_t. We don't care that much about collisions
  int32_t small_hash = hash ^ (hash >> 32);
  return small_hash;
};

} // namespace rnoh