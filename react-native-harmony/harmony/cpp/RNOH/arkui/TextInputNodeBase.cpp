#include "TextInputNodeBase.h"
#include "NativeNodeApi.h"
#include "RNOH/arkui/conversions.h"

namespace rnoh {

    TextInputNodeBase::TextInputNodeBase(ArkUI_NodeType nodeType)
        : ArkUINode(NativeNodeApi::getInstance()->createNode(nodeType)) {}

    void TextInputNodeBase::setPadding(int32_t padding) {
        ArkUI_NumberValue value[] = {(float)padding};
        ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_PADDING, &item));
    }

    void TextInputNodeBase::setFocusable(bool const &focusable) {
        int32_t focusableValue = 1;
        if (!focusable) {
            focusableValue = 0;
        }
        ArkUI_NumberValue value[] = {{.i32 = focusableValue}};
        ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_FOCUSABLE, &item));
    }

    void TextInputNodeBase::setAutoFocus(bool autoFocus) {
        ArkUI_NumberValue value[] = {{.i32 = autoFocus}};
        ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_FOCUS_STATUS, &item));
    }

    void TextInputNodeBase::setResponseRegion(facebook::react::Point const &position,
                                              facebook::react::Size const &size) {
        ArkUI_NumberValue value[] = {0.0f, 0.0f, (float)size.width, (float)size.height};
        ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_RESPONSE_REGION, &item));
    }

    void TextInputNodeBase::setFocusStatus(int32_t focus) {
        ArkUI_NumberValue value[] = {{.i32 = focus}};
        ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_FOCUS_STATUS, &item));
    }

    void TextInputNodeBase::setFontColor(facebook::react::SharedColor const &color) {
        uint32_t colorValue = *color;
        ArkUI_NumberValue preparedColorValue[] = {{.u32 = colorValue}};
        ArkUI_AttributeItem colorItem = {preparedColorValue, sizeof(preparedColorValue) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_FONT_COLOR, &colorItem));
    }

    void TextInputNodeBase::setCommonFontAttributes(facebook::react::TextAttributes const &textAttributes) {
        std::string fontFamily = "HarmonyOS Sans";
        if (!textAttributes.fontFamily.empty()) {
            fontFamily = textAttributes.fontFamily;
        }
        ArkUI_AttributeItem itemFamily = {.string = fontFamily.c_str()};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_FONT_FAMILY, &itemFamily));

        ArkUI_NumberValue valueSize[] = {(float)textAttributes.fontSize};
        ArkUI_AttributeItem itemSize = {valueSize, sizeof(valueSize) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_FONT_SIZE, &itemSize));

        ArkUI_NumberValue fontWeight = {.i32 = ARKUI_FONT_WEIGHT_NORMAL};
        if (textAttributes.fontWeight) {
            fontWeight = rnoh::convertFontWeight((int32_t)textAttributes.fontWeight.value());
        }
        ArkUI_NumberValue valueWeight[] = {fontWeight};
        ArkUI_AttributeItem itemWeight = {valueWeight, 1};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_FONT_WEIGHT, &itemWeight));

        ArkUI_NumberValue tempStyle = {.i32 = ARKUI_FONT_STYLE_NORMAL};
        if (textAttributes.fontStyle == facebook::react::FontStyle::Italic) {
            tempStyle = {.i32 = ARKUI_FONT_STYLE_ITALIC};
        }
        ArkUI_NumberValue valueStyle[] = {tempStyle};
        ArkUI_AttributeItem itemStyle = {valueStyle, 1};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_FONT_STYLE, &itemStyle));
    
    }

    void TextInputNodeBase::setEnabled(bool enabled) {
        ArkUI_NumberValue value[] = {{.i32 = enabled}};
        ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_ENABLED, &item));
    }

    void TextInputNodeBase::setTextAlign(std::optional<facebook::react::TextAlignment> const &textAlign) {
        ArkUI_NumberValue value[] = {rnoh::convertTextAlign(textAlign.value())};
        ArkUI_AttributeItem item = {.value = value, .size = 1};
        maybeThrow(NativeNodeApi::getInstance()->setAttribute(m_nodeHandle, NODE_TEXT_ALIGN, &item));
    }
} // namespace rnoh
