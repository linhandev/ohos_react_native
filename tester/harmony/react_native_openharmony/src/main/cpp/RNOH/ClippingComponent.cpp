#include <glog/logging.h>
#include "ClippingComponent.h"

namespace rnoh {
ClippingComponent::ClippingComponent() {}

ClippingComponent::~ClippingComponent() {}

void ClippingComponent::insertNodeWithRemoveClipping(std::shared_ptr<ComponentInstance> const& child, std::size_t index){}

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

void ClippingComponent::updateVisible(bool isFrist){}

void ClippingComponent::updateContentOffset(facebook::react::Point contentOffset, facebook::react::Size contentSize)
{
  if (!m_removeClippedSubviews){
    return;
  }

  if (contentOffset.x != m_clippingRect.origin.x && contentOffset.y != m_clippingRect.origin.y ) {
    return;
  }

  if (contentOffset.x > m_clippingRect.origin.x || contentOffset.y > m_clippingRect.origin.y) {
    isMoveDownOrRright = true;
  } else {
    isMoveDownOrRright = false;
  }

  if (contentOffset.x <  0) {
    contentOffset.x = 0;
  }
  if (contentOffset.y <  0) {
    contentOffset.y = 0;
  }

  fillRect(contentOffset.x, contentOffset.y, contentSize.width, contentSize.height, m_clippingRect);

  updateVisible(false);
  return;
}

void ClippingComponent::setRemoveClippedSubviews(bool isClipping)
{
  if (m_removeClippedSubviews == isClipping){
    return;
  }
  m_removeClippedSubviews = isClipping;

  updateVisible(true);
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

uint32_t ClippingComponent::getStartIndex()
{
  return m_startIndex;
}

void ClippingComponent::setStartIndex(uint32_t i)
{
   m_startIndex = i;
}

uint32_t ClippingComponent::getEndIndex()
{
  return m_endIndex;
}

void ClippingComponent::setEndIndex(uint32_t i)
{
  m_endIndex = i;
}

} // namespace rnoh
