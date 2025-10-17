/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * [INTEROP-WRAPPER]
 * Wraps Harmony Image to adapt RN 0.61 semantics.
 * The only change is the scheme of onLoad's input event.
 * For reference on the differences, see:
 *   - RN 0.61 ImageLoadEvent type definition: https://github.com/facebook/react-native/blob/v0.61.5/Libraries/Image/ImageProps.js#L20
 *   - RN 0.77 ImageLoadEventData type definition: https://github.com/facebook/react-native/blob/v0.77.1/packages/react-native/Libraries/Image/Image.d.ts#L102
 *   - RN 0.6x changelog describing the change with linked commit: https://github.com/facebook/react-native/blob/main/CHANGELOG-0.6x.md?plain=1#L1282
 */
import React from "react";
import { NativeSyntheticEvent } from "react-native";
import RNOHImage, {
  ImageBase,
} from "@react-native-oh/react-native-harmony/Libraries/Image/Image";
import type {
  ImageLoadEventData,
  ImageProps,
} from "@react-native-oh/react-native-harmony/Libraries/Image/Image";

// #region types
type Event = NativeSyntheticEvent<ImageLoadEventData>;

type Event61 = Omit<Event, "nativeEvent"> & {
  nativeEvent: Omit<ImageLoadEventData, "source"> & {
    source: Omit<ImageLoadEventData["source"], "uri"> & { url: string };
  };
};

type Props61 = Omit<ImageProps, "onLoad"> & {
  onLoad?: (e: Event61) => void;
};
// #endregion

const Image = React.forwardRef<Props61>((props: Props61, ref) => {
  const onLoad = props.onLoad;
  const adaptedOnLoad: ((e: Event) => void) | undefined = onLoad
    ? (event) => {
        const { uri, ...sourceWithoutUri } = event.nativeEvent.source;
        const adaptedEvent: Event61 = {
          ...event,
          nativeEvent: {
            ...event.nativeEvent,
            source: {
              ...sourceWithoutUri,
              url: event.nativeEvent.source.uri,
            },
          },
        };

        onLoad(adaptedEvent);
      }
    : undefined;

  const BaseImage = RNOHImage as unknown as typeof ImageBase;
  return <BaseImage ref={ref as any} {...props} onLoad={adaptedOnLoad} />;
});

Image.displayName = "Image";

// #region static methods
// @ts-ignore
Image.getSize = RNOHImage.getSize;
// @ts-ignore
Image.getSizeWithHeaders = RNOHImage.getSizeWithHeaders;
// @ts-ignore
Image.prefetch = RNOHImage.prefetch;
// @ts-ignore
Image.prefetchWithMetadata = RNOHImage.prefetchWithMetadata;
// @ts-ignore
Image.queryCache = RNOHImage.queryCache;
// @ts-ignore
Image.resolveAssetSource = RNOHImage.resolveAssetSource;
// #endregion

export default Image;
