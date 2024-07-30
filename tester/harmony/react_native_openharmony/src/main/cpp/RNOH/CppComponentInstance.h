/**
 * Used only in C-API based Architecture.
 */
#pragma once
#include <react/renderer/components/view/TouchEventEmitter.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/EventEmitter.h>
#include <react/renderer/core/LayoutMetrics.h>
#include <react/renderer/core/Props.h>
#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/core/State.h>
#include <react/renderer/debug/SystraceSection.h>
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
class CppComponentInstance : public ComponentInstance {
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

  facebook::react::Tag getTag() const {
    return m_tag;
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
    if (m_props != nullptr) {
      auto props =
          std::dynamic_pointer_cast<const facebook::react::ViewProps>(m_props);
      return props->pointerEvents == facebook::react::PointerEventsMode::Auto ||
          props->pointerEvents == facebook::react::PointerEventsMode::BoxOnly;
    }
    return true;
  };

  bool canChildrenHandleTouch() const override {
    if (m_props != nullptr) {
      auto props =
          std::dynamic_pointer_cast<const facebook::react::ViewProps>(m_props);
      return props->pointerEvents == facebook::react::PointerEventsMode::Auto ||
          props->pointerEvents == facebook::react::PointerEventsMode::BoxNone;
    }
    return true;
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
    this->getLocalRootArkUINode().setLayoutRect(
        layoutMetrics.frame.origin,
        layoutMetrics.frame.size,
        layoutMetrics.pointScaleFactor);
    if (layoutMetrics.pointScaleFactor != m_layoutMetrics.pointScaleFactor) {
      this->getLocalRootArkUINode().setTransform(
          m_transform, layoutMetrics.pointScaleFactor);
    }
    markBoundingBoxAsDirty();
  }

  virtual void onPropsChanged(SharedConcreteProps const& concreteProps) {
    facebook::react::SystraceSection s(std::string(
                                           "#RNOH::CppComponentInstance(" +
                                           this->getComponentName() +
                                           ")::onPropsChanged")
                                           .c_str());
    auto props = std::static_pointer_cast<const facebook::react::ViewProps>(
        concreteProps);
    auto old =
        std::static_pointer_cast<const facebook::react::ViewProps>(m_props);
    RNOH_ASSERT(old != nullptr);
    auto isTransformManagedByAnimated =
        getIgnoredPropKeys().count("transform") > 0;
    if (*(props->backgroundColor) != *(old->backgroundColor)) {
      this->getLocalRootArkUINode().setBackgroundColor(props->backgroundColor);
    }

    if (props->shadowColor != old->shadowColor ||
        props->shadowOffset != old->shadowOffset ||
        props->shadowOpacity != old->shadowOpacity ||
        props->shadowRadius != old->shadowRadius) {
      this->getLocalRootArkUINode().setShadow(
          props->shadowColor,
          props->shadowOffset,
          props->shadowOpacity,
          props->shadowRadius);
    }

    if (!isTransformManagedByAnimated && props->transform != old->transform) {
      this->setTransform(props->transform);
      this->getLocalRootArkUINode().setTransform(
          props->transform, m_layoutMetrics.pointScaleFactor);
      markBoundingBoxAsDirty();
    }

    if (props->pointerEvents != old->pointerEvents) {
      this->getLocalRootArkUINode().setHitTestMode(props->pointerEvents);
      this->getLocalRootArkUINode().setEnabled(
          props->pointerEvents != facebook::react::PointerEventsMode::None);
    }

    if (props->accessibilityHint != old->accessibilityHint) {
      this->getLocalRootArkUINode().setAccessibilityDescription(
          props->accessibilityHint);
    }

    if (props->importantForAccessibility != old->importantForAccessibility) {
      this->getLocalRootArkUINode().setAccessibilityLevel(
          props->importantForAccessibility);
    }

    if (props->accessibilityLabel != old->accessibilityLabel) {
      this->getLocalRootArkUINode().setAccessibilityText(
          props->accessibilityLabel);
    }

    if (props->accessible != old->accessible) {
      this->getLocalRootArkUINode().setAccessibilityGroup(props->accessible);
    }

    this->setOpacity(props);

    auto newOverflow = props->getClipsContentToBounds();
    if ((old->getClipsContentToBounds() != newOverflow)) {
      m_isClipping = newOverflow;
      this->getLocalRootArkUINode().setClip(newOverflow);
      markBoundingBoxAsDirty();
    }

    this->getLocalRootArkUINode().setId(getIdFromProps(props));
  };

  virtual void onStateChanged(SharedConcreteState const& /*state*/) {
    facebook::react::SystraceSection s(std::string(
                                           "#RNOH::CppComponentInstance(" +
                                           this->getComponentName() +
                                           ")::onStateChanged")
                                           .c_str());
  };

  virtual void onEventEmitterChanged(
      SharedConcreteEventEmitter const& eventEmitter){};

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
    ComponentInstance::onFinalizeUpdates();

    facebook::react::BorderMetrics borderMetrics =
        m_props->resolveBorderMetrics(this->m_layoutMetrics);
    if (borderMetrics.borderWidths != m_oldBorderMetrics.borderWidths) {
      this->getLocalRootArkUINode().setBorderWidth(borderMetrics.borderWidths);
    }
    if (borderMetrics.borderColors != m_oldBorderMetrics.borderColors) {
      this->getLocalRootArkUINode().setBorderColor(borderMetrics.borderColors);
    }
    if (borderMetrics.borderRadii != m_oldBorderMetrics.borderRadii ||
        !m_isRadiusSetValid) {
      if (this->m_layoutMetrics.frame.size != facebook::react::Size{0, 0}) {
        m_isRadiusSetValid = true;
      }
      this->getLocalRootArkUINode().setBorderRadius(borderMetrics.borderRadii);
    }
    if (borderMetrics.borderStyles != m_oldBorderMetrics.borderStyles) {
      this->getLocalRootArkUINode().setBorderStyle(borderMetrics.borderStyles);
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

 private:
  facebook::react::Transform m_transform =
      facebook::react::Transform::Identity();

  void setTransform(facebook::react::Transform const& transform) {
    m_transform = transform;
  }

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
    facebook::react::Transform transform = props->transform;
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

  SharedConcreteProps m_props = ShadowNodeT::defaultSharedProps();
  SharedConcreteState m_state;
  SharedConcreteEventEmitter m_eventEmitter;
  std::optional<facebook::react::Rect> m_boundingBox;
  bool m_isClipping = false;
  facebook::react::BorderMetrics m_oldBorderMetrics = {};
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
