/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "TransformAnimatedNode.h"

namespace rnoh {

using namespace facebook;

using Transform = react::Transform;

static Transform applyTransformOperation(
    Transform const& transform,
    std::string const& property,
    double value) {
  Transform operation;
  if (property == "translateX") {
    operation = Transform::Translate(value, 0, 0);
  } else if (property == "translateY") {
    operation = Transform::Translate(0, value, 0);
  } else if (property == "scale") {
    operation = Transform::Scale(value, value, 1);
  } else if (property == "scaleX") {
    operation = Transform::Scale(value, 1, 1);
  } else if (property == "scaleY") {
    operation = Transform::Scale(1, value, 1);
  } else if (property == "rotate") {
    operation = Transform::Rotate(0, 0, value);
  } else if (property == "rotateX") {
    operation = Transform::Rotate(value, 0, 0);
  } else if (property == "rotateY") {
    operation = Transform::Rotate(0, value, 0);
  } else if (property == "rotateZ") {
    operation = Transform::Rotate(0, 0, value);
  } else if (property == "perspective") {
    operation = Transform::Perspective(value);
  } else {
    throw std::runtime_error(
        "Unsupported animated transform property " + property);
  }

  return transform * operation;
}

static folly::dynamic transformToDynamic(Transform const& transform) {
  auto const& matrix = transform.matrix;
  return folly::dynamic::array(
      matrix[0],
      matrix[1],
      matrix[2],
      matrix[3],
      matrix[4],
      matrix[5],
      matrix[6],
      matrix[7],
      matrix[8],
      matrix[9],
      matrix[10],
      matrix[11],
      matrix[12],
      matrix[13],
      matrix[14],
      matrix[15]);
}

TransformAnimatedNode::TransformAnimatedNode(
    folly::dynamic const& config,
    AnimatedNodesManager& nodesManager)
    : m_nodesManager(nodesManager) {
  const auto& transforms = config["transforms"];
  for (const auto& transformConfig : transforms) {
    std::string property = transformConfig["property"].getString();
    const std::string& type = transformConfig["type"].getString();
    if (type == "animated") {
      m_transforms.push_back(AnimatedTransformConfig{
          .property = std::move(property),
          .nodeTag =
              static_cast<NodeTag>(transformConfig["nodeTag"].getDouble())});
    } else {
      m_transforms.push_back(StaticTransformConfig{
          .property = std::move(property),
          .value = transformConfig["value"].getDouble()});
    }
  }
}

folly::dynamic TransformAnimatedNode::getTransform() const {
  Transform transform;
  for (auto config : m_transforms) {
    double value;
    std::string property;
    if (std::holds_alternative<StaticTransformConfig>(config)) {
      const auto& staticConfig = std::get<StaticTransformConfig>(config);
      value = staticConfig.value;
      property = staticConfig.property;
    } else {
      const auto& animatedConfig = std::get<AnimatedTransformConfig>(config);
      auto& node = m_nodesManager.getValueNodeByTag(animatedConfig.nodeTag);
      value = node.getOutputAsDouble();
      property = animatedConfig.property;
      if (property == "translateX" || property == "translateY") {
        bool isAxisX = (property == "translateX");
        float scaleRatioDpi = m_nodesManager.getScaleRatioDpi(isAxisX);
        node.recalculateMinAcceptableFrameRate(scaleRatioDpi);
      }
    }

    transform = applyTransformOperation(transform, property, value);
  }
  return folly::dynamic::array(
      folly::dynamic::object("matrix", transformToDynamic(transform)));
}

} // namespace rnoh