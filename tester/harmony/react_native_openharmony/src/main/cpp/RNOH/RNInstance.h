#pragma once
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <rawfile/raw_file_manager.h>
#include <atomic>
#include <functional>
#include <memory>
#include <thread>

#include <cxxreact/Instance.h>
#include <cxxreact/ModuleRegistry.h>
#include <cxxreact/NativeModule.h>
#include <folly/dynamic.h>
#include <react/renderer/animations/LayoutAnimationDriver.h>
#include <react/renderer/scheduler/Scheduler.h>

#include "RNOH/ArkTSChannel.h"
#include "RNOH/EventEmitRequestHandler.h"
#include "RNOH/GlobalJSIBinder.h"
#include "RNOH/MessageQueueThread.h"
#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "RNOH/TurboModule.h"
#include "RNOH/TurboModuleProvider.h"
#include "RNOH/UITicker.h"

namespace rnoh {
using MutationsListener = std::function<void(
    MutationsToNapiConverter const&,
    facebook::react::ShadowViewMutationList const& mutations)>;

class RNInstance {
  using ContextContainer = facebook::react::ContextContainer;

 public:
  using Weak = std::weak_ptr<RNInstance>;

  virtual ~RNInstance() = default;

  virtual ContextContainer const& getContextContainer() const = 0;
  virtual TurboModule::Shared getTurboModule(const std::string& name) = 0;
  template <typename T>
  std::shared_ptr<T> getTurboModule(const std::string& name) {
    auto turboModule = getTurboModule(name);
    return std::dynamic_pointer_cast<T>(turboModule);
  }
  virtual NativeResourceManager const* getNativeResourceManager() const = 0;
  virtual void synchronouslyUpdateViewOnUIThread(
      facebook::react::Tag tag,
      folly::dynamic props) = 0;
  virtual void postMessageToArkTS(
      const std::string& name,
      folly::dynamic const& payload) = 0;
};

} // namespace rnoh
