/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Used only in C-API based Architecture.
 */
#pragma once
#include <arkui/native_type.h>
#include <cxxreact/SystraceSection.h>
#include <react/renderer/components/view/TouchEventEmitter.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/EventEmitter.h>
#include <react/renderer/core/LayoutMetrics.h>
#include <react/renderer/core/Props.h>
#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/core/State.h>
#include <vector>
#include "RNOH/Assert.h"
#include "RNOH/ComponentInstance.h"

namespace rnoh {

inline facebook::react::Rect transformRectAroundPoint(
    const facebook::react::Rect& rect,
    const facebook::react::Point& point,
    const facebook::react::Transform& transform);

/**
 * @api
 */
template <typename ShadowNodeT>
class CppComponentInstance : public ComponentInstance,
                             public ArkUINodeDelegate {
  static_assert(
      std::is_base_of_v<facebook::react::ShadowNode, ShadowNodeT>,
      "ShadowNodeT must be a subclass of facebook::react::ShadowNode");

 protected:
  using ConcreteProps = typename ShadowNodeT::ConcreteProps;
  using ConcreteState = typename ShadowNodeT::ConcreteState;
  using ConcreteEventEmitter = typename ShadowNodeT::ConcreteEventEmitter;
  using SharedConcreteProps = std::shared_ptr<const ConcreteProps>;
  using SharedConcreteState = std::shared_ptr<const ConcreteState>;
  using SharedConcreteEventEmitter =
      std::shared_ptr<const ConcreteEventEmitter>;

 public:
  using Shared = std::shared_ptr<CppComponentInstance>;

  CppComponentInstance(Context context)
      : ComponentInstance(std::move(context)) {}

  void onCreate() override {
    try {
      this->getLocalRootArkUINode().setArkUINodeDelegate(this);
    } catch (NoArkUINodeError&) {
      // NOOP
    }
  }

  facebook::react::Tag getTag() const {
    return m_tag;
  }

  std::string getCompId() override {
    return this->getIdFromProps(m_props);
  }

  facebook::react::Props::Shared getProps() const override {
    return m_props;
  }

  SharedConcreteState const& getState() const {
    return m_state;
  }

  SharedConcreteEventEmitter const& getEventEmitter() const {
    return m_eventEmitter;
  }

  const std::string& getAccessibilityLabel() const override {
    return m_accessibilityLabel;
  }

  bool getAccessibilityGroup() const override {
    return m_accessibilityGroup;
  }

  /**
   * TODO: change to private — those methods are intended to be called
   * only by MountingManagerCAPI which is a friend of this class
   * (latestRNOHVersion: 0.72.27)
   */
 public:
  void setProps(facebook::react::Props::Shared props) final {
    auto newProps = std::dynamic_pointer_cast<const ConcreteProps>(props);
    if (!newProps || m_props == newProps) {
      return;
    }
    this->onPropsChanged(newProps);
    m_props = newProps;
  }

  void setState(facebook::react::State::Shared state) final {
    auto newState = std::dynamic_pointer_cast<const ConcreteState>(state);
    if (!newState || m_state == newState) {
      return;
    }

    this->onStateChanged(newState);
    m_state = newState;
  }

  void setEventEmitter(facebook::react::SharedEventEmitter eventEmitter) final {
    auto newEventEmitter =
        std::dynamic_pointer_cast<const ConcreteEventEmitter>(eventEmitter);
    if (!newEventEmitter || m_eventEmitter == newEventEmitter) {
      return;
    }
    this->onEventEmitterChanged(newEventEmitter);
    m_eventEmitter = newEventEmitter;
  }

  void setLayout(facebook::react::LayoutMetrics layoutMetrics) override {
    if (layoutMetrics == m_layoutMetrics) {
      return;
    }
    this->onLayoutChanged(layoutMetrics);
    m_layoutMetrics = layoutMetrics;
  }

 public:
  // TouchTarget implementation
  facebook::react::LayoutMetrics getLayoutMetrics() const override {
    return m_layoutMetrics;
  }

  bool containsPoint(facebook::react::Point const& point) const override {
    auto hitRect = getHitRect();
    return hitRect.containsPoint(point);
  }

  bool containsPointInBoundingBox(
      facebook::react::Point const& point) override {
    auto boundingBox = this->getBoundingBox();
    return boundingBox.containsPoint(point);
  }

  bool canHandleTouch() const override {
    auto parent = m_parent.lock();
    if (parent && !parent->canChildrenHandleTouch()) {
      return false;
    }
    if (m_props != nullptr) {
      auto props =
          std::dynamic_pointer_cast<const facebook::react::ViewProps>(m_props);
      return props->pointerEvents == facebook::react::PointerEventsMode::Auto ||
          props->pointerEvents == facebook::react::PointerEventsMode::BoxOnly;
    }
    return true;
  };

  bool canChildrenHandleTouch() const override {
    auto parent = m_parent.lock();
    if (parent && !parent->canChildrenHandleTouch()) {
      return false;
    }
    if (m_props != nullptr) {
      auto props =
          std::dynamic_pointer_cast<const facebook::react::ViewProps>(m_props);
      return props->pointerEvents == facebook::react::PointerEventsMode::Auto ||
          props->pointerEvents == facebook::react::PointerEventsMode::BoxNone;
    }
    return true;
  };

  bool canSubtreeHandleTouch(facebook::react::Point const& point) override {
    auto children = getTouchTargetChildren();
    for (auto const& child : children) {
      if (child == nullptr) {
        RNOH_ASSERT(child != nullptr);
        continue;
      }

      auto childPoint = computeChildPoint(point, child);
      if (child->canHandleTouch() && child->containsPoint(childPoint) &&
          child->getTouchEventEmitter()) {
        return true;
      }

      if (child->canChildrenHandleTouch() &&
          child->containsPointInBoundingBox(childPoint)) {
        if (child->canSubtreeHandleTouch(childPoint)) {
          return true;
        }
      }
    }
    return false;
  };

  facebook::react::Tag getTouchTargetTag() const override {
    return getTag();
  }

  TouchTarget::Shared getTouchTargetParent() const override {
    return getParent().lock();
  }

  facebook::react::SharedTouchEventEmitter getTouchEventEmitter()
      const override {
    return m_eventEmitter;
  }

  std::vector<TouchTarget::Shared> getTouchTargetChildren() override {
    auto children = getChildren();
    return std::vector<TouchTarget::Shared>(children.begin(), children.end());
  }

  facebook::react::Transform getTransform() const override {
    return m_transform;
  }

  facebook::react::Rect getBoundingBox() override {
    if (!m_boundingBox.has_value()) {
      calculateBoundingBox();
    }
    return m_boundingBox.value();
  };

  bool isClippingSubviews() const override {
    return m_isClipping;
  }

  void markBoundingBoxAsDirty() override {
    if (m_boundingBox.has_value()) {
      m_boundingBox.reset();
      auto parent = getTouchTargetParent();
      while (parent != nullptr && !parent->isClippingSubviews()) {
        parent->markBoundingBoxAsDirty();
        parent = parent->getTouchTargetParent();
      }
    }
  };

 protected:
  virtual void onLayoutChanged(
      facebook::react::LayoutMetrics const& layoutMetrics) {
    auto maybeLocalRoot = maybeGetLocalRoot();
    if (!maybeLocalRoot) {
      return;
    }
    auto& localRoot = *maybeLocalRoot;
    localRoot.setLayoutRect(
        layoutMetrics.frame.origin,
        layoutMetrics.frame.size,
        layoutMetrics.pointScaleFactor);
    auto transform = m_props->resolveTransform(layoutMetrics);
    if (transform != m_transform) {
      m_transform = transform;
      localRoot.setTransform(m_transform, layoutMetrics.pointScaleFactor);
    }
    if (layoutMetrics.pointScaleFactor != m_layoutMetrics.pointScaleFactor) {
      auto props =
          std::static_pointer_cast<const facebook::react::ViewProps>(m_props);
      localRoot.setShadow(
          props->shadowColor,
          props->shadowOffset,
          props->shadowOpacity,
          props->shadowRadius,
          layoutMetrics.pointScaleFactor);
    }
    if (layoutMetrics.layoutDirection != m_layoutMetrics.layoutDirection) {
      ArkUI_Direction direction =
          convertLayoutDirection(layoutMetrics.layoutDirection);
      localRoot.setDirection(direction);
    }
    markBoundingBoxAsDirty();
  }

  virtual void onPropsChanged(SharedConcreteProps const& concreteProps) {
    facebook::react::SystraceSection s(std::string(
                                           "#RNOH::CppComponentInstance(" +
                                           this->getComponentName() +
                                           ")::onPropsChanged")
                                           .c_str());
    auto maybeLocalRoot = maybeGetLocalRoot();
    if (!maybeLocalRoot) {
      return;
    }
    auto& localRoot = *maybeLocalRoot;

    auto props = std::static_pointer_cast<const facebook::react::ViewProps>(
        concreteProps);
    auto old =
        std::static_pointer_cast<const facebook::react::ViewProps>(m_props);
    RNOH_ASSERT(old != nullptr);
    auto isTransformManagedByAnimated =
        getIgnoredPropKeys().count("transform") > 0;
    if (*(props->backgroundColor) != *(old->backgroundColor)) {
      localRoot.setBackgroundColor(props->backgroundColor);
    }

    if (props->accessibilityState != old->accessibilityState) {
      localRoot.setAccessibilityState(props->accessibilityState);
    }

    if (props->shadowColor != old->shadowColor ||
        props->shadowOffset != old->shadowOffset ||
        props->shadowOpacity != old->shadowOpacity ||
        props->shadowRadius != old->shadowRadius) {
      localRoot.setShadow(
          props->shadowColor,
          props->shadowOffset,
          props->shadowOpacity,
          props->shadowRadius,
          m_layoutMetrics.pointScaleFactor);
    }

    if (props->accessibilityActions != old->accessibilityActions) {
      localRoot.setAccessibilityActions(props->accessibilityActions);
    }

    if (!isTransformManagedByAnimated) {
      /**
       * NOTE: resolveTransform returns identity when layoutMetrics width or
       * height is 0, which happens during the preallocation phase.
       */
      auto transform = props->resolveTransform(m_layoutMetrics);
      if (transform != m_transform ||
          abs(m_oldPointScaleFactor - m_layoutMetrics.pointScaleFactor) >
              0.001f) {
        m_oldPointScaleFactor = m_layoutMetrics.pointScaleFactor;
        m_transform = transform;
        this->getLocalRootArkUINode().setTransform(
            transform, m_layoutMetrics.pointScaleFactor);
        markBoundingBoxAsDirty();
      }
    }

    if (props->accessibilityRole != old->accessibilityHint) {
      localRoot.setAccessibilityRole(props->accessibilityRole);
    }

    if (props->accessibilityHint != old->accessibilityHint) {
      localRoot.setAccessibilityDescription(props->accessibilityHint);
    }

    if (props->accessibilityLabel != old->accessibilityLabel) {
      localRoot.setAccessibilityText(props->accessibilityLabel);
    }

    if (props->accessible != old->accessible) {
      localRoot.setAccessibilityGroup(props->accessible);
      m_accessibilityGroup = props->accessible;
    }

    if (props->importantForAccessibility != old->importantForAccessibility) {
      localRoot.setAccessibilityMode(props->importantForAccessibility);
    }

    this->setOpacity(props);

    auto newOverflow = props->getClipsContentToBounds();
    if ((old->getClipsContentToBounds() != newOverflow)) {
      m_isClipping = newOverflow;
      localRoot.setClip(newOverflow);
      markBoundingBoxAsDirty();
    }

    auto rawProps = ViewRawProps::getFromDynamic(props->rawProps);
    if (m_rawProps.needsOffscreenAlphaCompositing !=
        rawProps.needsOffscreenAlphaCompositing) {
      m_rawProps.needsOffscreenAlphaCompositing =
          rawProps.needsOffscreenAlphaCompositing;
      localRoot.setRenderGroup(m_rawProps.needsOffscreenAlphaCompositing);
    }

    localRoot.setId(getIdFromProps(props));
  };

  virtual void onStateChanged(SharedConcreteState const& /*state*/) {
    facebook::react::SystraceSection s(std::string(
                                           "#RNOH::CppComponentInstance(" +
                                           this->getComponentName() +
                                           ")::onStateChanged")
                                           .c_str());
  };

  virtual void onEventEmitterChanged(
      SharedConcreteEventEmitter const& /*eventEmitter*/){};

  void calculateBoundingBox() {
    facebook::react::SystraceSection s(std::string(
                                           "#RNOH::CppComponentInstance(" +
                                           this->getComponentName() +
                                           ")::calculateBoundingBox")
                                           .c_str());
    auto newBoundingBox = getHitRect();
    if (!m_isClipping) {
      for (auto& child : m_children) {
        auto childBoundingBox = child->getBoundingBox();
        childBoundingBox.origin += child->getLayoutMetrics().frame.origin;

        auto childCenter = child->getLayoutMetrics().frame.getCenter();
        auto childTransform = child->getTransform();

        childBoundingBox = transformRectAroundPoint(
            childBoundingBox, childCenter, childTransform);
        newBoundingBox.unionInPlace(childBoundingBox);
      }
    }
    m_boundingBox = newBoundingBox;
  };

  void onFinalizeUpdates() override {
    auto maybeLocalRoot = maybeGetLocalRoot();
    if (!maybeLocalRoot) {
      return;
    }
    auto& localRoot = *maybeLocalRoot;

    ComponentInstance::onFinalizeUpdates();
    if (m_props->accessibilityLabelledBy.value != m_accessibilityLabelledBy) {
      std::string targetId = "";
      if (!m_props->accessibilityLabelledBy.value.empty()) {
        targetId = m_props->accessibilityLabelledBy.value[0];
      }
      if (!targetId.empty()) {
        auto componentInstanceRegistry =
            m_deps->componentInstanceRegistry.lock();
        if (componentInstanceRegistry != nullptr) {
          auto componentInstance =
              componentInstanceRegistry->findById(targetId);
          if (componentInstance != nullptr) {
            std::string newAccessibilityLabel = "";
            if (m_props->accessibilityLabel != "") {
              newAccessibilityLabel += m_props->accessibilityLabel;
            }
            auto targetAccessibilityLabel =
                componentInstance->getAccessibilityLabel();
            if (!targetAccessibilityLabel.empty()) {
              newAccessibilityLabel += " " + targetAccessibilityLabel;
            }
            if (!newAccessibilityLabel.empty()) {
              localRoot.setAccessibilityText(newAccessibilityLabel);
            }
          } else {
            DLOG(WARNING) << "Couldn't find ComponentInstance with Id: "
                          << targetId;
          }
        }
      }
    }
    m_accessibilityLabelledBy = m_props->accessibilityLabelledBy.value;

    facebook::react::BorderMetrics borderMetrics =
        m_props->resolveBorderMetrics(this->m_layoutMetrics);
    if (borderMetrics.borderWidths != m_oldBorderMetrics.borderWidths) {
      localRoot.setBorderWidth(borderMetrics.borderWidths);
    }
    if (borderMetrics.borderColors != m_oldBorderMetrics.borderColors) {
      localRoot.setBorderColor(borderMetrics.borderColors);
    }
    if (borderMetrics.borderRadii != m_oldBorderMetrics.borderRadii ||
        !m_isRadiusSetValid) {
      if (this->m_layoutMetrics.frame.size != facebook::react::Size{0, 0}) {
        m_isRadiusSetValid = true;
      }
      localRoot.setBorderRadius(borderMetrics.borderRadii);
    }
    if (borderMetrics.borderStyles != m_oldBorderMetrics.borderStyles) {
      localRoot.setBorderStyle(borderMetrics.borderStyles);
    }
    m_oldBorderMetrics = borderMetrics;
  }

  facebook::react::Rect getHitRect() const {
    facebook::react::Point origin = {0, 0};
    auto size = m_layoutMetrics.frame.size;
    if (m_props) {
      origin -= {m_props->hitSlop.left, m_props->hitSlop.top};
      size +=
          {m_props->hitSlop.right + m_props->hitSlop.left,
           m_props->hitSlop.top + m_props->hitSlop.bottom};
    }
    return {origin, size};
  };

  facebook::react::Transform getTransform() {
    return m_transform;
  }

 private:
  facebook::react::Transform m_transform =
      facebook::react::Transform::Identity();

  void setOpacity(facebook::react::SharedViewProps const& props) {
    auto isOpacityManagedByAnimated = getIgnoredPropKeys().count("opacity") > 0;
    auto isTransformManagedByAnimated =
        getIgnoredPropKeys().count("transform") > 0;
    bool shouldSetOpacity = true;

    if (isOpacityManagedByAnimated) {
      shouldSetOpacity = false;
    }

    auto opacity = props->opacity;
    float validOpacity = std::max(0.0f, std::min((float)opacity, 1.0f));
    auto transform = props->resolveTransform(m_layoutMetrics);
    if (!isTransformManagedByAnimated &&
        props->backfaceVisibility ==
            facebook::react::BackfaceVisibility::Hidden) {
      facebook::react::Vector vec{0, 0, 1, 0};
      auto resVec = transform * vec;
      if (resVec.z < 0.0) {
        validOpacity = 0.0;
        shouldSetOpacity = true;
      }
    }
    if (shouldSetOpacity) {
      this->getLocalRootArkUINode().setOpacity(validOpacity);
    }
  }

 protected:
  void onArkUINodeAccessibilityAction(ArkUINode*, const std::string& actionName)
      override {
    if (m_eventEmitter == nullptr) {
      return;
    }
    m_eventEmitter->onAccessibilityAction(actionName);
  }

  void onArkUINodeTouchIntercept(const ArkUI_UIInputEvent* event) override {
    auto mode = HitTestMode::HTM_NONE;
    if (this->canHandleTouch()) {
      mode = HitTestMode::HTM_DEFAULT;
    } else if (this->canChildrenHandleTouch()) {
      auto x = OH_ArkUI_PointerEvent_GetX(event);
      auto y = OH_ArkUI_PointerEvent_GetY(event);
      if (this->canSubtreeHandleTouch({x, y})) {
        mode = HitTestMode::HTM_DEFAULT;
      }
    }
    OH_ArkUI_PointerEvent_SetInterceptHitTestMode(event, mode);
  }

  std::string getIdFromProps(
      facebook::react::SharedViewProps const& props) const {
    if (props->testId != "") {
      return props->testId;
    } else if (props->nativeId != "") {
      return props->nativeId;
    } else {
      std::ostringstream id;
      id << ShadowNodeT::Name() << "(" << m_tag << ")"
         << "@" << this;
      return id.str();
    }
  }

  ArkUINode* maybeGetLocalRoot() {
    try {
      return &getLocalRootArkUINode();
    } catch (NoArkUINodeError&) {
      return nullptr;
    }
  }

  struct ViewRawProps {
    bool needsOffscreenAlphaCompositing = false;
    static ViewRawProps getFromDynamic(folly::dynamic value) {
      auto needsOffscreenAlphaCompositing =
          (value.count("needsOffscreenAlphaCompositing") > 0)
          ? value["needsOffscreenAlphaCompositing"].asBool()
          : false;

      return {needsOffscreenAlphaCompositing};
    }
  };

  ViewRawProps m_rawProps;

  SharedConcreteProps m_props = ShadowNodeT::defaultSharedProps();
  SharedConcreteState m_state;
  SharedConcreteEventEmitter m_eventEmitter;
  std::optional<facebook::react::Rect> m_boundingBox;
  bool m_isClipping = false;

  static ArkUI_Direction convertLayoutDirection(
      facebook::react::LayoutDirection layoutDirection) {
    switch (layoutDirection) {
      using facebook::react::LayoutDirection;
      case LayoutDirection::LeftToRight:
        return ArkUI_Direction::ARKUI_DIRECTION_LTR;
      case facebook::react::LayoutDirection::RightToLeft:
        return ArkUI_Direction::ARKUI_DIRECTION_RTL;
      default:
        return ArkUI_Direction::ARKUI_DIRECTION_AUTO;
    }
  }

 private:
  std::vector<std::string> m_accessibilityLabelledBy{};
  std::string m_accessibilityLabel;
  bool m_accessibilityGroup;
};

inline facebook::react::Rect transformRectAroundPoint(
    const facebook::react::Rect& rect,
    const facebook::react::Point& point,
    const facebook::react::Transform& transform) {
  using Point = facebook::react::Point;

  auto leftTopTransformed =
      (Point({rect.getMinX(), rect.getMinY()}) - point) * transform + point;
  auto leftBottomTransformed =
      (Point({rect.getMinX(), rect.getMaxY()}) - point) * transform + point;
  auto rightTopTransformed =
      (Point({rect.getMaxX(), rect.getMinY()}) - point) * transform + point;
  auto rightBottomTransformed =
      (Point({rect.getMaxX(), rect.getMaxY()}) - point) * transform + point;
  return facebook::react::Rect::boundingRect(
      leftTopTransformed,
      leftBottomTransformed,
      rightTopTransformed,
      rightBottomTransformed);
}
} // namespace rnoh
