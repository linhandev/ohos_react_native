#pragma once
#include "ArkUINode.h"
#include "NativeNodeApi.h"

/**
 * @api
 */
namespace rnoh {
class RefreshNodeDelegate {
 public:
  virtual ~RefreshNodeDelegate() = default;
  virtual void onRefresh(){};
};

class RefreshNode : public ArkUINode {
 protected:
  RefreshNodeDelegate* m_refreshNodeDelegate;
  static constexpr float REFRESH_NODE_SIZE = 29;

 public:
  RefreshNode();
  ~RefreshNode();

  void insertChild(ArkUINode& child, std::size_t index);
  void removeChild(ArkUINode& child);
  void onNodeEvent(ArkUI_NodeEventType eventType, EventArgs& eventArgs);
  RefreshNode& setNativeRefreshing(bool isRefreshing);
  RefreshNode& setRefreshNodeDelegate(RefreshNodeDelegate* refreshNodeDelegate);
  RefreshNode& setRefreshContent(ArkUINode& refreshContent);
};
} // namespace rnoh