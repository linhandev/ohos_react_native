/**
 * @format
 */

import { BaseScrollViewNativeComponentDelegate } from './BaseScrollViewNativeComponentDelegate';

export default class ScrollViewNativeComponentDelegate extends BaseScrollViewNativeComponentDelegate {
  override getIntenalViewConfig() {
    return {
      uiViewClassName: 'RCTScrollView',
      bubblingEventTypes: {},
      directEventTypes: {
        topMomentumScrollBegin: {
          registrationName: 'onMomentumScrollBegin',
        },
        topMomentumScrollEnd: {
          registrationName: 'onMomentumScrollEnd',
        },
        topScroll: {
          registrationName: 'onScroll',
        },
        topScrollBeginDrag: {
          registrationName: 'onScrollBeginDrag',
        },
        topScrollEndDrag: {
          registrationName: 'onScrollEndDrag',
        },
      },
      validAttributes: {
        alwaysBounceHorizontal: true,
        alwaysBounceVertical: true,
        bounces: true,
        centerContent: true,
        contentOffset: {
          diff: require('../../../Utilities/differ/pointsDiffer'),
        },
        decelerationRate: true,
        disableIntervalMomentum: true,
        indicatorStyle: true,
        inverted: true,
        keyboardDismissMode: true,
        maintainVisibleContentPosition: true,
        pagingEnabled: true,
        scrollEnabled: true,
        showsHorizontalScrollIndicator: true,
        showsVerticalScrollIndicator: true,
        snapToAlignment: true,
        snapToEnd: true,
        snapToInterval: true,
        snapToOffsets: true,
        snapToStart: true,
        borderBottomLeftRadius: true,
        borderBottomRightRadius: true,
        sendMomentumEvents: true,
        borderRadius: true,
        nestedScrollEnabled: true,
        scrollEventThrottle: true,
        scrollToOverflowEnabled: true,
        borderStyle: true,
        borderRightColor: {
          process: require('../../../StyleSheet/processColor').default,
        },
        borderColor: {
          process: require('../../../StyleSheet/processColor').default,
        },
        borderBottomColor: {
          process: require('../../../StyleSheet/processColor').default,
        },
        persistentScrollbar: true,
        horizontal: true,
        endFillColor: {
          process: require('../../../StyleSheet/processColor').default,
        },
        overScrollMode: true,
        borderTopLeftRadius: true,
        borderTopColor: {
          process: require('../../../StyleSheet/processColor').default,
        },
        removeClippedSubviews: true,
        borderTopRightRadius: true,
        borderLeftColor: {
          process: require('../../../StyleSheet/processColor').default,
        },
        pointerEvents: true,
        isInvertedVirtualizedList: true,
      },
    };
  }
}
