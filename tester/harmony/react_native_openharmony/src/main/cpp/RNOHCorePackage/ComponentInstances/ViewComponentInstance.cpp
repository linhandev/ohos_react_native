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
    ComponentInstance::Shared const& childComponentInstance,
    std::size_t index) {
  CppComponentInstance::onChildInserted(childComponentInstance, index);
  if (m_removeClippedSubviews){
      insertNodeWithRemoveClipping(childComponentInstance, index);
  } else {
    childComponentInstance->setIsClipped(false);
  m_stackNode.insertChild(
      childComponentInstance->getLocalRootArkUINode(), index);
  }
}

void ViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& childComponentInstance) {
  CppComponentInstance::onChildRemoved(childComponentInstance);
  if (m_removeClippedSubviews && !childComponentInstance->getIsClipped()){
  m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
  }
};

void ViewComponentInstance::onClick() {
  if (m_eventEmitter != nullptr) {
    m_eventEmitter->dispatchEvent(
        "click", [=](facebook::jsi::Runtime& runtime) {
          auto payload = facebook::jsi::Object(runtime);
          return payload;
        });
  }
}

StackNode& ViewComponentInstance::getLocalRootArkUINode() {
  return m_stackNode;
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
    if (!m_removeClippedSubviews){
        return;
    }
    facebook::react::Rect nodeRect;
    getChildViewRect(child, nodeRect);
    if (ClippingComponent::isIntersect(nodeRect)) { 
      child->setIsClipped(false);
      if (index < ClippingComponent::getStartIndex()) {
        ClippingComponent::setStartIndex(index);
      }
      if (index > ClippingComponent::getEndIndex()) {
        ClippingComponent::setEndIndex(index);
      }
  } else {
        if (!child->getIsClipped()) {
            m_stackNode.removeChild(child->getLocalRootArkUINode());
            child->setIsClipped(true);
        }
    }
  return;
}

void ViewComponentInstance::updateVisibleFirst(std::vector<ComponentInstance::Shared> &childNodes)
{
    bool findTop = false;
    bool findBottom = false;
    facebook::react::Rect nodeRect;
    uint32_t maxIndex = childNodes.size();
    for (uint32_t i = 0; i < maxIndex; i++) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            if(!findTop) {
                ClippingComponent::setStartIndex(i);
                findTop = true;
            }
            if (findTop && i == maxIndex - 1) {
                ClippingComponent::setEndIndex(i);
                findBottom = true;
            }
            if (item->getIsClipped()) {
                m_stackNode.addChild(item->getLocalRootArkUINode());
                item->setIsClipped(false);
            }
        } else {
            if(findTop && !findBottom && i >= 1) {
                ClippingComponent::setEndIndex(i - 1);
                findBottom = true;
        }
        if (!item->getIsClipped()) {
            m_stackNode.removeChild(item->getLocalRootArkUINode());
            item->setIsClipped(true);
            }
        }
    }
}

void ViewComponentInstance::updateVisibleDown(std::vector<ComponentInstance::Shared> &childNodes)
{
    int32_t minIndex = ClippingComponent::getEndIndex();
    int32_t maxIndex = childNodes.size();
    if (ClippingComponent::getEndIndex() == maxIndex -1) {
        return;
    }
    facebook::react::Rect nodeRect;
    for (int32_t i = minIndex; i < maxIndex; i++) {
        const auto& item = childNodes[i];
        getChildViewRect(item, nodeRect);
        if (ClippingComponent::isIntersect(nodeRect)) {
            if (i == maxIndex - 1) { 
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
    minIndex = ClippingComponent::getStartIndex();
    maxIndex = ClippingComponent::getEndIndex();
    for (int32_t i = minIndex; i < maxIndex; i++) {
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
    int32_t minIndex = 0;
    int32_t maxIndex = ClippingComponent::getStartIndex();
    auto lasItem = childNodes.back();
    getChildViewRect(lasItem, nodeRect);

    if (shiftDirect == ClippingMoveDirect::MOVE_UP && m_clippingRect.getMaxY() > nodeRect.getMaxY()) {
        return;
    }
    if (shiftDirect == ClippingMoveDirect::MOVE_LEFT && m_clippingRect.getMaxX() > nodeRect.getMaxX()) {
        return;
    }
    for (int32_t i = maxIndex; i >= minIndex; i--) {
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
    }
    minIndex = ClippingComponent::getStartIndex();
    maxIndex = ClippingComponent::getEndIndex();
    for (int32_t i = maxIndex; i >= minIndex; i--) {
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
    std::vector<ComponentInstance::Shared> childNodes = getChildren();

    if (isFrist || (ClippingComponent::getStartIndex() == 0 && ClippingComponent::getEndIndex() == 0)) {
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
