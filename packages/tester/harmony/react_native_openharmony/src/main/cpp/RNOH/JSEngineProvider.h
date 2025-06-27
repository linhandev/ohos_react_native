/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <react/config/ReactNativeConfig.h>
#include <react/runtime/JSRuntimeFactory.h>

using namespace facebook::react;

namespace rnoh {

template <typename InstanceT>
class JSEngineProvider : public JSRuntimeFactory {
 public:
#if USE_HERMES
  JSEngineProvider(std::shared_ptr<const facebook::react::ReactNativeConfig>
                       reactNativeConfig)
      : m_reactNativeConfig(std::move(reactNativeConfig)),
        m_instance(std::make_unique<InstanceT>()){};
#else
  JSEngineProvider(
      std::shared_ptr<const facebook::react::ReactNativeConfig>
          reactNativeConfig,
      folly::dynamic initOptions)
      : m_reactNativeConfig(std::move(reactNativeConfig)),
        m_instance(std::make_unique<InstanceT>()),
        m_initOptions(initOptions){};
#endif

  std::unique_ptr<facebook::react::JSRuntime> createJSRuntime(
      std::shared_ptr<facebook::react::MessageQueueThread>
          msgQueueThread) noexcept override {
#if USE_HERMES
    return m_instance->createJSRuntime(
        m_reactNativeConfig, nullptr, msgQueueThread, false);
#else
    return m_instance->createJSRuntime(
        m_reactNativeConfig, nullptr, msgQueueThread, false, m_initOptions);
#endif
  };

  ~JSEngineProvider(){};

 private:
  std::shared_ptr<const facebook::react::ReactNativeConfig> m_reactNativeConfig;
  std::unique_ptr<InstanceT> m_instance;
#if defined(USE_HERMES) && !USE_HERMES
  folly::dynamic m_initOptions;
#endif
};
} // namespace rnoh
