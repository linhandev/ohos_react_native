#include "CustomNodeComponentInstance.h"
#include "RNOH/ClippingComponent.h"
#include <RNOH/arkui/NativeNodeApi.h>
#include "RNOH/arkui/ArkUINodeRegistry.h"

namespace rnoh {
CustomNodeComponentInstance::CustomNodeComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  m_customNode = new CustomNode();
  getLocalRootArkUINode().setCustomNodeDelegate(this);
}

CustomNodeComponentInstance::~CustomNodeComponentInstance() {
  if (m_customNode != nullptr) {
    delete m_customNode;
  }
}

void CustomNodeComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance, std::size_t index) {
    CppComponentInstance::onChildInserted(childComponentInstance, index);
    if (m_removeClippedSubviews){
        insertNodeWithRemoveClipping(childComponentInstance, index);
    } else {
        childComponentInstance->setIsClipped(false);
        getLocalRootArkUINode().insertChild(childComponentInstance->getLocalRootArkUINode(), index);
    }
}

void CustomNodeComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance)
{
  CppComponentInstance::onChildRemoved(childComponentInstance);
    if (m_removeClippedSubviews) {
        if (!childComponentInstance->getIsClipped()) {
            getLocalRootArkUINode().removeChild(childComponentInstance->getLocalRootArkUINode());
        childComponentInstance->setIsClipped(true);
  }
    } else {
        getLocalRootArkUINode().removeChild(childComponentInstance->getLocalRootArkUINode());
        childComponentInstance->setIsClipped(true);
    } 
}

void CustomNodeComponentInstance::onHoverIn() {
    if (m_eventEmitter != nullptr) {
      m_eventEmitter->dispatchEvent(
          "pointerEnter", [=](facebook::jsi::Runtime& runtime) {
            auto payload = facebook::jsi::Object(runtime);
            return payload;
          });
    }
}

void CustomNodeComponentInstance::onHoverOut() {
    if (m_eventEmitter != nullptr) {
      m_eventEmitter->dispatchEvent(
          "pointerLeave", [=](facebook::jsi::Runtime& runtime) {
            auto payload = facebook::jsi::Object(runtime);
            return payload;
          });
    }
}

void CustomNodeComponentInstance::onClick() {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "click", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

CustomNode& CustomNodeComponentInstance::getLocalRootArkUINode()
{
  return *m_customNode;
}

void CustomNodeComponentInstance::onChildLayoutChange(std::shared_ptr<ComponentInstance> child)
{
    auto childNodes = getChildren();
    updateVisibleFirst(childNodes);
}

void CustomNodeComponentInstance::updateClippingIndex(bool isInsert, std::size_t index)
{
    if (!m_removeClippedSubviews) {
        return;
    }

    std::size_t start = ClippingComponent::getStartIndex();
    std::size_t end = ClippingComponent::getEndIndex();
    auto childNodes = ClippingComponent::getSortChildren();
    if (start > end || start >= childNodes.size() || end >= childNodes.size()) {
        updateVisibleFirst(childNodes);
    }
    if (isInsert) {
        if (index < start) {
            start < childNodes.size() - 1 ?  ClippingComponent::setStartIndex(start + 1) : 
                ClippingComponent::setStartIndex(childNodes.size() - 1);
            end < childNodes.size() - 1 ? ClippingComponent::setEndIndex(end + 1) : 
                ClippingComponent::setEndIndex(childNodes.size() - 1);
        } else if (index < end) {
            end < childNodes.size() - 1 ? ClippingComponent::setEndIndex(end + 1) : 
                ClippingComponent::setEndIndex(childNodes.size() - 1);
        }
    } else {
        if (start == 0 && end == 0 || start > end) {
            return;
        }
        if (index < start) {
            if (start > 0) {
                ClippingComponent::setStartIndex(start - 1);
            }
            if (end > 0) {
                ClippingComponent::setEndIndex(end - 1);
            }
        } else if (index <= end) {
            if (start == end) {
                ClippingComponent::setStartIndex(start - 1);
            }
            ClippingComponent::setEndIndex(end - 1);
        }
    }
    return;
}

void CustomNodeComponentInstance::initSortChildren() 
{
    if (!m_removeClippedSubviews) {
        return;
    }
 
    auto children = getChildren();
    std::size_t index = 0;
    for (auto item = children.begin(); item != children.end(); item++) {
        insertSortChild(*item, index);
    }

    return;
}

void CustomNodeComponentInstance::clearSortChildren() 
{
    auto children = ClippingComponent::getSortChildren();
    std::size_t index = 0;
    for (auto item = children.begin(); item != children.end(); item++) {
        removeSortChild(*item, index);
    }
    return;
}

bool positionCompare(std::shared_ptr<ComponentInstance> lhs, std::shared_ptr<ComponentInstance> rhs)
{
    auto metrics1 = lhs->getLayoutMetrics();
    auto metrics2 = rhs->getLayoutMetrics();
    auto parentCom = lhs->getParent().lock();
    if (parentCom == nullptr) {
        return false;
    }
    if (parentCom->m_horizontal) {
        if (metrics1.frame.origin.x < metrics2.frame.origin.x) {
            return true;
        } else if (metrics1.frame.origin.x == metrics2.frame.origin.x) {
            return metrics1.frame.origin.x + metrics1.frame.size.width >
                   metrics2.frame.origin.x + metrics2.frame.size.width;
        }
        else
        {
            return false;
        }
    }
    else
    {
        if (metrics1.frame.origin.y < metrics2.frame.origin.y)
        {
            return true;
        }
        else if (metrics1.frame.origin.y == metrics2.frame.origin.y)
        {
            return metrics1.frame.origin.y + metrics1.frame.size.height >
                   metrics2.frame.origin.y + metrics2.frame.size.height;
        }
        else
        {
            return false;
        }
    }
}

void CustomNodeComponentInstance::insertSortChild(std::shared_ptr<ComponentInstance> child, std::size_t &index)
{
    if (!m_removeClippedSubviews) {
        return;
    }
    auto children = m_sortChildren;
    auto it = std::upper_bound(m_sortChildren.begin(), m_sortChildren.end(), child, positionCompare);
    it = m_sortChildren.insert(it, child);
    index = it - m_sortChildren.begin();

    return;
}

void CustomNodeComponentInstance::removeSortChild(std::shared_ptr<ComponentInstance> child, std::size_t &index)
{
    if (!m_removeClippedSubviews) {
        return;
    }
    auto it = std::find(m_sortChildren.begin(), m_sortChildren.end(), child);
    if (it != m_sortChildren.end()) {
        index = it - m_sortChildren.begin();
        auto child = std::move(*it);
        m_sortChildren.erase(it);
    }
    return;
}

void CustomNodeComponentInstance::getChildViewRect(std::shared_ptr<ComponentInstance> const& child,
  facebook::react::Rect &rect)
{
    if (child == nullptr) {
        return;
    }
    auto metrics = child->getLayoutMetrics();
    ClippingComponent::fillRect(metrics.frame.origin.x, metrics.frame.origin.y,
        metrics.frame.size.width, metrics.frame.size.height, rect);
    return;
}

void CustomNodeComponentInstance::insertNodeWithRemoveClipping(std::shared_ptr<ComponentInstance> const& child, std::size_t index) 
{
    if (!m_removeClippedSubviews) {
        return;
    }
    auto props = std::dynamic_pointer_cast<facebook::react::ViewProps>(child);
    if (props && props->transform == facebook::react::Transform::Identity()) {
        return;
    }

    facebook::react::Rect nodeRect;
    CustomNodeComponentInstance::getChildViewRect(child, nodeRect);
    if (ClippingComponent::isIntersect(nodeRect) || 
        (index >= ClippingComponent::getStartIndex() && index <= ClippingComponent::getEndIndex() ))
    {
        uint32_t totalCnt = NativeNodeApi::getInstance()->getTotalChildCount(getLocalRootArkUINode().getArkUINodeHandle());
        if (index > totalCnt) {
            getLocalRootArkUINode().addChild(child->getLocalRootArkUINode());
        } else {
            getLocalRootArkUINode().insertChild(child->getLocalRootArkUINode(), index);
        }
        child->setIsClipped(false);
    } else {
        if (!child->getIsClipped()) {
            getLocalRootArkUINode().removeChild(child->getLocalRootArkUINode());
        }
        child->setIsClipped(true);
    }

    return;
}

void CustomNodeComponentInstance::updateVisibleFirst(std::vector<ComponentInstance::Shared> &childNodes)
{
    bool findStart = false;
    bool findEnd = false;
    facebook::react::Rect nodeRect;
    uint32_t maxIndex = childNodes.size();
    if (maxIndex == 0) {
        return;
    }

    for (std::size_t i = 0; i < maxIndex; i++) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            if(!findStart) {
                ClippingComponent::setStartIndex(i);
                findStart = true;
            }
            if (findStart && i == maxIndex - 1) {
                ClippingComponent::setEndIndex(i);
                findEnd = true;
            }
            if (findEnd && i > ClippingComponent::getEndIndex()) {
                findEnd = false;
            }
        } else {
            if(findStart && !findEnd && i > 0) {
                ClippingComponent::setEndIndex(i - 1);
                findEnd = true;
            }
            if (!item->getIsClipped()) {
                getLocalRootArkUINode().removeChild(item->getLocalRootArkUINode());
                item->setIsClipped(true);
            }
        }
    }
    if (!findStart || !findEnd) {
        return;
    }
    std::size_t start = ClippingComponent::getStartIndex();
    std::size_t end = ClippingComponent::getEndIndex();
    for (std::size_t i = start; i <= end; i++) {
        const auto& item = childNodes[i];
        if (item->getIsClipped()) {
            getLocalRootArkUINode().insertChild(item->getLocalRootArkUINode(), (i - start));
            item->setIsClipped(false);
        }
    }
}

void CustomNodeComponentInstance::updateVisibleDown(std::vector<ComponentInstance::Shared> &childNodes)
{
    std::size_t end = ClippingComponent::getEndIndex();
    uint32_t total = childNodes.size();
    if (end >= total && total > 0) {
        end = total - 1;
        ClippingComponent::setEndIndex(end);
    }

    facebook::react::Rect nodeRect;
    bool isFindEnd = false;
    for (std::size_t i = end; i < total; i++) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            if (i == total - 1) { 
                ClippingComponent::setEndIndex(i);
            }
            if (item->getIsClipped()) {
                getLocalRootArkUINode().addChild(item->getLocalRootArkUINode());
                item->setIsClipped(false);
                isFindEnd = true;
            }
        }
        else if (isFindEnd && i > ClippingComponent::getStartIndex())
        {
            ClippingComponent::setEndIndex(i - 1);
            break;
        }
    }

    std::size_t start = ClippingComponent::getStartIndex();
    end = ClippingComponent::getEndIndex();
    for (std::size_t i = start; i < end; i++) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            ClippingComponent::setStartIndex(i);
            break;
        } else {
            if (!item->getIsClipped()) {
                getLocalRootArkUINode().removeChild(item->getLocalRootArkUINode());
                item->setIsClipped(true);
            }
        }
    }
}

void CustomNodeComponentInstance::updateVisibleUp(std::vector<ComponentInstance::Shared> &childNodes)
{
    facebook::react::Rect nodeRect;
    std::size_t start = ClippingComponent::getStartIndex();

    bool isFindStart = false;
    for (std::size_t i = start; i >= 0; i--) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            if (i == 0) {
                ClippingComponent::setStartIndex(i);
            }
            if (item->getIsClipped()) {          
                getLocalRootArkUINode().insertChild(item->getLocalRootArkUINode(), 0);
                item->setIsClipped(false);
                isFindStart = true;
            }
        }
        else if (isFindStart && i < ClippingComponent::getEndIndex())
        {
            ClippingComponent::setStartIndex(i + 1);
            break;
        }
        if (i == 0) {
            break;
        }
    }

    start = ClippingComponent::getStartIndex();
    std::size_t end = ClippingComponent::getEndIndex();
    for (std::size_t i = end; i >= start; i--) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            ClippingComponent::setEndIndex(i);
            break;
        } else {
            if (!item->getIsClipped()) {
                getLocalRootArkUINode().removeChild(item->getLocalRootArkUINode());
                item->setIsClipped(true);
            }
        }
        if (i == start) {
            break;
        }
    }
}

void CustomNodeComponentInstance::updateVisible(bool isFirst)
{
    if (!m_removeClippedSubviews){
        return;
    }
    if (m_clippingRect.size.width == 0 || m_clippingRect.size.height == 0) {
        return;
    }
    uint32_t start = ClippingComponent::getStartIndex();
    uint32_t end = ClippingComponent::getEndIndex();
    auto childNodes = getChildren();
    if (isFirst || (start == 0 && end== 0) || (start > end) || start >= childNodes.size() || end >= childNodes.size()) {
        updateVisibleFirst(childNodes);
        return;
    }

    updateVisibleFirst(childNodes);
}

void CustomNodeComponentInstance::restoreRsTree()
{
    if (!m_removeClippedSubviews){
        return;
    }

    auto children = getChildren();
    uint32_t total = children.size();
    for (std::size_t i = 0; i < total; i++) {
        const auto& item = children[i];
        if (item->getIsClipped()) {          
            getLocalRootArkUINode().insertChild(item->getLocalRootArkUINode(), i);
            item->setIsClipped(false);
        }
    }

    return;
}

} // namespace rnoh
