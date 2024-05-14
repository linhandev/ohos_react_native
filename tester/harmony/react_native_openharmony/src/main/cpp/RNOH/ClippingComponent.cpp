#include <glog/logging.h>
#include "ClippingComponent.h"

namespace rnoh {
ClippingComponent::ClippingComponent()
{
    return;
}

ClippingComponent::~ClippingComponent() 
{
    return;
}

void ClippingComponent::insertNodeWithRemoveClipping(
    std::shared_ptr<ComponentInstance> const& child, std::size_t index)
{
    return;
}

bool ClippingComponent::isIntersect(facebook::react::Rect& nodeRect)
{
    if (!m_removeClippedSubviews){
        return true;
    }

    if (m_clippingRect.getMinX() <= nodeRect.getMaxX() && nodeRect.getMinX() <= m_clippingRect.getMaxX() &&
        m_clippingRect.getMinY() <= nodeRect.getMaxY() && nodeRect.getMinY() <= m_clippingRect.getMaxY()){
        return true;
    }

    return false;
}

void ClippingComponent::fillRect(float x, float y, float width, float height, facebook::react::Rect &rect)
{
    rect.origin.x = x;
    rect.origin.y = y;
    rect.size.width = width;
    rect.size.height = height;
}

void ClippingComponent::updateVisible(bool isFrist)
{
    return;
}

void ClippingComponent::updateContentOffset(facebook::react::Point contentOffset, facebook::react::Size containerSize)
{
    if (!m_removeClippedSubviews){
        return;
    }

    if (contentOffset == m_clippingRect.origin) {
        fillRect(contentOffset.x, contentOffset.y, containerSize.width, containerSize.height, m_clippingRect);
        updateVisible(true);
        return;
    }

    if (contentOffset.x != m_clippingRect.origin.x &&
        contentOffset.y != m_clippingRect.origin.y) {
        return;
    }

    if (contentOffset.x == m_clippingRect.origin.x) {
        shiftDirect = contentOffset.y > m_clippingRect.origin.y ? ClippingMoveDirect::MOVE_DOWN : ClippingMoveDirect::MOVE_UP;
    } else {
        shiftDirect = contentOffset.x > m_clippingRect.origin.x ? ClippingMoveDirect::MOVE_RIGHT : ClippingMoveDirect::MOVE_LEFT;
    }
    contentOffset.x = contentOffset.x < 0 ? 0 : contentOffset.x;
    contentOffset.y = contentOffset.y < 0 ? 0 : contentOffset.y;
    fillRect(contentOffset.x, contentOffset.y, containerSize.width, containerSize.height, m_clippingRect);
    updateVisible(false);
    return;
}

void ClippingComponent::setRemoveClippedSubviews(bool isClipping, bool isHorizontal)
{
    if (m_horizontal != isHorizontal) {
        clearSortChildren();
        initSortChildren();
    }
    m_horizontal = isHorizontal;
    
    if (m_removeClippedSubviews == isClipping){
        return;
    }
    m_removeClippedSubviews = isClipping;
    if (isClipping) {
        initSortChildren();
    } else {
        clearSortChildren();
    }
    updateVisible(true);
    return;
}

bool ClippingComponent::getRemoveClippedSubviews()
{
    return m_removeClippedSubviews;
}

void ClippingComponent::setIsClipped(bool isClipped)
{
    m_isClipped = isClipped;
}

bool ClippingComponent::getIsClipped()
{
    return m_isClipped;
}

std::size_t ClippingComponent::getStartIndex()
{
    return m_startIndex;
}

void ClippingComponent::setStartIndex(std::size_t i)
{
    m_startIndex = i;
}

std::size_t ClippingComponent::getEndIndex()
{
    return m_endIndex;
}

void ClippingComponent::setEndIndex(std::size_t i)
{
    m_endIndex = i;
}

void ClippingComponent::updateClippingIndex(bool isInsert, std::size_t index)
{
    return;
}

void ClippingComponent::initSortChildren()
{
    return;
}
void ClippingComponent::clearSortChildren()
{
    return;
}

void ClippingComponent::insertSortChild(std::shared_ptr<ComponentInstance> child, std::size_t &index)
{
    return;
}

void ClippingComponent::removeSortChild(std::shared_ptr<ComponentInstance> child, std::size_t &index)
{
    return;
}

} // namespace rnoh
