import React, {useEffect, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {TestCaseProps} from '../TestPerformer';
import generateRandomColor from '../utils/generateRandomColor';

const VIEW_NUMBER = 1500;

function LargeViewList() {
  const randomColorList = useMemo(() => {
    return Array.from({length: VIEW_NUMBER}, () => generateRandomColor());
  }, []);

  const views = Array.from({length: VIEW_NUMBER}, (_, index) => (
    <View
      key={index}
      style={[
        styles.view,
        {
          backgroundColor: randomColorList[index % randomColorList.length],
        },
      ]}>
      <Text style={styles.text}>{index + 1}</Text>
    </View>
  ));

  return <View style={styles.container}>{views}</View>;
}

export function Render1500ColorfulViews({onComplete}: TestCaseProps) {
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
      <LargeViewList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  view: {
    width: 10,
    height: 10,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 5,
  },
});
