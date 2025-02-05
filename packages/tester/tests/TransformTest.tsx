import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {TestCase} from '../components';

export function TransformTest() {
  return (
    <TestSuite name="Transform">
      <TestCase.Example itShould="Show boxes with different scaling">
        <View style={styles.wrapper}>
          <View style={styles.box}>
            <Text style={styles.text}>Original Object</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{scale: 2}],
              },
            ]}>
            <Text style={styles.text}>Scale by 2</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{scaleX: 2}],
              },
            ]}>
            <Text style={styles.text}>ScaleX by 2</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{scaleY: 2}],
              },
            ]}>
            <Text style={styles.text}>ScaleY by 2</Text>
          </View>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="Show boxes with different rotations">
        <View style={styles.wrapper}>
          <View style={styles.box}>
            <Text style={styles.text}>Original Object</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{rotate: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>Rotate by 45 deg</Text>
          </View>

          <View
            style={[
              styles.box,
              {
                transform: [{rotateX: '45deg'}, {rotateZ: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>Rotate X&Z by 45 deg</Text>
          </View>

          <View
            style={[
              styles.box,
              {
                transform: [{rotateY: '45deg'}, {rotateZ: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>Rotate Y&Z by 45 deg</Text>
          </View>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="Show boxes with different skews [fails]">
        <View style={styles.wrapper}>
          <View style={styles.box}>
            <Text style={styles.text}>Original Object</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{skewX: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>SkewX by 45 deg</Text>
          </View>

          <View
            style={[
              styles.box,
              {
                transform: [{skewY: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>SkewY by 45 deg</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{skewX: '30deg'}, {skewY: '30deg'}],
              },
            ]}>
            <Text style={styles.text}>Skew X&Y by 30 deg</Text>
          </View>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="Show boxes translated by 20 dp (half of box size)">
        <View style={styles.wrapper}>
          <View style={styles.box}>
            <Text style={styles.text}>Original Object</Text>
          </View>
          <View
            style={[
              styles.boxWithoutMargin,
              {
                transform: [{translateX: -20}],
              },
            ]}>
            <Text style={styles.text}>TranslateX by -20 </Text>
          </View>

          <View
            style={[
              styles.boxWithoutMargin,
              {
                transform: [{translateY: 20}],
              },
            ]}>
            <Text style={styles.text}>TranslateY by 20 </Text>
          </View>
        </View>
      </TestCase.Example>
      <TestSuite name="Transform Origin">
        <TestCase.Example itShould="Show rotated boxes with different transform origins">
          <View style={styles.wrapper}>
            <View style={styles.stackContainer}>
              <View style={[styles.box, {backgroundColor: 'lightgray'}]}>
                <Text style={styles.text}>Original Object</Text>
              </View>
              <View
                style={[
                  styles.rotatedStackableBox,
                  {
                    backgroundColor: 'lightblue',
                    transformOrigin: 'top left',
                  },
                ]}>
                <Text style={styles.text}>Rotate by 45 deg from top left</Text>
              </View>
            </View>
            <View style={styles.stackContainer}>
              <View style={[styles.box, {backgroundColor: 'lightgray'}]}>
                <Text style={styles.text}>Original Object</Text>
              </View>
              <View
                style={[
                  styles.rotatedStackableBox,
                  {
                    backgroundColor: 'lightgreen',
                    transformOrigin: 'top right',
                  },
                ]}>
                <Text style={styles.text}>Rotate by 45 deg from top right</Text>
              </View>
            </View>
            <View style={styles.stackContainer}>
              <View style={[styles.box, {backgroundColor: 'lightgray'}]}>
                <Text style={styles.text}>Original Object</Text>
              </View>
              <View
                style={[
                  styles.rotatedStackableBox,
                  {
                    backgroundColor: 'lightcoral',
                    transformOrigin: 'bottom left',
                  },
                ]}>
                <Text style={styles.text}>
                  Rotate by 45 deg from bottom left
                </Text>
              </View>
            </View>
            <View style={styles.stackContainer}>
              <View style={[styles.box, {backgroundColor: 'lightgray'}]}>
                <Text style={styles.text}>Original Object</Text>
              </View>
              <View
                style={[
                  styles.rotatedStackableBox,
                  {
                    backgroundColor: 'lightpink',
                    transformOrigin: 'bottom right',
                  },
                ]}>
                <Text style={styles.text}>
                  Rotate by 45 deg from bottom right
                </Text>
              </View>
            </View>
          </View>
        </TestCase.Example>
        <TestCase.Example itShould="The rotated object should change opacity when touched. The original object should not respond to touch events">
          <View style={styles.wrapper}>
            <View
              style={[
                styles.stackContainer,
                {width: 200, height: 150, marginLeft: 50},
              ]}>
              <View
                style={[
                  styles.box,
                  {backgroundColor: 'lightgray', width: 80, height: 80},
                ]}>
                <Text style={[styles.text, {fontSize: 12}]}>
                  Original Object
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.rotatedStackableBox,
                  {
                    width: 80,
                    height: 80,
                    backgroundColor: 'lightpink',
                    transformOrigin: 'top left',
                    transform: [{rotate: '60deg'}],
                  },
                ]}>
                <Text style={[styles.text, {fontSize: 12}]}>
                  Rotate by 60 deg from top left
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TestCase.Example>
      </TestSuite>
    </TestSuite>
  );
}
const styles = StyleSheet.create({
  box: {
    height: 40,
    width: 40,
    marginHorizontal: 25,
    marginVertical: 25,
    backgroundColor: '#61dafb',
    justifyContent: 'center',
  },
  rotatedStackableBox: {
    height: 40,
    width: 40,
    marginHorizontal: 25,
    position: 'absolute',
    transform: [{rotate: '45deg'}],
    marginVertical: 25,
    justifyContent: 'center',
  },
  scaledStackableBox: {
    height: 40,
    width: 40,
    position: 'absolute',
    transform: [{scale: 2}],
    backgroundColor: '#61dafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxWithoutMargin: {
    height: 40,
    width: 40,
    marginHorizontal: 25,
    marginVertical: 25,
    backgroundColor: '#61dafb',
    justifyContent: 'center',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stackContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  bigStackContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginHorizontal: 25,
    marginVertical: 25,
  },
  text: {
    fontSize: 6,
    margin: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    height: '100%',
  },
});
