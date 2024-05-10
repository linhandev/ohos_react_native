#include "ViewComponentInstance.h"
#include "RNOH/ClippingComponent.h"
#include <RNOH/arkui/NativeNodeApi.h>
#include "RNOH/arkui/ArkUINodeRegistry.h"

namespace rnoh {
ViewComponentInstance::ViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  m_stackNode.setStackNodeDelegate(this);
}

void ViewComponentInstance::onChildInserted(
    ComponentInstance::Shared const& childComponentInstance, std::size_t index) {
    CppComponentInstance::onChildInserted(childComponentInstance, index);
    if (m_removeClippedSubviews){
        insertNodeWithRemoveClipping(childComponentInstance, index);
    } else {
        childComponentInstance->setIsClipped(false);
        m_stackNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
    }
}

void ViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance)
{
  CppComponentInstance::onChildRemoved(childComponentInstance);
    if (m_removeClippedSubviews) {
        if (!childComponentInstance->getIsClipped()) {
            m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
        childComponentInstance->setIsClipped(true);
  }
    } else {
        m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
        childComponentInstance->setIsClipped(true);
    } 
}

void ViewComponentInstance::onHoverIn() {
  m_eventEmitter->dispatchEvent(
      "pointerEnter", [=](facebook::jsi::Runtime& runtime) {
        auto payload = facebook::jsi::Object(runtime);
        return payload;
      });
}

void ViewComponentInstance::onHoverOut() {
  m_eventEmitter->dispatchEvent(
      "pointerLeave", [=](facebook::jsi::Runtime& runtime) {
        auto payload = facebook::jsi::Object(runtime);
        return payload;
      });
}

void ViewComponentInstance::onClick() {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "click", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

StackNode& ViewComponentInstance::getLocalRootArkUINode()
{
    return m_stackNode;
}

void ViewComponentInstance::updateClippingIndex(bool isInsert, std::size_t index)
{
    if (!m_removeClippedSubviews) {
        return;
    }

    std::size_t start = ClippingComponent::getStartIndex();
    std::size_t end = ClippingComponent::getEndIndex();
    std::vector<ComponentInstance::Shared> childNodes = getChildren();
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

void ViewComponentInstance::getChildViewRect(std::shared_ptr<ComponentInstance> const& child,
  facebook::react::Rect &rect)
{
    auto nodeHandle = child->getLocalRootArkUINode().getArkUINodeHandle();
    auto itemPos = NativeNodeApi::getInstance()->getAttribute(nodeHandle, NODE_POSITION);
    auto measureSize = NativeNodeApi::getInstance()->getMeasuredSize(nodeHandle);
    ClippingComponent::fillRect(itemPos->value[0].f32, itemPos->value[1].f32,
    measureSize.width/m_layoutMetrics.pointScaleFactor,
    measureSize.height/m_layoutMetrics.pointScaleFactor, rect);
}

void ViewComponentInstance::insertNodeWithRemoveClipping(std::shared_ptr<ComponentInstance> const& child,
  std::size_t index)
{
    if (!m_removeClippedSubviews) {
        return;
    }

    facebook::react::Rect nodeRect;
    ViewComponentInstance::getChildViewRect(child, nodeRect);
    if (ClippingComponent::isIntersect(nodeRect) || 
        (index >= ClippingComponent::getStartIndex() && index <= ClippingComponent::getEndIndex() ))
    {
        uint32_t totalCnt = NativeNodeApi::getInstance()->getTotalChildCount(m_stackNode.getArkUINodeHandle());
        if (index > totalCnt) {
            m_stackNode.addChild(child->getLocalRootArkUINode());
        } else {
        m_stackNode.insertChild(child->getLocalRootArkUINode(), index);
        }
        child->setIsClipped(false);
    } else {
        if (!child->getIsClipped()) {
            m_stackNode.removeChild(child->getLocalRootArkUINode());
        }
        child->setIsClipped(true);
    }

    return;
}

void ViewComponentInstance::updateVisibleFirst(std::vector<ComponentInstance::Shared> &childNodes)
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
                m_stackNode.removeChild(item->getLocalRootArkUINode());
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
            m_stackNode.insertChild(item->getLocalRootArkUINode(), (i - start));
            item->setIsClipped(false);
        }
    }
}

void ViewComponentInstance::updateVisibleDown(std::vector<ComponentInstance::Shared> &childNodes)
{
    std::size_t end = ClippingComponent::getEndIndex();
    uint32_t total = childNodes.size();
    if (end >= total && total > 0) {
        end = total - 1;
        ClippingComponent::setEndIndex(end);
    }

    facebook::react::Rect nodeRect;
    for (std::size_t i = end; i < total; i++) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            if (i == total - 1) { 
                ClippingComponent::setEndIndex(i);
            }
            if (item->getIsClipped()) {
                m_stackNode.addChild(item->getLocalRootArkUINode());
                item->setIsClipped(false);
            }
        } else {
            if ( i > ClippingComponent::getStartIndex()) {
                ClippingComponent::setEndIndex(i - 1);
                break;
            }
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
                m_stackNode.removeChild(item->getLocalRootArkUINode());
                item->setIsClipped(true);
            }
        }
    }
}

void ViewComponentInstance::updateVisibleUp(std::vector<ComponentInstance::Shared> &childNodes)
{
    facebook::react::Rect nodeRect;
    std::size_t start = ClippingComponent::getStartIndex();

    for (std::size_t i = start; i >= 0; i--) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            if (i == 0) {
                ClippingComponent::setStartIndex(i);
            }
            if (item->getIsClipped()) {          
                m_stackNode.insertChild(item->getLocalRootArkUINode(), 0);
                item->setIsClipped(false);
            }
        } else {
            if ( i < ClippingComponent::getEndIndex()) {
                ClippingComponent::setStartIndex(i + 1);
                break;
            }
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
                m_stackNode.removeChild(item->getLocalRootArkUINode());
                item->setIsClipped(true);
            }
        }
        if (i == start) {
            break;
        }
    }
}

void ViewComponentInstance::updateVisible(bool isFrist)
{
    if (!m_removeClippedSubviews){
        return;
    }
    if (m_clippingRect.size.width == 0 || m_clippingRect.size.height == 0) {
        return;
    }
    uint32_t start = ClippingComponent::getStartIndex();
    uint32_t end = ClippingComponent::getEndIndex();
    std::vector<ComponentInstance::Shared> childNodes = getChildren();
    if (isFrist || (start == 0 && end== 0) || (start > end) || start >= childNodes.size() || end >= childNodes.size()) {
        updateVisibleFirst(childNodes);
        return;
    }

    if (shiftDirect == ClippingMoveDirect::MOVE_DOWN || shiftDirect == ClippingMoveDirect::MOVE_RIGHT) {
        updateVisibleDown(childNodes);
    } else if(shiftDirect == ClippingMoveDirect::MOVE_UP || shiftDirect == ClippingMoveDirect::MOVE_LEFT) {
        updateVisibleUp(childNodes);
    } else {
        updateVisibleFirst(childNodes);
    }
}

} // namespace rnoh
