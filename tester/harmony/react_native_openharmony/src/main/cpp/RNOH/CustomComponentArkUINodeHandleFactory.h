/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <arkui/native_node.h>
#include <arkui/native_node_napi.h>
#include <arkui/native_type.h>
#include <glog/logging.h>
#include <react/renderer/core/ReactPrimitives.h>
#include "RNOH/ArkJS.h"
#include "RNOH/ThreadGuard.h"
#include "RNOH/arkui/NodeContentHandle.h"

namespace rnoh {

struct CustomComponentArkUINodeHandle {
  ArkUI_NodeHandle nodeHandle;
  NodeContentHandle nodeContent;
  folly::Function<void()> deleter;
};

/**
 * @thread: MAIN
 * Used by the ComponentRegistry to create ComponentInstances written in ArkTS.
 */
class CustomComponentArkUINodeHandleFactory final {
 public:
  using Shared = std::shared_ptr<CustomComponentArkUINodeHandleFactory>;

  CustomComponentArkUINodeHandleFactory(
      napi_env env,
      NapiRef customRNComponentFrameNodeFactoryRef)
      : m_env(env),
        m_customRNComponentFrameNodeFactoryRef(
            std::move(customRNComponentFrameNodeFactoryRef)) {}

  ~CustomComponentArkUINodeHandleFactory() {
    m_threadGuard.assertThread();
    DLOG(INFO) << "~CustomComponentArkUINodeHandleFactory";
  }

  std::optional<CustomComponentArkUINodeHandle> create(
      facebook::react::Tag tag,
      std::string componentName) {
    m_threadGuard.assertThread();
    ArkJS arkJS(m_env);
    auto frameNodeFactory =
        arkJS.getObject(m_customRNComponentFrameNodeFactoryRef)
            .getProperty("frameNodeFactory");
    auto n_result =
        arkJS.getObject(frameNodeFactory)
            .call(
                "create",
                {arkJS.createInt(tag), arkJS.createString(componentName)});
    auto n_arkTSNodeHandle = arkJS.getObjectProperty(n_result, "frameNode");
    auto n_disposeCallback = arkJS.getObjectProperty(n_result, "dispose");
    auto n_disposeRef = arkJS.createNapiRef(n_disposeCallback);
    ArkUI_NodeHandle arkTSNodeHandle = nullptr;
    auto errorCode = OH_ArkUI_GetNodeHandleFromNapiValue(
        m_env, n_arkTSNodeHandle, &arkTSNodeHandle);
    if (errorCode != 0) {
      LOG(ERROR) << "Couldn't get node handle. Error code: " << errorCode;
      return std::nullopt;
    }
    auto n_nodeContent = arkJS.getObjectProperty(n_result, "nodeContent");
    auto contentHandle = NodeContentHandle::fromNapiValue(m_env, n_nodeContent);
    return CustomComponentArkUINodeHandle{
        arkTSNodeHandle,
        contentHandle,
        [env = m_env, disposeRef = std::move(n_disposeRef)] {
          ArkJS arkJS(env);
          auto disposeCallback = arkJS.getReferenceValue(disposeRef);
          arkJS.call(disposeCallback, {});
        }};
  }

 private:
  napi_env m_env;
  NapiRef m_customRNComponentFrameNodeFactoryRef;
  ThreadGuard m_threadGuard{};
};
} // namespace rnoh
