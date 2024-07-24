#include "Inspector.h"

#include <glog/logging.h>
#include <memory>
#include <vector>
#include "ArkJS.h"
#include "TaskExecutor/NapiTaskRunner.h"

namespace rnoh {

static std::unique_ptr<NapiTaskRunner> mainThreadTaskRunner = nullptr;

// Constructor must always be called on the main thread
RemoteConnection::RemoteConnection(napi_env env, napi_value connection)
    : m_env(env), m_connectionRef(ArkJS(env).createNapiRef(connection)) {}

RemoteConnection::~RemoteConnection() {
  mainThreadTaskRunner->runAsyncTask([ref = std::move(m_connectionRef)] {});
}

void RemoteConnection::onMessage(std::string message) {
  mainThreadTaskRunner->runAsyncTask([env = this->m_env,
                                      ref = this->m_connectionRef,
                                      message = std::move(message)] {
    ArkJS arkJS(env);
    arkJS.getObject(ref).call<1>("onMessage", {arkJS.createString(message)});
  });
}

void RemoteConnection::onDisconnect() {
  mainThreadTaskRunner->runAsyncTask(
      [env = this->m_env, ref = this->m_connectionRef] {
        ArkJS arkJS(env);
        arkJS.getObject(ref).call<0>("onDisconnect", {});
      });
}

static napi_value wrapLocalConnection(
    napi_env env,
    std::unique_ptr<facebook::react::ILocalConnection> localConnection) {
  ArkJS arkJS(env);
  auto connectionRawPtr = localConnection.release();

  try {
    auto sendMessage = arkJS.createFunction(
        "sendMessage",
        [](auto env, auto cbInfo) {
          ArkJS arkJS(env);
          facebook::react::ILocalConnection* connection;
          size_t argc = 1;
          napi_value args[1];
          napi_get_cb_info(
              env, cbInfo, &argc, args, nullptr, (void**)&connection);
          if (argc < 1) {
            LOG(ERROR) << "sendMessage requires 1 argument";
            return arkJS.getUndefined();
          }
          auto message = arkJS.getString(args[0]);
          connection->sendMessage(message);
          return arkJS.getUndefined();
        },
        connectionRawPtr);

    auto disconnect = arkJS.createFunction(
        "disconnect",
        [](auto env, auto cbInfo) {
          facebook::react::ILocalConnection* connection;
          napi_get_cb_info(
              env, cbInfo, 0, nullptr, nullptr, (void**)&connection);
          connection->disconnect();
          delete connection;
          return ArkJS(env).getUndefined();
        },
        connectionRawPtr);

    return arkJS.createObjectBuilder()
        .addProperty("sendMessage", sendMessage)
        .addProperty("disconnect", disconnect)
        .build();
  } catch (std::exception& e) {
    LOG(ERROR) << "Failed to wrap local connection: " << e.what();
    delete connectionRawPtr;
    return arkJS.getUndefined();
  }
}

static napi_value connect(napi_env env, napi_callback_info info) {
  ArkJS arkJS(env);

  size_t argc = 2;
  napi_value args[2];
  napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
  if (argc < 2) {
    LOG(ERROR) << "connect requires 2 arguments";
    return arkJS.getUndefined();
  }
  auto pageId = static_cast<int>(arkJS.getDouble(args[0]));
  auto remoteConnection = std::make_unique<RemoteConnection>(env, args[1]);
  auto localConnection = ::facebook::react::getInspectorInstance().connect(
      pageId, std::move(remoteConnection));
  return wrapLocalConnection(env, std::move(localConnection));
}

static napi_value getPages(napi_env env, napi_callback_info info) {
  ArkJS arkJS(env);
  auto pages = ::facebook::react::getInspectorInstance().getPages();
  std::vector<napi_value> pageObjects(pages.size());
  for (size_t i = 0; i < pages.size(); i++) {
    auto page = pages[i];
    auto pageObject = arkJS.createObjectBuilder()
                          .addProperty("id", arkJS.createDouble(page.id))
                          .addProperty("title", arkJS.createString(page.title))
                          .addProperty("vm", arkJS.createString(page.vm))
                          .build();
    pageObjects[i] = pageObject;
  }
  return arkJS.createArray(pageObjects);
}

napi_value getInspectorWrapper(napi_env env, napi_callback_info info) {
  if (mainThreadTaskRunner == nullptr) {
    mainThreadTaskRunner =
        std::make_unique<NapiTaskRunner>("RNOH_MAIN_INSPECTOR", env);
  }

  ArkJS arkJS(env);
  napi_property_descriptor desc[] = {
      {"getPages",
       nullptr,
       getPages,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr},
      {"connect",
       nullptr,
       connect,
       nullptr,
       nullptr,
       nullptr,
       napi_default,
       nullptr}};
  auto obj = arkJS.createObjectBuilder().build();
  napi_define_properties(env, obj, sizeof(desc) / sizeof(desc[0]), desc);
  return obj;
}

} // namespace rnoh
