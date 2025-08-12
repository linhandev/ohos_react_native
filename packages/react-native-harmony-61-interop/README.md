# react-native-harmony-61-interop

This package is in progress. The goal of this package is providing compatibility with React Native 0.61.

## Guides


### Create a component wrapper
1) Mirror the path of the target component from `react-native-harmony`:
```
packages/react-native-harmony-61-interop/Libraries/Components/View/View.js
```
2) Implement the wrapper and forward refs/props to the underlying `react-native-harmony` component:
```js
/**
 * [INTEROP-WRAPPER]
 * Wraps Harmony View to adapt RN 0.61 semantics.
 */
import React from 'react';
import RNOHView from '@react-native-oh/react-native-harmony/Libraries/Components/View/View';

const View = React.forwardRef(function ViewWrapper({ newProp, style, ...props }, ref) {
  const patchedStyle = newProp === 'active'
    ? [{ borderColor: 'red', borderWidth: 2, backgroundColor: 'gray' }, style]
    : style;
  return <RNOHView ref={ref} {...props} style={patchedStyle} />;
});

export default View;
```
3. Update `packages/react-native-harmony-61-interop/index.js` and provide a path to the wrapper component:
```js
 get View() {
    return require('./Libraries/Components/View/View').default;
  },
```

### Patch an internal JS module
1) Mirror the original relative path:
```
packages/react-native-harmony-61-interop/Libraries/Image/ImageSourceUtils.js
```
2) Import from `react-native-harmony` and re-export with your modifications:
```js
/**
 * [INTEROP-PATCH]
 * Patches `getImageSourcesFromImageProps` for RN 0.61 compatibility/logging.
 */
const RNOHImageSourceUtils = require('@react-native-oh/react-native-harmony/Libraries/Image/ImageSourceUtils');

export function getImageSourcesFromImageProps(imageProps) {
  console.log('[INTEROP-PATCH] getImageSourcesFromImageProps');
  return RNOHImageSourceUtils.getImageSourcesFromImageProps(imageProps);
}
```

### Notes:
- Do not import from this interop package inside interop files; import only from `@react-native-oh/react-native-harmony/...` to avoid cycles.
- Mirror the file layout of `@react-native-oh/react-native-harmony` under this package.
- Wrappers import from `@react-native-oh/react-native-harmony` and re-export a compatible API for RN 0.61.