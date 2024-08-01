#include <jsinspector/InspectorInterfaces.h>
#include <string>
#include "RNOH/ArkJS.h"

namespace rnoh {

class RemoteConnection : public facebook::react::IRemoteConnection {
 public:
  RemoteConnection(napi_env env, napi_value connection);
  ~RemoteConnection() override;

  void onMessage(std::string message) override;
  void onDisconnect() override;

 private:
  napi_env m_env;
  NapiRef m_connectionRef;
};

napi_value getInspectorWrapper(napi_env env, napi_callback_info info);

} // namespace rnoh
