//
// Created on 2024/5/9.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#ifndef HARMONY_TEXTMEASUREREGISTRY_H
#define HARMONY_TEXTMEASUREREGISTRY_H

#include <map>
#include "RNOH/ArkUITypography.h"
#include "TextMeasureCache.h"
#include <arkui/styled_string.h>

struct TextMeasureInfo {
  TextMeasureInfo();
  TextMeasureInfo(rnoh::ArkUITypographyBuilder builder,
    rnoh::ArkUITypography tmpTypography) : 
    builder(std::move(builder)),
    typography(tmpTypography) {}
  ~TextMeasureInfo() {
    for (auto& textStyle : this->builder.getTextStyles()) {
      OH_Drawing_DestroyTextStyle(textStyle);
      textStyle = nullptr;
    }
    OH_Drawing_DestroyTypography(this->typography.getTypography());
    OH_ArkUI_StyledString_Destroy(this->builder.getTextStyleString());
    OH_Drawing_DestroyTypographyStyle(this->builder.getTextTypographyStyle());
  }
  rnoh::ArkUITypographyBuilder builder;
  rnoh::ArkUITypography typography;
};

class TextMeasureRegistry {
public:
  static TextMeasureRegistry& getTextMeasureRegistry();
  void setTextMeasureInfo(const std::string& key, std::shared_ptr<TextMeasureInfo> textMeasureInfo, facebook::react::TextMeasureCacheKey& cacheKey);
  ArkUI_StyledString* getTextStyledString(const std::string& key);
  void eraseTextMeasureInfo(const std::string& key);
  void eraseOldTextMeasureInfo(const std::string& key);
  std::optional<std::shared_ptr<TextMeasureInfo>> getTextMeasureInfo(const facebook::react::TextMeasureCacheKey& cacheKey);

 private:

  std::map<std::string, facebook::react::TextMeasureCacheKey> m_keyToCacheKey; // saved which cacheKey using by key

  std::map<std::string, std::shared_ptr<TextMeasureInfo>> m_keyToMeasureInfo; // saved which measureInfo using by key

  mutable folly::EvictingCacheMap<facebook::react::TextMeasureCacheKey, std::shared_ptr<TextMeasureInfo>>
    m_textMeasureInfoCache{facebook::react::kSimpleThreadSafeCacheSizeCap}; // cached all measure result

  std::map<std::string, std::shared_ptr<TextMeasureInfo>> m_oldTextMeasureInfo; // saved old measureInfo, will be deleted after set new info to CAPI

  std::recursive_mutex m_mutex;
};




#endif //HARMONY_TEXTMEASUREREGISTRY_H