//
// Created on 2024/5/9.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#include "TextMeasureRegistry.h"
#include "TextMeasureCache.h"

TextMeasureRegistry& TextMeasureRegistry::getTextMeasureRegistry() {
  static TextMeasureRegistry TextMeasureRegistry;
  return TextMeasureRegistry;
}

void TextMeasureRegistry::setTextMeasureInfo(const std::string& key, std::shared_ptr<TextMeasureInfo> measureInfo, facebook::react::TextMeasureCacheKey& cacheKey) {
  if (m_keyToMeasureInfo.find(key) != m_keyToMeasureInfo.end()) {
    const auto& oldCacheKey = m_keyToCacheKey.at(key);
    if (cacheKey == oldCacheKey) {
      return;
    }
    m_oldTextMeasureInfo.emplace(key, m_keyToMeasureInfo.at(key));
  }
  m_textMeasureInfoCache.set(cacheKey, measureInfo);
  m_keyToMeasureInfo.erase(key);
  m_keyToCacheKey.erase(key);
  m_keyToMeasureInfo.emplace(key, measureInfo);
  m_keyToCacheKey.emplace(key, cacheKey);
}

ArkUI_StyledString* TextMeasureRegistry::getTextStyledString(const std::string& key) {
  auto itor = m_keyToMeasureInfo.find(key);
  if (itor != m_keyToMeasureInfo.end()) {
    return itor->second->builder.getTextStyleString();
  }
  return nullptr;
}

std::optional<std::shared_ptr<TextMeasureInfo>> TextMeasureRegistry::getTextMeasureInfo(const facebook::react::TextMeasureCacheKey& cacheKey) {
  std::optional<std::shared_ptr<TextMeasureInfo>> measureInfo = std::nullopt;
  auto itor = m_textMeasureInfoCache.find(cacheKey);
  if (itor != m_textMeasureInfoCache.end()) {
    measureInfo = itor->second;
  }
  return measureInfo;
}

void TextMeasureRegistry::eraseTextMeasureInfo(const std::string& key) {
  if (m_keyToMeasureInfo.find(key) != m_keyToMeasureInfo.end()) {
    m_keyToMeasureInfo.erase(key);
    m_keyToCacheKey.erase(key);
  }
}

void TextMeasureRegistry::eraseOldTextMeasureInfo(const std::string& key) {
  if (m_oldTextMeasureInfo.find(key) != m_oldTextMeasureInfo.end()) {
    m_oldTextMeasureInfo.erase(key);
  }
}