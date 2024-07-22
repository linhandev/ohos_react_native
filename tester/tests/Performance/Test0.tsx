import {View} from 'react-native';
import React, {useEffect} from 'react';
import {TestCaseProps} from './TestPerformer';
import {DeepTree} from '../../benchmarks';

export default function Test0({onComplete}: TestCaseProps) {
  useEffect(() => {
    onComplete();
  }, []);

  return (
    <View>
      <DeepTree breadth={20} depth={2} id={0} wrap={1} />
    </View>
  );
}
