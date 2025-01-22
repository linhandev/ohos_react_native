/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */
export const RNOHOther = `#include <memory>
#include <string>
#include <array>
#include <vector>
#include <react/renderer/components/rncore/Props.h>
#include <react/renderer/core/propsConversions.h>
#include <react/renderer/components/rncore/EventEmitters.h>

namespace facebook {
    namespace react {
        extern const char ModalHostViewComponentName[] = "ModalHostView";
        extern const char ActivityIndicatorViewComponentName[] = "ActivityIndicatorView";
        extern const char PullToRefreshViewComponentName[] = "PullToRefreshView";
        extern const char SwitchComponentName[] = "Switch";

        ActivityIndicatorViewProps::ActivityIndicatorViewProps(const PropsParserContext &context,
                                                               const ActivityIndicatorViewProps &sourceProps,
                                                               const RawProps &rawProps)
            : ViewProps(context, sourceProps, rawProps),
              hidesWhenStopped(
                  convertRawProp(context, rawProps, "hidesWhenStopped", sourceProps.hidesWhenStopped, {false})),
              animating(convertRawProp(context, rawProps, "animating", sourceProps.animating, {false})),
              color(convertRawProp(context, rawProps, "color", sourceProps.color, {})),
              size(convertRawProp(context, rawProps, "size", sourceProps.size, {ActivityIndicatorViewSize::Small})) {}

        PullToRefreshViewProps::PullToRefreshViewProps(const PropsParserContext &context,
                                                       const PullToRefreshViewProps &sourceProps,
                                                       const RawProps &rawProps)
            : ViewProps(context, sourceProps, rawProps),
              tintColor(convertRawProp(context, rawProps, "tintColor", sourceProps.tintColor, {})),
              titleColor(convertRawProp(context, rawProps, "titleColor", sourceProps.titleColor, {})),
              title(convertRawProp(context, rawProps, "title", sourceProps.title, {})),
              progressViewOffset(
                  convertRawProp(context, rawProps, "progressViewOffset", sourceProps.progressViewOffset, {0.0})),
              refreshing(convertRawProp(context, rawProps, "refreshing", sourceProps.refreshing, {false})) {}

        SwitchProps::SwitchProps(const PropsParserContext &context, const SwitchProps &sourceProps,
                                 const RawProps &rawProps)
            : ViewProps(context, sourceProps, rawProps),

              disabled(convertRawProp(context, rawProps, "disabled", sourceProps.disabled, {false})),
              value(convertRawProp(context, rawProps, "value", sourceProps.value, {false})),
              tintColor(convertRawProp(context, rawProps, "tintColor", sourceProps.tintColor, {})),
              onTintColor(convertRawProp(context, rawProps, "onTintColor", sourceProps.onTintColor, {})),
              thumbTintColor(convertRawProp(context, rawProps, "thumbTintColor", sourceProps.thumbTintColor, {})),
              thumbColor(convertRawProp(context, rawProps, "thumbColor", sourceProps.thumbColor, {})),
              trackColorForFalse(
                  convertRawProp(context, rawProps, "trackColorForFalse", sourceProps.trackColorForFalse, {})),
              trackColorForTrue(
                  convertRawProp(context, rawProps, "trackColorForTrue", sourceProps.trackColorForTrue, {})) {}

        ModalHostViewProps::ModalHostViewProps(const PropsParserContext &context, const ModalHostViewProps &sourceProps,
                                               const RawProps &rawProps)
            : ViewProps(context, sourceProps, rawProps),
              animationType(convertRawProp(context, rawProps, "animationType", sourceProps.animationType,
                                           {ModalHostViewAnimationType::None})),
              presentationStyle(convertRawProp(context, rawProps, "presentationStyle", sourceProps.presentationStyle,
                                               {ModalHostViewPresentationStyle::FullScreen})),
              transparent(convertRawProp(context, rawProps, "transparent", sourceProps.transparent, {false})),
              statusBarTranslucent(
                  convertRawProp(context, rawProps, "statusBarTranslucent", sourceProps.statusBarTranslucent, {false})),
              hardwareAccelerated(
                  convertRawProp(context, rawProps, "hardwareAccelerated", sourceProps.hardwareAccelerated, {false})),
              visible(convertRawProp(context, rawProps, "visible", sourceProps.visible, {false})),
              animated(convertRawProp(context, rawProps, "animated", sourceProps.animated, {false})),
              supportedOrientations(convertRawProp(
                  context, rawProps, "supportedOrientations", sourceProps.supportedOrientations,
                  {static_cast<ModalHostViewSupportedOrientationsMask>(ModalHostViewSupportedOrientations::Portrait)})),
              identifier(convertRawProp(context, rawProps, "identifier", sourceProps.identifier, {0})) {}

        void PullToRefreshViewEventEmitter::onRefresh(OnRefresh event) const {
            dispatchEvent("refresh", [](jsi::Runtime &runtime) {
                auto payload = jsi::Object(runtime);
                return payload;
            });
        }
        void SwitchEventEmitter::onChange(OnChange event) const {
            dispatchEvent("change", [event = std::move(event)](jsi::Runtime &runtime) {
                auto payload = jsi::Object(runtime);
                payload.setProperty(runtime, "value", event.value);
                payload.setProperty(runtime, "target", event.target);
                return payload;
            });
        }
        void ModalHostViewEventEmitter::onRequestClose(OnRequestClose event) const {
            dispatchEvent("requestClose", [](jsi::Runtime &runtime) {
                auto payload = jsi::Object(runtime);
                return payload;
            });
        }
        void ModalHostViewEventEmitter::onShow(OnShow event) const {
            dispatchEvent("show", [](jsi::Runtime &runtime) {
                auto payload = jsi::Object(runtime);
                return payload;
            });
        }
        void ModalHostViewEventEmitter::onDismiss(OnDismiss event) const {
            dispatchEvent("dismiss", [](jsi::Runtime &runtime) {
                auto payload = jsi::Object(runtime);
                return payload;
            });
        }
    } // namespace react
} // namespace facebook
`;

export const BuildProfile = {
  apiType: "stageMode",
  targets: [
    {
      name: "default",
      runtimeOS: "HarmonyOS",
    }
  ]
};

export const BuildOptionSetOfRelease = [
  {
    name: "release",
    externalNativeOptions: {
      path: "./src/main/cpp/CMakeLists.txt",
      arguments: "",
      cppFlags: ""
    },
    nativeLib: {
      headerPath: ["./src/main/cpp/include"],
      librariesInfo: [
        {
          name: "librnoh_semi.so",
          linkLibraries: [
            "libace_napi.z.so",
            "libace_ndk.z.so",
            "librawfile.z.so",
            "libhilog_ndk.z.so",
            "libnative_vsync.so",
            "libnative_drawing.so",
            "libhitrace_ndk.z.so",
            "libqos.so",
            "react-native-openharmony::jsi",
            "react-native-openharmony::react_debug",
            "react-native-openharmony::react_render_attributedstring",
            "react-native-openharmony::react_nativemodule_core",
            "react-native-openharmony::react_render_componentregistry",
            "react-native-openharmony::react_render_core",
            "react-native-openharmony::react_render_debug",
            "react-native-openharmony::react_render_graphics",
            "react-native-openharmony::react_render_imagemanager",
            "react-native-openharmony::react_render_mapbuffer",
            "react-native-openharmony::rrc_image",
            "react-native-openharmony::rrc_text",
            "react-native-openharmony::rrc_textinput",
            "react-native-openharmony::rrc_scrollview",
            "react-native-openharmony::rrc_view",
            "react-native-openharmony::runtimeexecutor"
          ]
        }
      ]
    }
  }
];

export const BuildOptionSetOfABC = BuildOptionSetOfRelease.map(item => {
  return {
    ...item,
    arkOptions: {
      byteCodeHar: true,
    }
  };
});
