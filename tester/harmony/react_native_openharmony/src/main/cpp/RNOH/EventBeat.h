#include <ReactCommon/RuntimeExecutor.h>
#include <react/renderer/core/EventBeat.h>
#include <react/renderer/debug/SystraceSection.h>
#include "RNOH/TaskExecutor/TaskExecutor.h"

namespace rnoh {

class EventBeat : public facebook::react::EventBeat {
 public:
  EventBeat(
      facebook::react::RuntimeExecutor runtimeExecutor,
      SharedOwnerBox ownerBox)
      : m_runtimeExecutor(runtimeExecutor),
        facebook::react::EventBeat(ownerBox) {}

  void induce() const override {
    facebook::react::SystraceSection s("#RNOH::EventBeat::induce");
    if (!this->isRequested_) {
      return;
    }

    this->m_runtimeExecutor(
        [this](facebook::jsi::Runtime& runtime) { beat(runtime); });
  }

  void request() const override {
    facebook::react::SystraceSection s("#RNOH::EventBeat::request");
    facebook::react::EventBeat::request();
    induce();
  }

  ~EventBeat() override = default;

 private:
  facebook::react::RuntimeExecutor m_runtimeExecutor;
};

} // namespace rnoh