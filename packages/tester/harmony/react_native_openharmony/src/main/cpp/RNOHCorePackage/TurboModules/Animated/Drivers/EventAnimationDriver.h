/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "RNOHCorePackage/TurboModules/Animated/Nodes/ValueAnimatedNode.h"

namespace rnoh {

class AnimatedNodesManager;

class EventAnimationDriver {
 public:
  // a list of property names of the event payload (sub)objects
  // to traverse to get to the value
  using EventPath = std::vector<std::string>;

  EventAnimationDriver(
      std::string const& eventName,
      facebook::react::Tag viewTag,
      EventPath&& eventPath,
      facebook::react::Tag nodeTag,
      AnimatedNodesManager& nodesManager);

  void updateWithEvent(folly::dynamic const& event);

  ValueAnimatedNode& getValueNode() const;

  std::string const& getEventName() const {
    return m_eventName;
  }

  facebook::react::Tag getViewTag() const {
    return m_viewTag;
  }

  facebook::react::Tag getNodeTag() const {
    return m_nodeTag;
  }

 private:
  std::string m_eventName;
  facebook::react::Tag m_viewTag;
  EventPath m_eventPath;
  facebook::react::Tag m_nodeTag;
  AnimatedNodesManager& m_nodesManager;
};

} // namespace rnoh
