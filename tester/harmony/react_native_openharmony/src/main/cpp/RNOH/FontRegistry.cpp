#include "FontRegistry.h"
#include <glog/logging.h>
#include <native_drawing/drawing_register_font.h>
#include "RNOHError.h"

using namespace rnoh;

FontRegistry::FontRegistry(
    std::weak_ptr<NativeResourceManager> weakResourceManager)
    : m_weakResourceManager(std::move(weakResourceManager)) {}

void FontRegistry::registerFont(
    const std::string& name,
    const std::string& fontFilePathRelativeToRawfileDir) {
  {
    auto lock = std::lock_guard(m_fontCollectionMtx);
    RNOH_ASSERT_MSG(
        m_fontCollection == nullptr,
        "Fonts can't be registered after creating m_fontCollection'");
  }
  m_threadGuard.assertThread();
  auto resourceManager = m_weakResourceManager.lock();
  if (resourceManager == nullptr) {
    LOG(ERROR) << "Couldn't register font " << name
               << " — resourceManager is nullptr";
    return;
  };
  auto fontFile =
      std::unique_ptr<RawFile, decltype(&OH_ResourceManager_CloseRawFile)>(
          OH_ResourceManager_OpenRawFile(
              resourceManager.get(), fontFilePathRelativeToRawfileDir.c_str()),
          OH_ResourceManager_CloseRawFile);
  if (!fontFile) {
    throw RNOHError(
        "Failed to open font fontFile: " + fontFilePathRelativeToRawfileDir);
  }
  auto length = OH_ResourceManager_GetRawFileSize(fontFile.get());
  std::vector<uint8_t> buffer(length);
  if (OH_ResourceManager_ReadRawFile(fontFile.get(), buffer.data(), length) !=
      length) {
    throw RNOHError(
        "Failed to read fontFile: " + fontFilePathRelativeToRawfileDir);
  }
  auto lock = std::lock_guard(m_fontFileContentByFontNameMtx);
  m_fontFileContentByFontName.emplace(name, buffer);
}

SharedFontCollection FontRegistry::getFontCollection() {
  auto lockFontCollection = std::lock_guard(m_fontCollectionMtx);
  if (m_fontCollection) {
    return m_fontCollection;
  }
  SharedFontCollection fontCollection(
      OH_Drawing_CreateSharedFontCollection(),
      OH_Drawing_DestroyFontCollection);
  auto lock = std::lock_guard(m_fontFileContentByFontNameMtx);
  for (auto& [name, fileContent] : m_fontFileContentByFontName) {
    OH_Drawing_RegisterFontBuffer(
        fontCollection.get(),
        name.c_str(),
        fileContent.data(),
        fileContent.size());
  }
  m_fontCollection = fontCollection;
  return fontCollection;
}