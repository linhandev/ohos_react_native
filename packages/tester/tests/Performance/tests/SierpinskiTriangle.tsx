import {View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {TestCaseProps} from '../TestPerformer';
import {SierpinskiTriangle as SierpinskiTriangleComponent} from '../../../benchmarks';

const MAX_RENDER_COUNT = 200;

export function SierpinskiTriangle({onComplete}: TestCaseProps) {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRenderCount(renderCount + 1);

      if (renderCount >= MAX_RENDER_COUNT) {
        onComplete();
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [renderCount]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View>
        <SierpinskiTriangleComponent
          s={150}
          x={0}
          y={0}
          depth={2}
          renderCount={renderCount}
        />
      </View>
    </View>
  );
}
