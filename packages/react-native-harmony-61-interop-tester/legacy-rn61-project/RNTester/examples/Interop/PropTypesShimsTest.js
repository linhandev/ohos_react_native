/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const React = require('react');
const {
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Image,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  TextInput,
} = require('react-native');

const green = {color: '#1a7f37'};
const red = {color: '#d1242f'};
const bold = {fontWeight: '600'};

const CheckSection = ({title, items}) => {
  return (
    <View>
      <View style={{height: 8}} />
      <Text>{title}</Text>
      {items.map((entry) => {
        const [label, result] = entry;
        return (
          <Text key={label} style={result ? green : red}>
            {result ? 'pass' : 'fail'}: {label}
          </Text>
        );
      })}
    </View>
  );
};

const PropTypesShimsTest = () => {
  // Top-level imports
  const ViewPropTypesTop = require('react-native').ViewPropTypes || null;
  const ColorPropTypeTop = require('react-native').ColorPropType || null;
  const EdgeInsetsPropTypeTop = require('react-native').EdgeInsetsPropType || null;
  const PointPropTypeTop = require('react-native').PointPropType || null;

  // Deep-imports (RN61 style)
  const ColorPropTypeDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedColorPropType');
  const CreateStrictShapeTypeChecker = require('react-native/Libraries/DeprecatedPropTypes/deprecatedCreateStrictShapeTypeChecker');
  const EdgeInsetsPropTypeDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedEdgeInsetsPropType');
  const ImagePropTypeDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedImagePropType');
  const ImageSourcePropTypeDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedImageSourcePropType');
  const ImageStylePropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedImageStylePropTypes');
  const LayoutPropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedLayoutPropTypes');
  const PointPropTypeDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedPointPropType');
  const ShadowPropTypesIOSDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedShadowPropTypesIOS');
  const StyleSheetPropTypeDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedStyleSheetPropType');
  const TextInputPropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedTextInputPropTypes');
  const TextPropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedTextPropTypes');
  const TextStylePropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedTextStylePropTypes');
  const TransformPropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedTransformPropTypes');
  const TVViewPropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedTVViewPropTypes');
  const ViewAccessibilityDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedViewAccessibility');
  const ViewPropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedViewPropTypes');
  const ViewStylePropTypesDeep = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedViewStylePropTypes');

  const EdgeInsetsPropTypeDeepAlias = require('react-native/Libraries/StyleSheet/EdgeInsetsPropType');
  const PointPropTypeDeepAlias = require('react-native/Libraries/StyleSheet/PointPropType');
  const ViewPropTypesDeepAlias = require('react-native/Libraries/Components/View/ViewPropTypes');

  const isFn = (x) => typeof x === 'function';
  const isObj = (x) => !!x && typeof x === 'object';
  const isObjStyle = (x) => isObj(x) && !!x.style;
  const hasPropTypes = (C) => !!(C && C.propTypes);
  const hasPropTypesStyle = (C) => !!(C && C.propTypes && C.propTypes.style);

  // Existence and type checks
  const topChecks = [
    ['ColorPropType (fn)', isFn(ColorPropTypeTop)],
    ['EdgeInsetsPropType (fn)', isFn(EdgeInsetsPropTypeTop)],
    ['PointPropType (fn)', isFn(PointPropTypeTop)],
    ['ViewPropTypes (obj.style)', isObjStyle(ViewPropTypesTop)],
  ];

  const deepChecks = [
    ['DeprecatedColorPropType (fn)', isFn(ColorPropTypeDeep)],
    ['deprecatedCreateStrictShapeTypeChecker (fn)', isFn(CreateStrictShapeTypeChecker)],
    ['DeprecatedEdgeInsetsPropType (fn)', isFn(EdgeInsetsPropTypeDeep)],
    ['DeprecatedImagePropType (obj)', isObj(ImagePropTypeDeep)],
    ['DeprecatedImageStylePropTypes (obj)', isObj(ImageStylePropTypesDeep)],
    ['DeprecatedImageSourcePropType (fn)', isFn(ImageSourcePropTypeDeep)],
    ['DeprecatedLayoutPropTypes (obj)', isObj(LayoutPropTypesDeep)],
    ['DeprecatedPointPropType (fn)', isFn(PointPropTypeDeep)],
    ['DeprecatedShadowPropTypesIOS (obj)', isObj(ShadowPropTypesIOSDeep)],
    ['DeprecatedStyleSheetPropType (fn)', isFn(StyleSheetPropTypeDeep)],
    ['DeprecatedTextInputPropTypes (obj)', isObj(TextInputPropTypesDeep)],
    ['DeprecatedTextPropTypes (obj.style)', isObjStyle(TextPropTypesDeep)],
    ['DeprecatedTextStylePropTypes (obj)', isObj(TextStylePropTypesDeep)],
    ['DeprecatedTransformPropTypes (obj)', isObj(TransformPropTypesDeep)],
    ['DeprecatedTVViewPropTypes (obj)', isObj(TVViewPropTypesDeep)],
    ['DeprecatedViewAccessibility (obj)', isObj(ViewAccessibilityDeep)],
    ['DeprecatedViewPropTypes (obj.style)', isObjStyle(ViewPropTypesDeep)],
    ['DeprecatedViewStylePropTypes (obj)', isObj(ViewStylePropTypesDeep)],
  ];

  const aliasedDeepChecks = [
    ['EdgeInsetsPropType (obj)', isObj(EdgeInsetsPropTypeDeepAlias)],
    ['PointPropType (obj)', isObj(PointPropTypeDeepAlias)],
    ['ViewPropTypes (obj)', isObj(ViewPropTypesDeepAlias)],
  ];

  // Component-level propTypes presence (ensurePropTypes wiring)
  const componentChecks = [
    ['Image.propTypes.style', hasPropTypesStyle(Image)],
    ['Text.propTypes.style', hasPropTypesStyle(Text)],
    ['TextInput.propTypes.style', hasPropTypesStyle(TextInput)],
    ['TouchableHighlight.propTypes.style', hasPropTypesStyle(TouchableHighlight)],
    ['TouchableNativeFeedback.propTypes', hasPropTypes(TouchableNativeFeedback)],
    ['TouchableOpacity.propTypes', hasPropTypes(TouchableOpacity)],
    ['TouchableWithoutFeedback.propTypes', hasPropTypes(TouchableWithoutFeedback)],
  ];

  // Invariants: component propTypes.style should be same reference as ViewPropTypes.style
  const styleRefEq = (() => {
    const vpt = ViewPropTypesTop || ViewPropTypesDeep || {};
    const th = TouchableHighlight && TouchableHighlight.propTypes && TouchableHighlight.propTypes.style;
    return [
      ['TouchableHighlight.propTypes.style === ViewPropTypes.style', !!(th === vpt.style)],
    ];
  })();

  const allOk = topChecks.concat(deepChecks, aliasedDeepChecks, componentChecks, styleRefEq).every(([, ok]) => !!ok);

  return (
    <View style={{padding: 12}}>
      <Text style={bold}>[RNOH] PropTypes Shims Test</Text>
      <View style={{height: 8}} />
      <Text style={[bold, allOk ? green : red]}>Overall: {allOk ? 'PASS' : 'FAIL'}</Text>
      <CheckSection title="Top-level imports" items={topChecks} />
      <CheckSection title="Deep-imports" items={deepChecks} />
      <CheckSection title="Deep-imports (aliased)" items={aliasedDeepChecks} />
      <CheckSection title="Component-level propTypes presence" items={componentChecks} />
      <CheckSection title="Style reference equality" items={styleRefEq} />
    </View>
  );
};

exports.title = '[RNOH] PropTypes Shims Test';
exports.description = 'Validates interop-61 PropTypes shims (top-level and deep-import)';
exports.examples = [
  {
    title: 'Run',
    render() {
      return <PropTypesShimsTest />;
    },
  },
];
