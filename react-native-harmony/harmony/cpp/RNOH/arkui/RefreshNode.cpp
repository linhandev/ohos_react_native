#include "RefreshNode.h"

static constexpr ArkUI_NodeEventType REFRESH_NODE_EVENT_TYPES[] = {
    NODE_REFRESH_ON_REFRESH,
    NODE_REFRESH_STATE_CHANGE
};

namespace rnoh {
    RefreshNode::RefreshNode()
        : ArkUINode(NativeNodeApi::getInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_REFRESH)) {
        for (auto eventType : REFRESH_NODE_EVENT_TYPES) {
            maybeThrow(NativeNodeApi::getInstance()->registerNodeEvent(m_nodeHandle, eventType, eventType));
        }
    }

    RefreshNode::~RefreshNode() {
        for (auto eventType : REFRESH_NODE_EVENT_TYPES) {
            NativeNodeApi::getInstance()->unregisterNodeEvent(m_nodeHandle, eventType);
        }
    }

    RefreshNode& RefreshNode::setRefreshContent(ArkUINode &refreshContent) {
        ArkUI_NumberValue widthValue[] = {REFRESH_NODE_SIZE};
        ArkUI_AttributeItem widthItem = {widthValue, sizeof(widthValue) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(refreshContent.getArkUINodeHandle(), NODE_WIDTH, &widthItem));
        ArkUI_NumberValue heightValue[] = {REFRESH_NODE_SIZE};
        ArkUI_AttributeItem heightItem = {heightValue, sizeof(heightValue) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(refreshContent.getArkUINodeHandle(), NODE_HEIGHT, &heightItem));

        ArkUI_AttributeItem loadingItem = {.object = refreshContent.getArkUINodeHandle()};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_REFRESH_CONTENT, &loadingItem));
        return *this;
    }

    RefreshNode& RefreshNode::setRefreshNodeDelegate(RefreshNodeDelegate *refreshNodeDelegate){
        m_refreshNodeDelegate = refreshNodeDelegate;
        return *this;
    }

    void RefreshNode::insertChild(ArkUINode &child, std::size_t index) {
        maybeThrow(NativeNodeApi::getInstance()->addChild(m_nodeHandle, child.getArkUINodeHandle()));
    }

    void RefreshNode::removeChild(ArkUINode &child) {
        maybeThrow(NativeNodeApi::getInstance()->removeChild(m_nodeHandle, child.getArkUINodeHandle()));
    }

    RefreshNode& RefreshNode::setNativeRefreshing(bool isRefreshing) {
        ArkUI_NumberValue refreshingValue[] = {{.u32 = isRefreshing}};
        ArkUI_AttributeItem refreshingItem = {refreshingValue, sizeof(refreshingValue) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_REFRESH_REFRESHING, &refreshingItem));
        return *this;
    }
   
    void RefreshNode::onNodeEvent(ArkUI_NodeEvent *event) {
        if (event->kind == ArkUI_NodeEventType::NODE_REFRESH_ON_REFRESH) {
            if (m_refreshNodeDelegate != nullptr) {
                m_refreshNodeDelegate->onRefresh();
            }
        }
    }
} // namespace rnoh