#include "ImageComponentInstance.h"
#include <RNOH/RNInstanceInternal.h>
#include <react/renderer/components/image/ImageProps.h>
#include <react/renderer/components/image/ImageState.h>
#include <react/renderer/core/ConcreteState.h>
#include <sstream>
#include <string_view>

namespace rnoh {

using namespace std::literals;
constexpr std::string_view ASSET_PREFIX = "asset://"sv;
constexpr std::string_view RAWFILE_PREFIX = "resource://RAWFILE/assets/";
constexpr std::string_view FILE_PREFIX = "file://";

ImageComponentInstance::ImageComponentInstance(Context context)
    : CppComponentInstance(std::move(context)),
      ImageSourceResolver::ImageSourceUpdateListener(
          m_deps->imageSourceResolver) {
  this->getLocalRootArkUINode().setNodeDelegate(this);
  this->getLocalRootArkUINode().setInterpolation(
      ARKUI_IMAGE_INTERPOLATION_HIGH);
  this->getLocalRootArkUINode().setDraggable(false);
}

std::string ImageComponentInstance::resolveSourceWithAssetPrefix(
    std::string const& imageUri) {
  auto assetsPrefix = this->getAssetsPrefix();
  auto imageSource = assetsPrefix + imageUri.substr(ASSET_PREFIX.size());
  return imageSource;
}

void ImageComponentInstance::setSources(
    facebook::react::ImageSources const& sources) {
  auto newSources =
      m_deps->imageSourceResolver->resolveImageSources(*this, sources);

  if (!newSources.empty()) {
    std::string imageSource = newSources[0].uri;

    if (imageSource.rfind(ASSET_PREFIX, 0) == 0) {
      std::string assetsPrefix = this->getAssetsPrefix();
      imageSource = assetsPrefix + imageSource.substr(ASSET_PREFIX.size());
    }

    this->getLocalRootArkUINode().setSource(imageSource);
  } else {
    this->getLocalRootArkUINode().resetSource();
  }
}

void ImageComponentInstance::onEventEmitterChanged(
    SharedConcreteEventEmitter const& eventEmitter) {
  if (m_eventEmitter == eventEmitter || eventEmitter == nullptr ||
      m_scheduledEvents.empty()) {
    return;
  }
  m_eventEmitter = eventEmitter;
  for (auto& event : m_scheduledEvents) {
    dispatchEvent(event.eventType, event.payloadFactory);
  }
  m_scheduledEvents.clear();
}

void ImageComponentInstance::dispatchOrScheduleEvent(
    EventType eventType,
    const ValueFactory& payloadFactory) {
  if (!m_eventEmitter) {
    m_scheduledEvents.push_back({eventType, payloadFactory});
    return;
  }
  dispatchEvent(eventType, payloadFactory);
}

void ImageComponentInstance::dispatchEvent(
    EventType eventType,
    const ValueFactory& payloadFactory) {
  std::string eventTypeString;
  switch (eventType) {
    case EventType::ON_LOAD_START:
      eventTypeString = "loadStart";
      break;
    case EventType::ON_LOAD:
      eventTypeString = "load";
      break;
    case EventType::ON_LOAD_END:
      eventTypeString = "loadEnd";
      break;
    case EventType::ON_PROGRESS:
      eventTypeString = "progress";
      break;
    case EventType::ON_ERROR:
      eventTypeString = "error";
      break;
    case EventType::ON_PARTIAL_LOAD:
      eventTypeString = "partialLoad";
      break;
  }
  m_eventEmitter->dispatchEvent(eventTypeString, payloadFactory);
}

void ImageComponentInstance::onPropsChanged(SharedConcreteProps const& props) {
  CppComponentInstance::onPropsChanged(props);

  auto rawProps = ImageRawProps::getFromDynamic(props->rawProps);

  if (m_props->sources != props->sources) {
    setSources(props->sources);
    dispatchOrScheduleEvent(EventType::ON_LOAD_START);
  }

  if (m_props->tintColor != props->tintColor) {
    this->getLocalRootArkUINode().setTintColor(props->tintColor);
  }

  if (m_props->blurRadius != props->blurRadius) {
    this->getLocalRootArkUINode().setBlur(props->blurRadius);
  }

  if (m_props->resizeMode != props->resizeMode) {
    this->getLocalRootArkUINode().setObjectRepeat(props->resizeMode);
    this->getLocalRootArkUINode().setResizeMode(props->resizeMode);
  }

  if (m_props->defaultSources != props->defaultSources) {
    if (!(props->defaultSources.empty())) {
      this->getLocalRootArkUINode().setAlt(
          this->resolveSourceWithAssetPrefix(props->defaultSources[0].uri));
    }
  }

  if (m_rawProps.loadingIndicatorSource != rawProps.loadingIndicatorSource) {
    m_rawProps.loadingIndicatorSource = rawProps.loadingIndicatorSource;
    if (m_rawProps.loadingIndicatorSource.has_value()) {
      this->getLocalRootArkUINode().setAlt(this->resolveSourceWithAssetPrefix(
          m_rawProps.loadingIndicatorSource.value()));
    }
  }

  if (m_props->capInsets != props->capInsets) {
    this->getLocalRootArkUINode().setCapInsets(
        props->capInsets, m_layoutMetrics.pointScaleFactor);
  }

  if (m_rawProps.fadeDuration != rawProps.fadeDuration) {
    m_rawProps.fadeDuration = rawProps.fadeDuration;
    if (m_rawProps.fadeDuration.has_value()) {
      this->getLocalRootArkUINode().setFadeDuration(
          m_rawProps.fadeDuration.value());
    } else {
      // reset if no value passed
      this->getLocalRootArkUINode().setFadeDuration(0);
    }
  }

  if (m_rawProps.resizeMethod != rawProps.resizeMethod) {
    m_rawProps.resizeMethod = rawProps.resizeMethod;
    if (m_rawProps.resizeMethod.has_value()) {
      this->getLocalRootArkUINode().setResizeMethod(
          m_rawProps.resizeMethod.value());
    } else {
      this->getLocalRootArkUINode().resetResizeMethod();
    }
  }

  if (m_rawProps.focusable != rawProps.focusable) {
    m_rawProps.focusable = rawProps.focusable;
    if (m_rawProps.focusable.has_value()) {
      this->getLocalRootArkUINode().setFocusable(m_rawProps.focusable.value());
    } else {
      this->getLocalRootArkUINode().resetFocusable();
    }
  }

  if (m_rawProps.alt != rawProps.alt) {
    m_rawProps.alt = rawProps.alt;
    if (m_rawProps.alt.has_value()) {
      this->getLocalRootArkUINode().setAccessibilityText(
          m_rawProps.alt.value());
    } else {
      this->getLocalRootArkUINode().resetAccessibilityText();
    }
  }
}

void ImageComponentInstance::onImageSourceCacheUpdate() {
  setSources({m_state->getData().getImageSource()});
}

void ImageComponentInstance::onStateChanged(SharedConcreteState const& state) {
  CppComponentInstance::onStateChanged(state);
  setSources({state->getData().getImageSource()});
  this->getLocalRootArkUINode().setBlur(state->getData().getBlurRadius());
}

ImageNode& ImageComponentInstance::getLocalRootArkUINode() {
  return m_imageNode;
}

void ImageComponentInstance::onComplete(float width, float height) {
  auto uri = this->getLocalRootArkUINode().getUri();
  dispatchOrScheduleEvent(EventType::ON_LOAD, [=](facebook::jsi::Runtime& runtime) {
    auto payload = facebook::jsi::Object(runtime);
    auto source = facebook::jsi::Object(runtime);
    source.setProperty(runtime, "width", width);
    source.setProperty(runtime, "height", height);
    source.setProperty(runtime, "uri", uri.c_str());
    payload.setProperty(runtime, "source", source);
    return payload;
  });
  dispatchOrScheduleEvent(EventType::ON_LOAD_END);
}

void ImageComponentInstance::onError(int32_t errorCode) {
  if (m_eventEmitter == nullptr) {
    return;
  }

  std::string errMsg = "error message: the image load failed, ";
  if (errorCode == 401) {
    errMsg =
        "error message: the image could not be obtained because the image path is invalid, ";
  } else if (errorCode == 103101) {
    errMsg = "error message: the image format is not supported, ";
  }

  errMsg += std::string("error code: ") + std::to_string(errorCode);
  dispatchOrScheduleEvent(EventType::ON_ERROR, [errMsg](facebook::jsi::Runtime& runtime) {
    auto payload = facebook::jsi::Object(runtime);
    auto source = facebook::jsi::Object(runtime);
    source.setProperty(runtime, "error", errMsg);
    payload.setProperty(runtime, "source", source);
    return payload;
  });
  dispatchOrScheduleEvent(EventType::ON_LOAD_END);
}

void ImageComponentInstance::onProgress(uint32_t loaded, uint32_t total) {
  dispatchOrScheduleEvent(EventType::ON_PROGRESS, [=](facebook::jsi::Runtime& runtime) {
    auto payload = facebook::jsi::Object(runtime);
    payload.setProperty(runtime, "loaded", (int32_t)loaded);
    payload.setProperty(runtime, "total", (int32_t)total);
    return payload;
  });
}

std::string ImageComponentInstance::getBundlePath() {
  auto rnInstance = m_deps->rnInstance.lock();
  RNOH_ASSERT(rnInstance != nullptr);
  return rnInstance->getBundlePath();
}

std::string ImageComponentInstance::getAssetsPrefix() {
  auto bundlePath = getBundlePath();
  auto position = bundlePath.rfind('/');

  if (position == std::string::npos) {
    return std::string(RAWFILE_PREFIX);
  }

  auto prefix = std::string(FILE_PREFIX) + bundlePath.substr(0, position + 1);
  return prefix;
}

ImageComponentInstance::ImageRawProps
ImageComponentInstance::ImageRawProps::getFromDynamic(folly::dynamic value) {
  auto resizeMethod = (value.count("resizeMethod") > 0)
      ? std::optional(value["resizeMethod"].asString())
      : std::nullopt;
  auto focusable = (value.count("focusable") > 0)
      ? std::optional(value["focusable"].asBool())
      : std::nullopt;
  auto alt = (value.count("alt") > 0) ? std::optional(value["alt"].asString())
                                      : std::nullopt;
  auto loadingIndicatorSource = (value.count("loadingIndicatorSource") > 0)
      ? std::optional(value["loadingIndicatorSource"].at("uri").getString())
      : std::nullopt;
  auto fadeDuration = (value.count("fadeDuration") > 0)
      ? std::optional(value["fadeDuration"].asInt())
      : std::nullopt;

  return {resizeMethod, focusable, alt, loadingIndicatorSource, fadeDuration};
}

} // namespace rnoh
