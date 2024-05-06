/**
 * Used only in C-API based Architecture.
 */
#pragma once
#include <react/renderer/core/State.h>
#include "RNOH/arkui/ArkUINode.h"
#include <react/renderer/graphics/Size.h>



namespace rnoh {
  class ComponentInstance;
  class ClippingComponent
  {
    protected:
        bool m_removeClippedSubviews = false;
        bool m_isClipped = false;
        facebook::react::Rect m_clippingRect;
        uint32_t m_startIndex = 0;
        uint32_t m_endIndex = 0;
        bool isMoveDownOrRright = true;
        virtual void insertNodeWithRemoveClipping(std::shared_ptr<ComponentInstance> const& child,
            std::size_t index);
        bool isIntersect(facebook::react::Rect &nodeRect);
        void fillRect(float x, float y, float width, float height, facebook::react::Rect &rect);
        uint32_t getStartIndex();
        void setStartIndex(uint32_t i);
        uint32_t getEndIndex();
        void setEndIndex(uint32_t i);
    public:
        ClippingComponent();
        ~ClippingComponent();
        void setRemoveClippedSubviews(bool isClipping);
        bool getRemoveClippedSubviews();
        void setIsClipped(bool isClipped);
        bool getIsClipped();
        void updateContentOffset(facebook::react::Point contentOffset, facebook::react::Size contentSize);
        virtual void updateVisible(bool isFrist);  
  };

} // namespace rnoh