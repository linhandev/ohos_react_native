import React from 'react';
import GeneratedSampleNativeComponent, {
  OutgoingData,
  IncomingData,
} from './specs/v1/GeneratedSampleNativeComponent';
import { processColor } from 'react-native';
import { Commands } from './specs/v2/GeneratedSampleNativeComponent';

export type GeneratedSampleComponentArkTSRef = {
  emitNativeEvent: (eventType: 'directEvent' | 'bubblingEvent') => void;
};

export const GeneratedSampleComponentArkTS = React.forwardRef<
  GeneratedSampleComponentArkTSRef,
  {
    children?: any;
    testProps: Omit<OutgoingData, 'colorTest'> & { colorTest: string };
    onDirectEvent?: (args: IncomingData) => void;
    onBubblingEvent?: (args: IncomingData) => void;
  }
>(
  (
    {
      children,
      testProps: { colorTest, ...otherTestProps },
      onDirectEvent,
      onBubblingEvent,
    },
    ref
  ) => {
    const nativeRef = React.useRef<any>(null);

    React.useImperativeHandle(
      ref,
      () => ({
        emitNativeEvent(eventType) {
          if (nativeRef?.current) {
            Commands.emitNativeEvent(nativeRef.current, eventType)
          }
        },
      }),
      []
    );

    return (
      <GeneratedSampleNativeComponent
        ref={nativeRef}
        style={{
          width: '100%',
          height: 272,
          backgroundColor: 'white',
          borderWidth: 2,
          borderColor: 'pink',
        }}
        children={children}
        {...otherTestProps}
        colorTest={processColor(colorTest)!}
        onMount={() => {}}
        onBubblingEvent={(e) => {
          onBubblingEvent?.(e.nativeEvent);
        }}
        onDirectEvent={(e) => {
          onDirectEvent?.(e.nativeEvent);
        }}
      />
    );
  }
);
