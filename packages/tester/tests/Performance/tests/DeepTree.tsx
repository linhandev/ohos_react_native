import {View} from 'react-native';
import React, {useEffect} from 'react';
import {TestCaseProps} from '../TestPerformer';
import {DeepTree as DeepTreeComponent} from '../../../benchmarks';

export function DeepTree({onComplete}: TestCaseProps) {
  useEffect(() => {
    onComplete();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <DeepTreeComponent depth={9} breadth={2} id={0} wrap={1} />
    </View>
  );
}
