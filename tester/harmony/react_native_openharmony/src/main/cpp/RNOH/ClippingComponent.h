/**
 * Used only in C-API based Architecture.
 */
#pragma once
#include <react/renderer/core/State.h>
#include "RNOH/arkui/ArkUINode.h"
#include <react/renderer/graphics/Size.h>

namespace rnoh {
class ComponentInstance;
enum class ClippingMoveDirect
{
    MOVE_NONE = 0,
    MOVE_UP,
    MOVE_DOWN,
    MOVE_LEFT,
    MOVE_RIGHT
};

class ClippingComponent
{
    protected:
        bool m_removeClippedSubviews = false;
        bool m_isClipped = false;
        facebook::react::Rect m_clippingRect;
        std::size_t m_startIndex = 0;
        std::size_t m_endIndex = 0;
        ClippingMoveDirect shiftDirect = ClippingMoveDirect::MOVE_NONE;
        virtual void insertNodeWithRemoveClipping(std::shared_ptr<ComponentInstance> const& child,
            std::size_t index);
        bool isIntersect(facebook::react::Rect &nodeRect);
        void fillRect(float x, float y, float width, float height, facebook::react::Rect &rect);
        std::size_t getStartIndex();
        void setStartIndex(std::size_t i);
        std::size_t getEndIndex();
        void setEndIndex(std::size_t i);
        virtual void updateClippingIndex(bool isInsert, std::size_t index);
    public:
        ClippingComponent();
        ~ClippingComponent();
        void setRemoveClippedSubviews(bool isClipping);
        bool getRemoveClippedSubviews();
        void setIsClipped(bool isClipped);
        bool getIsClipped();
        void updateContentOffset(facebook::react::Point contentOffset, facebook::react::Size containerSize);
        virtual void updateVisible(bool isFrist);  
};

} // namespace rnoh
