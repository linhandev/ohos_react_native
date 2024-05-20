//
// Created on 2024/5/9.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#ifndef HARMONY_TEXTMEASUREREGISTY_H
#define HARMONY_TEXTMEASUREREGISTY_H

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
  rnoh::ArkUITypographyBuilder builder;
  rnoh::ArkUITypography typography;
};

class TextMeasureRegisty {
public:
  static TextMeasureRegisty& getTextMeasureRegisty();
  void setTextMeasureInfo(int tag, TextMeasureInfo& textMeasureInfo, facebook::react::TextMeasureCacheKey& key);
  ArkUI_StyledString* getTextStyledString(int tag);
  void eraseTextMeasureInfo(int tag);
  void eraseOldTextMeasureInfo(int tag);
  bool isTextTypographyExist(int tag, facebook::react::TextMeasureCacheKey& cacheKey);
  facebook::react::TextMeasurement getTextMeasurement(int tag);

private:
  std::map<int, TextMeasureInfo> m_textMeasureInfo;
  std::map<int, facebook::react::TextMeasureCacheKey> m_textMeasureCache;
  std::map<int, TextMeasureInfo> m_oldTextMeasureInfo;
};




#endif //HARMONY_TEXTMEASUREREGISTY_H