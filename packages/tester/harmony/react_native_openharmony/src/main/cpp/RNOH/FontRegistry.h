/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <native_drawing/drawing_font_collection.h>
#include <rawfile/raw_file_manager.h>
#include <filesystem>
#include <mutex>
#include <string>
#include "ThreadGuard.h"

namespace rnoh {

/**
 * @internal
 * OH_Drawing_FontCollection can't be shared by multiple Typographies because
 * the app crashes.
 */
using SharedFontCollection = std::shared_ptr<OH_Drawing_FontCollection>;

/**
 * @internal
 * @thread: MAIN
 */
class FontRegistry {
  static constexpr std::array<const char*, 2> THEME_PATHS{
      "/data/themes/a/app",
      "/data/themes/b/app"};
  void addFontData(const std::string& name, std::vector<uint8_t> fontData);
  std::filesystem::path findValidThemeFontPath() const;
  bool isValidThemePath(const std::filesystem::path& path) const;
  bool isValidThemeFont(const std::filesystem::directory_entry& entry) const;

  std::weak_ptr<NativeResourceManager> m_weakResourceManager;
  std::unordered_map<std::string, std::vector<uint8_t>>
      m_fontFileContentByFontFamily;
  std::mutex m_fontFileContentByFontFamilyMtx;
  ThreadGuard m_threadGuard;
  std::mutex m_fontCollectionMtx;
  SharedFontCollection m_fontCollection;
  std::mutex m_themeFontFamilyNameMtx;
  std::string m_themeFontFamilyName;

 public:
  using Shared = std::shared_ptr<FontRegistry>;

  FontRegistry(std::weak_ptr<NativeResourceManager> weakResourceManager);

  void registerFont(const std::string& name, const std::string& fontFilePath);

  /**
   * @threadSafe
   */
  SharedFontCollection getFontCollection();

  /**
   * @threadSafe
   */
  std::string getThemeFontFamily();

  /**
   * @threadSafe
   */
  void updateThemeFont();
};
} // namespace rnoh
