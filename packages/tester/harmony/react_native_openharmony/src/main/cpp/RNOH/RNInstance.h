/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/TouchTarget.h"
#include "RNOH/TurboModule.h"
#include "RNOH/arkui/UIInputEventHandler.h"

namespace rnoh {
using MutationsListener = std::function<void(
    MutationsToNapiConverter const&,
    facebook::react::ShadowViewMutationList const& mutations)>;

/**
 * @api
 * @thread: MAIN
 */
class Surface {
 public:
  /**
   * @api
   */
  struct LayoutContext {
    /**
     * @internal
     */
    static LayoutContext from(facebook::react::LayoutContext layoutContext) {
      return {.viewportOffset = layoutContext.viewportOffset};
    }

    facebook::react::Point viewportOffset{};
  };

  using Weak = std::weak_ptr<Surface>;

  virtual LayoutContext getLayoutContext() = 0;
  virtual std::weak_ptr<UIInputEventHandler> getUIInputEventHandler() = 0;
};

/**
 * @api
 * @thread: MAIN
 */
class RNInstance {
  using ContextContainer = facebook::react::ContextContainer;

 public:
  using Weak = std::weak_ptr<RNInstance>;

  virtual ~RNInstance();

  virtual int getId() = 0;
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
  virtual void callJSFunction(
      std::string module,
      std::string method,
      folly::dynamic params) = 0;
  virtual std::optional<Surface::Weak> getSurfaceByRootTag(
      facebook::react::Tag rootTag) = 0;
  virtual std::string getBundlePath() const = 0;
};

} // namespace rnoh
