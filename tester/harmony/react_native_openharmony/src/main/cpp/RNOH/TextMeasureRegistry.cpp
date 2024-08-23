#include "TextMeasureRegistry.h"
#include "ArkUITypography.h"
#include "TextMeasureCache.h"

TextMeasureRegistry& TextMeasureRegistry::getTextMeasureRegistry() {
  static TextMeasureRegistry TextMeasureRegistry;
  return TextMeasureRegistry;
}

void TextMeasureRegistry::setTextMeasureInfo(
    const std::string& key,
    std::shared_ptr<TextMeasureInfo> measureInfo,
    facebook::react::TextMeasureCacheKey& cacheKey) {
  std::lock_guard<std::mutex> lock(m_mutex);
  m_textMeasureInfoCache.set(cacheKey, measureInfo);
  m_keyToMeasureInfo.erase(key);
  m_keyToCacheKey.erase(key);
  m_keyToMeasureInfo.emplace(key, measureInfo);
  m_keyToCacheKey.emplace(key, cacheKey);
}

rnoh::SharedStyledString TextMeasureRegistry::getTextStyledString(
    const std::string& key) {
  std::lock_guard<std::mutex> lock(m_mutex);
  auto itor = m_keyToMeasureInfo.find(key);
  if (itor != m_keyToMeasureInfo.end()) {
    return itor->second->typography.getStyledString();
  }
  return nullptr;
}

std::shared_ptr<TextMeasureInfo> TextMeasureRegistry::getTextMeasureInfo(
    const facebook::react::TextMeasureCacheKey& cacheKey) {
  std::lock_guard<std::mutex> lock(m_mutex);
  std::shared_ptr<TextMeasureInfo> measureInfo;
  auto itor = m_textMeasureInfoCache.find(cacheKey);
  if (itor != m_textMeasureInfoCache.end()) {
    measureInfo = itor->second;
  }
  return measureInfo;
}

std::optional<std::shared_ptr<TextMeasureInfo>>
TextMeasureRegistry::getTextMeasureInfoByKey(const std::string& key) {
  std::lock_guard<std::mutex> lock(m_mutex);
  std::optional<std::shared_ptr<TextMeasureInfo>> measureInfo = std::nullopt;
  auto itor = m_keyToMeasureInfo.find(key);
  if (itor != m_keyToMeasureInfo.end()) {
    measureInfo = itor->second;
  }
  return measureInfo;
}

void TextMeasureRegistry::eraseTextMeasureInfo(const std::string& key) {
  std::lock_guard<std::mutex> lock(m_mutex);
  if (m_keyToMeasureInfo.find(key) != m_keyToMeasureInfo.end()) {
    m_keyToMeasureInfo.erase(key);
    m_keyToCacheKey.erase(key);
  }
}
