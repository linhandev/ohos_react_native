#include "SwitchComponentInstance.h"

#include <glog/logging.h>
#include <react/renderer/components/rncore/Props.h>
#include <react/renderer/components/rncore/States.h>
#include <react/renderer/core/ConcreteState.h>
#include <sstream>

namespace rnoh {

SwitchComponentInstance::SwitchComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  m_toggleNode.setToggleNodeDelegate(this);
}

void SwitchComponentInstance::onPropsChanged(SharedConcreteProps const& props) {
  CppComponentInstance::onPropsChanged(props);
  if (!m_props || props->onTintColor != m_props->onTintColor) {
    m_toggleNode.setSelectedColor(props->onTintColor);
  }
  if (!m_props || props->tintColor != m_props->tintColor) {
    m_toggleNode.setUnselectedColor(props->tintColor);
  }
  if (!m_props || props->thumbTintColor != m_props->thumbTintColor) {
    m_toggleNode.setThumbColor(props->thumbTintColor);
  }
  m_toggleNode.setEnabled(!props->disabled);
  if (props->rawProps.count("focusable") > 0) {
    if (!m_props ||
        props->rawProps["focusable"].asBool() !=
            m_props->rawProps["focusable"].asBool()) {
      m_toggleNode.setFocusable(props->rawProps["focusable"].asBool());
    }
  }
  if (props->value != m_toggleNode.getValue()) {
    m_toggleNode.setValue(props->value);
  }
}

ToggleNode& SwitchComponentInstance::getLocalRootArkUINode() {
  return m_toggleNode;
}

void SwitchComponentInstance::onValueChange(int32_t& value) {
  if (m_props == nullptr || m_props->value == value) {
    // NOTE: when the value is changed via props,
    // we should not send the event back
    return;
  }
  if (m_eventEmitter != nullptr) {
    auto onValueChange = facebook::react::SwitchEventEmitter::OnChange();
    int32_t tag = CppComponentInstance::getTag();
    onValueChange.value = value;
    onValueChange.target = tag;
    m_eventEmitter->onChange(onValueChange);
  }
  m_toggleNode.setValue(m_props->value);
}

} // namespace rnoh
