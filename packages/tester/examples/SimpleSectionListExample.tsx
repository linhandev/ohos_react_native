import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  SectionList,
  StatusBar,
} from 'react-native';

const DATA: {title: string; data: string[]}[] = [];

const dataLength = 1000;

for (let index = 0; index < dataLength; index++) {
  DATA.push({
    title: `Main dishes ${index}`,
    data: [`Pizza ${index}`, `Burger ${index}`, `Risotto ${index}`],
  });
}

export function SimpleSectionListExample() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <SectionList
          refreshing
          horizontal={true}
          removeClippedSubviews={true}
          sections={DATA}
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item}</Text>
            </View>
          )}
          renderSectionHeader={({section: {title}}) => (
            <Text style={styles.header}>{title}</Text>
          )}
        />
      </View>
      <SectionList
        refreshing
        removeClippedSubviews={true}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item}</Text>
          </View>
        )}
        renderSectionHeader={({section: {title}}) => (
          <Text style={styles.header}>{title}</Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 8,
    margin: 8,
  },
  header: {
    fontSize: 24,
    backgroundColor: '#fff',
    margin: 8,
  },
  title: {
    fontSize: 18,
  },
  wrapper: {
    height: 200,
  },
});
