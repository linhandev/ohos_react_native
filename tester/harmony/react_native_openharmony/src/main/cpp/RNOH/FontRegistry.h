#pragma once
#include <native_drawing/drawing_font_collection.h>
#include <rawfile/raw_file_manager.h>
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
  std::weak_ptr<NativeResourceManager> m_weakResourceManager;
  std::unordered_map<std::string, std::vector<uint8_t>>
      m_fontFileContentByFontFamily;
  std::mutex m_fontFileContentByFontFamilyMtx;
  ThreadGuard m_threadGuard;

 public:
  using Shared = std::shared_ptr<FontRegistry>;

  FontRegistry(std::weak_ptr<NativeResourceManager> weakResourceManager);

  void registerFont(const std::string& name, const std::string& fontFilePath);

  /**
   * @threadSafe
   */
  SharedFontCollection getFontCollection();
};
} // namespace rnoh
