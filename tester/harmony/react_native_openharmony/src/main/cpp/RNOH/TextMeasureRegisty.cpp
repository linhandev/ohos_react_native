//
// Created on 2024/5/9.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#include "TextMeasureRegisty.h"
#include "TextMeasureCache.h"

TextMeasureRegisty& TextMeasureRegisty::getTextMeasureRegisty() {
  static TextMeasureRegisty textMeasureRegisty;
  return textMeasureRegisty;
}

void TextMeasureRegisty::setTextMeasureInfo(int tag, TextMeasureInfo& measureInfo, facebook::react::TextMeasureCacheKey& cacheKey) {
  if (m_textMeasureInfo.find(tag) != m_textMeasureInfo.end()) {
    m_oldTextMeasureInfo.emplace(tag, std::move(m_textMeasureInfo.at(tag)));
    m_textMeasureInfo.erase(tag);
  }
  m_textMeasureInfo.emplace(tag, std::move(measureInfo));
  m_textMeasureCache.erase(tag);
  m_textMeasureCache.emplace(tag, cacheKey);
}

ArkUI_StyledString* TextMeasureRegisty::getTextStyledString(int tag) {
  if (m_textMeasureInfo.find(tag) != m_textMeasureInfo.end()) {
    return m_textMeasureInfo.at(tag).builder.getTextStyleString();
  }
  return nullptr;
}

facebook::react::TextMeasurement TextMeasureRegisty::getTextMeasurement(int tag) {
  auto typography =  m_textMeasureInfo.at(tag).typography;
  return {{.width = typography.getLongestLineWidth() + 0.5, .height = typography.getHeight()}, typography.getAttachments()};
}

bool TextMeasureRegisty::isTextTypographyExist(int tag, facebook::react::TextMeasureCacheKey& cacheKey) {
  if (m_textMeasureCache.find(tag) != m_textMeasureCache.end()) {
    return m_textMeasureCache.at(tag) == cacheKey;
  }
  return false;
}

void TextMeasureRegisty::eraseTextMeasureInfo(int tag) {
  if (m_textMeasureInfo.find(tag) != m_textMeasureInfo.end()) {
    for (auto& textStyle : m_textMeasureInfo.at(tag).builder.getTextStyles()) {
      OH_Drawing_DestroyTextStyle(textStyle);
      textStyle = nullptr;
    }
    OH_ArkUI_StyledString_Destroy(m_textMeasureInfo.at(tag).builder.getTextStyleString());
    OH_Drawing_DestroyTypography(m_textMeasureInfo.at(tag).typography.getTypography());
    OH_Drawing_DestroyTypographyStyle(m_textMeasureInfo.at(tag).builder.getTextTypographyStyle());
    m_textMeasureInfo.erase(tag);
  }
}

void TextMeasureRegisty::eraseOldTextMeasureInfo(int tag) {
  if (m_oldTextMeasureInfo.find(tag) != m_oldTextMeasureInfo.end()) {
    for (auto& textStyle : m_oldTextMeasureInfo.at(tag).builder.getTextStyles()) {
      OH_Drawing_DestroyTextStyle(textStyle);
      textStyle = nullptr;
    }
    OH_ArkUI_StyledString_Destroy(m_oldTextMeasureInfo.at(tag).builder.getTextStyleString());
    OH_Drawing_DestroyTypography(m_oldTextMeasureInfo.at(tag).typography.getTypography());
    OH_Drawing_DestroyTypographyStyle(m_oldTextMeasureInfo.at(tag).builder.getTextTypographyStyle());
    m_oldTextMeasureInfo.erase(tag);
  }
}