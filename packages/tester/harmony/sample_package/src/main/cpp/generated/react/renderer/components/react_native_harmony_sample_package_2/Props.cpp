
/**
 * This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
 *
 * Do not edit this file as changes may cause incorrect behavior and will be lost
 * once the code is regenerated.
 *
 * @generated by codegen project: GeneratePropsCpp.js
 */

#include "Props.h"
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>

namespace facebook::react {

CodegenLibArkTSSampleComponentProps::CodegenLibArkTSSampleComponentProps(
    const PropsParserContext &context,
    const CodegenLibArkTSSampleComponentProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    text(convertRawProp(context, rawProps, "text", sourceProps.text, {}))
      {}
CodegenLibCppSampleComponentProps::CodegenLibCppSampleComponentProps(
    const PropsParserContext &context,
    const CodegenLibCppSampleComponentProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    text(convertRawProp(context, rawProps, "text", sourceProps.text, {}))
      {}

} // namespace facebook::react
