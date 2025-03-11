/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "FontRegistry.h"
#include <glog/logging.h>
#include <native_drawing/drawing_register_font.h>
#include <rawfile/raw_file_manager.h>
#include <fstream>
#include <mutex>
#include <string_view>
#include "RNOHError.h"

using namespace rnoh;

std::vector<uint8_t> readRawFile(
    NativeResourceManager* resourceManager,
    std::string const& rawfileRelativeFontFilePath) {
  auto fontFile =
      std::unique_ptr<RawFile, decltype(&OH_ResourceManager_CloseRawFile)>(
          OH_ResourceManager_OpenRawFile(
              resourceManager, rawfileRelativeFontFilePath.c_str()),
          OH_ResourceManager_CloseRawFile);
  if (!fontFile) {
    throw RNOHError(
        "Failed to open font fontFile: " + rawfileRelativeFontFilePath);
  }
  auto length = OH_ResourceManager_GetRawFileSize(fontFile.get());
  std::vector<uint8_t> buffer(length);
  if (OH_ResourceManager_ReadRawFile(fontFile.get(), buffer.data(), length) !=
      length) {
    throw RNOHError("Failed to read font file: " + rawfileRelativeFontFilePath);
  }
  return buffer;
}

std::vector<uint8_t> readSandboxFile(std::string const& absoluteFontFilePath) {
  std::ifstream fontFile(absoluteFontFilePath, std::ifstream::binary);
  if (!fontFile.is_open()) {
    throw RNOHError("Failed to read font file: " + absoluteFontFilePath);
  }
  fontFile.seekg(0, std::ios::end);
  auto length = fontFile.tellg();
  fontFile.seekg(0, std::ios::beg);
  std::vector<uint8_t> buffer(length);
  fontFile.read(reinterpret_cast<char*>(buffer.data()), length);
  return buffer;
}

FontRegistry::FontRegistry(
    std::weak_ptr<NativeResourceManager> weakResourceManager)
    : m_weakResourceManager(std::move(weakResourceManager)) {}

void FontRegistry::registerFont(
    const std::string& name,
    const std::string& fontFilePath) {
  m_threadGuard.assertThread();
  auto resourceManager = m_weakResourceManager.lock();
  if (resourceManager == nullptr) {
    LOG(ERROR) << "Couldn't register font " << name
               << " — resourceManager is nullptr";
    return;
  };
  auto fontData = fontFilePath[0] == '/'
      ? readSandboxFile(fontFilePath)
      : readRawFile(resourceManager.get(), fontFilePath);
  auto lock = std::lock_guard(m_fontFileContentByFontFamilyMtx);
  m_fontFileContentByFontFamily.emplace(name, std::move(fontData));
  // NOTE: fonts cannot be added to an existing collection, so we need to
  // recreate it the next time `getFontCollection` is called
  auto fontCollectionLock = std::lock_guard(m_fontCollectionMtx);
  m_fontCollection.reset();
}

SharedFontCollection FontRegistry::getFontCollection() {
  auto lockFontCollection = std::lock_guard(m_fontCollectionMtx);
  if (m_fontCollection) {
    return m_fontCollection;
  }
  SharedFontCollection fontCollection(
      OH_Drawing_CreateSharedFontCollection(),
      OH_Drawing_DestroyFontCollection);
  auto lock = std::lock_guard(m_fontFileContentByFontFamilyMtx);
  for (auto& [name, fileContent] : m_fontFileContentByFontFamily) {
    OH_Drawing_RegisterFontBuffer(
        fontCollection.get(),
        name.c_str(),
        fileContent.data(),
        fileContent.size());
  }
  m_fontCollection = fontCollection;
  return fontCollection;
}
