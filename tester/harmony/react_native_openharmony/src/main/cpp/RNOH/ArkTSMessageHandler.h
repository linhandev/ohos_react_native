#pragma once
#include <folly/dynamic.h>
#include <string>

namespace rnoh {
class RNInstance;

/**
 * @api
 * @thread: MAIN
 * Handles messages sent from the ArkTS side within the context of an
 * RNInstance. If a message needs to be handled by a specific component
 * or turbo module, use ArkTSMessageHub::Observer instead. The class
 * is expected to be instantiated in Package::createArkTSMessageHandlers.
 */
class ArkTSMessageHandler {
 public:
  using Shared = std::shared_ptr<ArkTSMessageHandler>;

  struct Context {
    std::string messageName;
    folly::dynamic messagePayload;
    std::weak_ptr<RNInstance> rnInstance;
  };

  virtual void handleArkTSMessage(const Context& ctx) = 0;
};
} // namespace rnoh