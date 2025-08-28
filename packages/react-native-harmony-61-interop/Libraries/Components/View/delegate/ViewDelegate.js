/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Map legacy RN61 accessibilityStates array to modern accessibilityState object.
 * If both are provided, values from accessibilityState take precedence.
 */
export default function convertAccessibilityStates(props) {
  const statesSupportedIn61 = [
    'selected',
    'disabled',
    'checked',
    'unchecked',
    'busy',
    'expanded',
    'collapsed',
    'hasPopup',
  ];

  if (!props) {
    return props;
  }

  const { accessibilityStates, accessibilityState, ...rest } = props;
  const isActivatedByStateName =
    Array.isArray(accessibilityStates) && accessibilityStates.length
      ? accessibilityStates
          .filter((state) => statesSupportedIn61.includes(state))
          .reduce((acc, state) => {
            acc[state] = true;
            return acc;
          }, {})
      : undefined;

  if (isActivatedByStateName || accessibilityState) {
    return {
      ...rest,
      accessibilityState: {
        ...(isActivatedByStateName || {}),
        ...(accessibilityState || {}),
      },
    };
  }
  return rest;
}
