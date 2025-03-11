/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <folly/Function.h>
#include <glog/logging.h>
#include <chrono>
#include <functional>
#include <future>
#include <mutex>
#include <unordered_set>
#include "NativeVsyncHandle.h"

namespace rnoh {
/**
 * @internal
 */
class UITicker {
  using Task = folly::Function<void()>;

 public:
  using Timestamp = std::chrono::
      time_point<std::chrono::steady_clock, std::chrono::nanoseconds>;

  static void onTick(long long _timestamp, void* data) {
    auto self = static_cast<UITicker*>(data);
    self->tick(std::chrono::steady_clock::now());
  }

  UITicker() : m_vsyncHandle("UITicker") {}

  using Shared = std::shared_ptr<UITicker>;

  std::function<void()> subscribe(std::function<void(Timestamp)>&& listener) {
    std::lock_guard lock(listenersMutex);
    auto id = m_nextListenerId;
    m_nextListenerId++;
    auto listenersCount = m_listenerById.size();
    m_listenerById.insert_or_assign(id, std::move(listener));
    if (listenersCount == 0) {
      this->requestNextTick();
    }
    return [id, this]() {
      std::lock_guard lock(listenersMutex);
      this->m_listenerById.erase(id);
    };
  }

  void runTask(Task&& task) {
    auto lock = std::lock_guard(m_taskMtx);
    m_tasks.push_back(std::move(task));
    if (m_tasks.size() == 0) {
      requestNextTick();
    }
  }

 private:
  std::mutex m_taskMtx;
  std::vector<Task> m_tasks;
  std::unordered_map<int, std::function<void(Timestamp)>> m_listenerById;
  std::mutex listenersMutex;
  NativeVsyncHandle m_vsyncHandle;
  int m_nextListenerId = 0;

  void requestNextTick() {
    m_vsyncHandle.requestFrame(onTick, this);
  }

  void tick(Timestamp timestamp) {
    {
      auto lock = std::lock_guard(m_taskMtx);
      for (auto& task : m_tasks) {
        task();
      }
      m_tasks.clear();
    }

    decltype(m_listenerById) listenerById;
    {
      std::lock_guard lock(listenersMutex);
      if (m_listenerById.empty()) {
        return;
      }
      /**
       * TODO: Eliminate copy by value
       * https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/1478
       *
       * This change was introduced in the RN 0.77 update. As of this comment,
       * rnoh::EventBeat unsubscribes UITicker in a listener, causing a deadlock
       * if listenersMutex is locked during listener execution.
       */
      listenerById = m_listenerById;
    }
    for (const auto& idAndListener : listenerById) {
      idAndListener.second(timestamp);
    }
    this->requestNextTick();
  }
};

} // namespace rnoh