#pragma once
#include <functional>
#include <mutex>
#include <string>

#include <cxxreact/JSExecutor.h>
#include <cxxreact/ReactMarker.h>
#include <react/renderer/core/ReactPrimitives.h>
#include "hitrace/trace.h"

using namespace facebook::react;

namespace rnoh {

class HarmonyReactMarker {
 public:
  enum class HarmonyReactMarkerId {
    NATIVE_REQUIRE_START,
    NATIVE_REQUIRE_STOP,
    RUN_JS_BUNDLE_START,
    RUN_JS_BUNDLE_STOP,
    CREATE_REACT_CONTEXT_STOP,
    JS_BUNDLE_STRING_CONVERT_START,
    JS_BUNDLE_STRING_CONVERT_STOP,
    NATIVE_MODULE_SETUP_START,
    NATIVE_MODULE_SETUP_STOP,
    REGISTER_JS_SEGMENT_START,
    REGISTER_JS_SEGMENT_STOP,
    REACT_INSTANCE_INIT_START,
    REACT_INSTANCE_INIT_STOP
  };

  class HarmonyReactMarkerListener {
   public:
    virtual void logMarker(
        const HarmonyReactMarkerId markerId,
        const char* tag,
        const double timestamp) = 0;
  };

  static std::vector<HarmonyReactMarkerListener*> listeners;

  static void addListener(HarmonyReactMarkerListener& listener);
  static void removeListener(HarmonyReactMarkerListener& listener);
  static void setLogMarkerIfNeeded();
  static void logMarker(const HarmonyReactMarkerId);
  static void logMarker(const HarmonyReactMarkerId, const char* tag);
  static void logMarker(
      const HarmonyReactMarkerId markerId,
      facebook::react::Tag tag);
  static void logMarker(const ReactMarker::ReactMarkerId, const char* tag);
  static void logMarker(
      const HarmonyReactMarkerId,
      const char* tag,
      const double timestamp);
  static void setAppStartTime(double startTime);

 private:
  static inline double sAppStartTime = 0.0;
  static double getAppStartTime();
  static HarmonyReactMarkerId harmonyMarkerIdForReactMarkerId(
      const ReactMarker::ReactMarkerId markerId);
};

} // namespace rnoh
