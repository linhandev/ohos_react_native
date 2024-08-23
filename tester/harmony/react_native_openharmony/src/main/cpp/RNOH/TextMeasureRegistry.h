#pragma once

#include <arkui/styled_string.h>
#include <react/renderer/textlayoutmanager/TextMeasureCache.h>
#include <map>
#include <mutex>
#include "RNOH/ArkUITypography.h"

struct TextMeasureInfo {
  TextMeasureInfo();
  TextMeasureInfo(rnoh::ArkUITypography tmpTypography)
      : typography(std::move(tmpTypography)) {}
  rnoh::ArkUITypography typography;
};

class TextMeasureRegistry {
 public:
  static TextMeasureRegistry& getTextMeasureRegistry();
  void setTextMeasureInfo(
      const std::string& key,
      std::shared_ptr<TextMeasureInfo> textMeasureInfo,
      facebook::react::TextMeasureCacheKey& cacheKey);
  rnoh::SharedStyledString getTextStyledString(const std::string& key);
  std::optional<std::shared_ptr<TextMeasureInfo>> getTextMeasureInfoByKey(
      const std::string& key);
  void eraseTextMeasureInfo(const std::string& key);
  std::shared_ptr<TextMeasureInfo> getTextMeasureInfo(
      const facebook::react::TextMeasureCacheKey& cacheKey);

 private:
  std::unordered_map<std::string, facebook::react::TextMeasureCacheKey>
      m_keyToCacheKey; // saved which cacheKey using by key

  std::unordered_map<std::string, std::shared_ptr<TextMeasureInfo>>
      m_keyToMeasureInfo; // saved which measureInfo using by key

  mutable folly::EvictingCacheMap<
      facebook::react::TextMeasureCacheKey,
      std::shared_ptr<TextMeasureInfo>>
      m_textMeasureInfoCache{
          facebook::react::kSimpleThreadSafeCacheSizeCap}; // cached all measure
                                                           // result
  std::mutex m_mutex;
};
