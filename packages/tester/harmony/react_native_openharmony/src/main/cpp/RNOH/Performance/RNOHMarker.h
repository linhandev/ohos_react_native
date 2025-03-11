/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

class RNOHMarker {
 public:
  enum class RNOHMarkerId {
    UNKNOWN_REACT_MARKER,
    APP_STARTUP_START,
    APP_STARTUP_STOP,
    INIT_REACT_RUNTIME_START,
    INIT_REACT_RUNTIME_STOP,
    NATIVE_REQUIRE_START,
    NATIVE_REQUIRE_STOP,
    RUN_JS_BUNDLE_START,
    RUN_JS_BUNDLE_STOP,
    CREATE_REACT_CONTEXT_START,
    CREATE_REACT_CONTEXT_STOP,
    JS_BUNDLE_STRING_CONVERT_START,
    JS_BUNDLE_STRING_CONVERT_STOP,
    NATIVE_MODULE_SETUP_START,
    NATIVE_MODULE_SETUP_STOP,
    REGISTER_JS_SEGMENT_START,
    REGISTER_JS_SEGMENT_STOP,
    REACT_INSTANCE_INIT_START,
    REACT_INSTANCE_INIT_STOP,
    CONTENT_APPEARED,
    DOWNLOAD_START,
    DOWNLOAD_END,
    REACT_BRIDGE_LOADING_START,
    REACT_BRIDGE_LOADING_END,
    ON_HOST_RESUME_START,
    ON_HOST_RESUME_END,
    ON_HOST_PAUSE_START,
    ON_HOST_PAUSE_END,
    CHANGE_THREAD_PRIORITY,
    INITIALIZE_MODULE_START,
    INITIALIZE_MODULE_END,
    PROCESS_PACKAGES_START,
    PROCESS_PACKAGES_END,
    CREATE_UI_MANAGER_MODULE_START,
    CREATE_UI_MANAGER_MODULE_END,
    CREATE_MODULE_START,
    CREATE_MODULE_END,
    PROCESS_CORE_REACT_PACKAGE_START,
    PROCESS_CORE_REACT_PACKAGE_END,
    // Fabric-specific constants below this line
    FABRIC_COMMIT_START,
    FABRIC_COMMIT_END,
    FABRIC_FINISH_TRANSACTION_START,
    FABRIC_FINISH_TRANSACTION_END,
    FABRIC_DIFF_START,
    FABRIC_DIFF_END,
    FABRIC_LAYOUT_START,
    FABRIC_LAYOUT_END,
    FABRIC_BATCH_EXECUTION_START,
    FABRIC_BATCH_EXECUTION_END,
    FABRIC_UPDATE_UI_MAIN_THREAD_START,
    FABRIC_UPDATE_UI_MAIN_THREAD_END
  };

  class RNOHMarkerListener {
   public:
    using Unique = std::unique_ptr<RNOHMarkerListener>;

    virtual void logMarker(
        RNOHMarkerId markerId,
        const std::string& tag,
        double timestamp) = 0;

    RNOHMarkerListener(bool autoRegister = true) {
      if (autoRegister) {
        RNOHMarker::addListener(this);
      }
    }

    ~RNOHMarkerListener() {
      RNOHMarker::removeListener(this);
    }
  };

  static std::vector<RNOHMarkerListener*> listeners;

  static void addListener(RNOHMarkerListener* listener);
  static void removeListener(RNOHMarkerListener* listener);
  static void setLogMarkerIfNeeded();
  static void logMarker(RNOHMarkerId);
  static void logMarker(RNOHMarkerId, const char* tag);
  static void logMarker(const RNOHMarkerId markerId, facebook::react::Tag tag);
  static void logMarker(const std::string& markerId, const char* tag);
  static void logMarker(ReactMarker::ReactMarkerId, const char* tag);
  static void logMarker(RNOHMarkerId, const char* tag, double timestamp);
  static void setAppStartTime(double startTime);
  static std::string harmonyMarkerIdToString(const RNOHMarkerId markerId);

 private:
  static inline double sAppStartTime = 0.0;
  static double getAppStartTime();
  static RNOHMarkerId harmonyMarkerIdForReactMarkerId(
      const ReactMarker::ReactMarkerId markerId);
  static RNOHMarkerId harmonyMarkerIdForString(const std::string& markerId);
};

} // namespace rnoh
