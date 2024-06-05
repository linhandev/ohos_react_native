import {TestSuite} from '@rnoh/testerino';
import {Button, TestCase} from '../../components';
import {useState, useMemo} from 'react';
import {ScrollView, Text, View} from 'react-native';

export default function RemoveClippedTest() {
  const [insert, setInsert] = useState(false);
  const [changeSize, setChangeSize] = useState(false);

  const rows = useMemo(() => {
    const temp_rows = [];
    for (let i = 0; i < 10; i++) {
      temp_rows.push(i);
    }
    return temp_rows;
  }, []);
  return (
    <TestSuite name="RemoveClipped">
      <TestCase.Example
        tags={['dev']}
        itShould="Render ScrollView with removed clipped subviews">
        <Button onPress={() => setInsert(prev => !prev)} label="Insert" />
        <Button
          onPress={() => setChangeSize(prev => !prev)}
          label="Change Size"
        />

        <ScrollView
          removeClippedSubviews
          style={{height: 200, backgroundColor: 'white'}}>
          {insert && (
            <View style={{width: 100, height: 100, backgroundColor: 'green'}} />
          )}
          <View
            style={{
              width: 100,
              height: changeSize ? 200 : 100,
              backgroundColor: 'red',
            }}
          />
          {rows.map(e => (
            <Text key={e}>
              {e} Lorem ipsum dolor sit amet, consectetur adipiscibhjbng elit.
            </Text>
          ))}

          <View style={{width: 100, height: 100, backgroundColor: 'red'}} />
          <View style={{width: 100, height: 100, backgroundColor: 'blue'}} />
          <View style={{width: 100, height: 100, backgroundColor: 'green'}} />
        </ScrollView>
      </TestCase.Example>
    </TestSuite>
  );
}
