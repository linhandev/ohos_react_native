import {TestCase, TestSuite} from '@rnoh/testerino';
import {Platform, ScrollView, StyleSheet, Text, View, SectionList} from 'react-native';
import {getScrollViewContent} from './fixtures';
import React, {useState} from 'react';
import {Button} from '../../components';

export function StickyHeadersTest() {
  return (
    <TestSuite
      name="sticky headers" /* (sticky headers fail on Android when Fabric is enabled) */
    >
      <TestCase
        modal
        itShould="stick item 1 and 4 (stickyHeaderIndices)"
        skip={Platform.OS === 'android'}>
        <View style={styles.wrapperView}>
          <ScrollView stickyHeaderIndices={[0, 3]} nestedScrollEnabled>
            {getScrollViewContent({})}
          </ScrollView>
        </View>
      </TestCase>
      <TestCase
        modal
        skip={Platform.OS === 'android'}
        itShould="hide sticked item 1 or 4 when scrolling down (stickyHeaderHiddenOnScroll)">
        <View style={styles.wrapperView}>
          <ScrollView
            stickyHeaderIndices={[0, 3]}
            nestedScrollEnabled
            stickyHeaderHiddenOnScroll>
            {getScrollViewContent({})}
          </ScrollView>
        </View>
      </TestCase>
      <TestCase
        modal
        skip={Platform.OS === 'android'}
        itShould="stick item 13 and 20 to the bottom (invertStickyHeaders)"
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/309
      >
        <View style={styles.wrapperView}>
          <ScrollView
            stickyHeaderIndices={[12, 19]}
            nestedScrollEnabled
            invertStickyHeaders>
            {getScrollViewContent({})}
          </ScrollView>
        </View>
      </TestCase>
      <TestCase
        modal
        itShould="display Text 'custom sticky header' in the place of components 1 and 4 (shouldn't stick) (StickyHeaderComponent)">
        <View style={styles.wrapperView}>
          <ScrollView
            stickyHeaderIndices={[0, 3]}
            nestedScrollEnabled
            StickyHeaderComponent={CustomStickyHeader}>
            {getScrollViewContent({})}
          </ScrollView>
        </View>
      </TestCase>
      <TestCase
        modal
        itShould="The header remains at the top when the foldable phone is expanded or folded.">
        <View style={styles.wrapperView}>
          <StickySectionListTest />
        </View>
      </TestCase>
    </TestSuite>
  );
}

const CustomStickyHeader = React.forwardRef(() => (
  <Text>custom sticky header</Text>
));

interface SectionData {
  id: string;
  title: string;
  data: string[];
}

const DATA: SectionData[] = [
  {
    id: '0',
    title: 'Main dishes',
    data: ['Pizza', 'Burger', 'Risotto', 'French Fries', 'Onion Rings', 'Fried Shrimps', 'Water', 'Coke', 'Beer'],
  }
];

const StickySectionListTest = () => {
  const [fold, setFold] = useState(false);

  return (
    <>
      <Button
        label={fold ? "Expand" : "Fold"}
        onPress={() => {
          setFold(!fold)
        }}
      />
      <SectionList
        removeClippedSubviews={false}
        sections={DATA}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <View style={[styles.item, { height: fold ? 50 : 100 }]}>
            <Text style={{ fontSize: 16, height: 20 }}>{item}</Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[{ backgroundColor: 'white' }, styles.title]}>{title}</Text>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapperView: {
    height: 300,
    width: '60%',
  },
  button: {
    width: 160,
    height: 36,
    backgroundColor: 'hsl(190, 50%, 70%)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 22,
    height: 40,
  },
});
