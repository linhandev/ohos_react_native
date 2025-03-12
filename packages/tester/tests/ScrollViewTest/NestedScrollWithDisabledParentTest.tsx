import {TestCase} from '@rnoh/testerino';
import {View, ScrollView, Text} from 'react-native';

const text1 =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque urna metus, rutrum at ante ac, posuere ornare nulla. Etiam posuere dui in quam dictum tristique. Mauris tincidunt at nibh et bibendum. Morbi nec nisi aliquam, vulputate sapien in, maximus risus. Donec posuere blandit finibus. Nullam justo tellus, tristique et auctor ac, lobortis in risus. Ut commodo mi nec mauris vestibulum, nec venenatis turpis dignissim. Morbi pellentesque eros ac suscipit cursus. Aenean vehicula dui vel mauris maximus, vel condimentum nunc aliquet. Vivamus purus sapien, commodo eget egestas nec, laoreet nec nisi.';

export function NestedScrollWithDisabledParentTest() {
  return (
    <TestCase
      modal
      itShould="Scrolling inner component should not scroll outer scroll which is disabled">
      <View style={{height: 500, marginTop: 80}}>
        <ScrollView style={{backgroundColor: 'pink'}} scrollEnabled={false}>
          <View style={{height: 300}}>
            <ScrollView style={{backgroundColor: '#fff', height: 300}}>
              <Text style={{fontSize: 30}}>ScrollView</Text>
              <Text>{text1}</Text>
              <Text>{text1}</Text>
            </ScrollView>
          </View>
          <Text style={{fontSize: 20}}>{text1}</Text>

          <Text style={{fontSize: 20}}>{text1}</Text>
        </ScrollView>
      </View>
    </TestCase>
  );
}
