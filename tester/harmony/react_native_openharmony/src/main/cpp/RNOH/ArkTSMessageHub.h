#pragma once

#include "ArkTSMessageHandler.h"
#include "Subject.h"

namespace rnoh {

/**
 * @api
 */
struct ArkTSMessage {
  std::string name;
  folly::dynamic payload;
};

/**
 * @api
 */
class ArkTSMessageHub final : public ArkTSMessageHandler,
                              public Subject<ArkTSMessage> {
 public:
  using Shared = std::shared_ptr<ArkTSMessageHub>;
  using Weak = std::weak_ptr<ArkTSMessageHub>;

  /**
   * @api
   * @thread: MAIN
   * Inherit this class and override `onMessageReceived` if a
   * CppComponentInstance or TurboModule should handle a message ArkTSMessage.
   * If neither CppComponentInstance nor TurboModule is the appropriate
   * recipient, use ArkTSMessageHandler instead.
   */
  class Observer : private Subject::Observer {
   public:
    Observer(ArkTSMessageHub::Shared const& subject)
        : Subject::Observer(std::static_pointer_cast<Subject>(subject)) {}

    virtual void onMessageReceived(ArkTSMessage const& payload) = 0;

   protected:
    /**
     * @internal
     */
    void onUpdate(ArkTSMessage const& payload) final {
      onMessageReceived(payload);
    }
  };

  /**
   * @internal
   */
  void handleArkTSMessage(const Context& ctx) override {
    notifyObservers({ctx.messageName, ctx.messagePayload});
  }
};

} // namespace rnoh