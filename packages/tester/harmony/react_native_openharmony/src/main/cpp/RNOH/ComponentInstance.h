/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @architecture: C-API
 */
#pragma once
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/EventEmitter.h>
#include <react/renderer/core/LayoutMetrics.h>
#include <react/renderer/core/Props.h>
#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/core/State.h>
#include <vector>
#include "RNOH/ArkTSChannel.h"
#include "RNOH/ArkTSMessageHub.h"
#include "RNOH/DisplayMetricsManager.h"
#include "RNOH/ImageSourceResolver.h"
#include "RNOH/RNInstance.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "RNOH/TouchTarget.h"
#include "RNOH/arkui/ArkUINode.h"
#include "RNOH/arkui/UIInputEventHandler.h"
#include "TaskExecutor/TaskExecutor.h"

namespace rnoh {

class MountingManagerCAPI;

/**
 * @api
 */
class ComponentInstance
    : public TouchTarget,
      public std::enable_shared_from_this<ComponentInstance> {
 private:
  std::string m_componentName;
  std::unordered_set<std::string> m_nativeResponderBlockOrigins;

 protected:
  using Tag = facebook::react::Tag;
  using ComponentHandle = facebook::react::ComponentHandle;

 public:
  using Shared = std::shared_ptr<ComponentInstance>;
  using Weak = std::weak_ptr<ComponentInstance>;

  class Registry {
   public:
    using Weak = std::weak_ptr<Registry>;
    virtual ComponentInstance::Shared findById(const std::string& id) const = 0;
  };

  friend MountingManagerCAPI;

  struct Dependencies {
    using Shared = std::shared_ptr<const Dependencies>;

    /**
     * @deprecated: use rnInstance->postMessageToArkTS() instead
     * (latestRNOHVersion: 0.72.28)
     */
    ArkTSChannel::Shared arkTSChannel;
    /**
     * @deprecated: use arkTSMessageHub instead (latestRNOHVersion: 0.72.29)
     */
    ArkTSMessageHub::Shared arkTsMessageHub;
    ArkTSMessageHub::Shared arkTSMessageHub;
    RNInstance::Weak rnInstance;
    DisplayMetricsManager::Shared displayMetricsManager;
    ImageSourceResolver::Shared imageSourceResolver;
    Registry::Weak componentInstanceRegistry;
    TaskExecutor::Shared taskExecutor;
  };

  struct Context {
    Tag tag;
    ComponentHandle componentHandle;
    std::string componentName;
    Dependencies::Shared dependencies;
  };

  class NoArkUINodeError final : public RNOHError {
   public:
    NoArkUINodeError(
        std::string whatHappened =
            "Called `getLocalRootArkUINode` on a ComponentInstance with no `ArkUINode`s",
        std::vector<std::string> howCanItBeFixed = {});
  };

  virtual ArkUINode& getLocalRootArkUINode() = 0;

  ComponentInstance(Context ctx);

  virtual ~ComponentInstance() = default;

  /**
   * In C++ virtual methods shouldn't be called from constructor. Override this
   * method to bypass this limitation.
   */
  virtual void onCreate() {}

  Tag getTag() const {
    return m_tag;
  }

  /**
    @return A string representing the nativeId if it exists; otherwise, an empty
    string.
   */
  std::string getId() const {
    auto props = getProps();
    if (props == nullptr) {
      return "";
    }
    return props->nativeId;
  }

  /**
   * @return Either the test ID, the native ID, or a generated unique ID.
   */
  virtual std::string getCompId() = 0;

  const std::string getComponentName() const {
    return m_componentName;
  }

  ComponentHandle getComponentHandle() const {
    return m_componentHandle;
  }

  /**
   * @internal
   */
  void insertChild(
      ComponentInstance::Shared childComponentInstance,
      std::size_t index);

  /**
   * @internal
   * @deprecated Do not use it.
   * This method was used by a hack in MountingManager in RNOH 0.72.
   */
  virtual bool checkUpdateBaseNode() {
    return false;
  }

  /**
   * @internal
   */
  void removeChild(ComponentInstance::Shared childComponentInstance);

  virtual facebook::react::Props::Shared getProps() const = 0;

  virtual bool getAccessibilityGroup() const = 0;

  /**
   * TODO: change to protected — those methods are intended to be called
   * only by MountingManagerCAPI which is a friend of this class
   * (latestRNOHVersion: 0.72.27)
   */
 public:
  /**
   * @deprecated This is internal method. Do not use it, it will be private in
   * the future (latestRNOHVersion: 0.72.27)
   */
  virtual void setProps(facebook::react::Props::Shared props){};
  /**
   * @deprecated This is internal method. Do not use it, it will be private in
   * the future (latestRNOHVersion: 0.72.27)
   */
  virtual void setState(facebook::react::State::Shared state){};
  /**
   * @deprecated This is internal method. Do not use it, it will be private in
   * the future (latestRNOHVersion: 0.72.27)
   */
  virtual void setLayout(facebook::react::LayoutMetrics layoutMetrics){};
  /**
   * @deprecated This is internal method. Do not use it, it will be private in
   * the future (latestRNOHVersion: 0.72.27)
   */
  virtual void setEventEmitter(
      facebook::react::SharedEventEmitter eventEmitter){};
  /**
   * @deprecated This is internal method. Do not use it, it will be private in
   * the future (latestRNOHVersion: 0.72.27)
   */
  virtual void handleCommand(
      std::string const& commandName,
      folly::dynamic const& args) {
    this->onCommandReceived(commandName, args);
  }
  /**
   * @deprecated This is internal method. Do not use it, it will be private in
   * the future (latestRNOHVersion: 0.72.27)
   */
  virtual void finalizeUpdates() {
    this->onFinalizeUpdates();
  }
  /**
   * @deprecated: This method shouldn't be part of the API. It's an internal
   * method. Deprecated when preparing 0.77 branch for a release.
   * @internal
   * @return Index of this component within its parent.
   */
  virtual std::size_t const getIndex() const {
    return m_index;
  }

  /**
   * @deprecated: This method shouldn't be part of the API. It's an internal
   * method. Deprecated when preparing 0.77 branch for a release.
   * @internal
   * @param index — of this component within its parent.
   */
  virtual void setIndex(std::size_t index) {
    m_index = index;
  }

 public:
  /**
   * This method is necessary to support "aria-labelledby" and
   * "accessibilityLabelledBy" props.
   */
  virtual const std::string& getAccessibilityLabel() const {
    static const std::string empty = "";
    return empty;
  }

  virtual std::vector<ComponentInstance::Shared> const& getChildren() const {
    return m_children;
  }

  virtual ComponentInstance::Weak const getParent() const {
    return m_parent;
  }

  /**
   * @internal
   */
  virtual void setParent(ComponentInstance::Shared parent) {
    m_parent = parent;
  }

  /**
   * @internal
   * @deprecated: Do not use it. This method is internal. This method was added
   * and deprecated when preparing 0.77 version.
   */
  virtual facebook::react::ShadowView& getShadowView() {
    return m_shadowView;
  }

  /**
   * @internal
   * @deprecated: Do not use it. This method is meant to be internal. This
   * method was added and immediately deprecated when preparing 0.77 version.
   */
  virtual void setShadowView(facebook::react::ShadowView const& shadowView) {
    /**
     * NOOP, because it was NOOP in RNOH 0.72, but some library may override
     * this method. This method could make sense if methods like onPropsChanged,
     * onStateChanged etc. were replaced with with e.g.
     * onShadowViewChanged(newShadowView, oldShadowView).
     */
  }

  void setNativeResponderBlocked(
      bool blocked,
      const std::string& origin = "REACT_NATIVE") {
    if (blocked) {
      m_nativeResponderBlockOrigins.insert(origin);
    } else if (
        m_nativeResponderBlockOrigins.find(origin) !=
        m_nativeResponderBlockOrigins.end()) {
      m_nativeResponderBlockOrigins.erase(origin);
    }
    onNativeResponderBlockChange(m_nativeResponderBlockOrigins.size() > 0);
  }

  virtual std::weak_ptr<UIInputEventHandler> getUIInputEventHandler() {
    return {};
  }

  // TouchTarget implementation
  Tag getTouchTargetTag() const override {
    return getTag();
  }

  facebook::react::SharedTouchEventEmitter getTouchEventEmitter()
      const override {
    return nullptr;
  }

  virtual std::vector<TouchTarget::Shared> getTouchTargetChildren() override {
    auto children = getChildren();
    return std::vector<TouchTarget::Shared>(children.begin(), children.end());
  }

  /**
   * @internal
   */
  void setIgnoredPropKeys(std::unordered_set<std::string> propKeys) {
    m_ignoredPropKeys = std::move(propKeys);
  }

  /**
   * @internal
   */
  std::unordered_set<std::string> const& getIgnoredPropKeys() const {
    return m_ignoredPropKeys;
  }

  /**
   * @deprecated: It's no longer part of the API. Do NOT use it. Use downcasting
   * instead.
   * @internal
   */
  virtual bool isRefreshControlComponentInstance() const {
    return false;
  }

 protected:
  virtual void onChildInserted(
      ComponentInstance::Shared const& childComponentInstance,
      std::size_t index) {}

  virtual void onChildRemoved(
      ComponentInstance::Shared const& childComponentInstance) {}

  virtual void onFinalizeUpdates() {}

  virtual void onCommandReceived(
      std::string const& commandName,
      folly::dynamic const& args) {}

  /**
   * Override this method if your component has scrollable functionality.
   * Temporarily blocking the scrolling is required to support continuous
   * gestures like panning within these scrollable components.
   *
   * @param isBlocked A boolean indicating whether scrolling should be blocked
   * or not.
   */
  virtual void onNativeResponderBlockChange(bool isBlocked) {}

  /**
   * @internal
   */
  bool m_isRadiusSetValid = 0;
  /**
   * @api
   */
  Tag m_tag;
  /**
   * @api
   */
  ComponentHandle m_componentHandle;
  /**
   * @api
   */
  std::vector<ComponentInstance::Shared> m_children;
  /**
   * @api
   */
  ComponentInstance::Weak m_parent;
  /**
   * @api
   */
  facebook::react::LayoutMetrics m_layoutMetrics;
  /**
   * @api
   */
  Dependencies::Shared m_deps;
  /**
   * @internal
   * @deprecated Do not use it. It's an internal property. This property was
   * added and immediately deprecated when preparing 0.77 version.
   * Warning: This property isn't always set.
   */
  facebook::react::ShadowView m_shadowView;
  /**
   * @internal
   */
  std::unordered_set<std::string> m_ignoredPropKeys;
  /**
   * @api
   */
  int m_rnInstanceId = -1;
  /**
   * @deprecated This property is no longer part of the native API. It was
   * deprecated when preparing 0.77 branch for release.
   * @internal
   */
  float m_oldPointScaleFactor = 0.0f;
  /**
   * @deprecated This property is no longer part of the native API. It was
   * deprecated when preparing 0.77 branch for release. This property should be
   * private and in CppComponentInstance
   * @internal
   */
  facebook::react::BorderMetrics m_oldBorderMetrics;
  /**
   * @deprecated: This property should be private.
   * Deprecated when preparing 0.77 version for a release.
   * Index of this component within its parent.
   * @internal
   */
  std::size_t m_index = 0;
};

} // namespace rnoh
