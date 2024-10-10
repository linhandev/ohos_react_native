import React, {useState} from 'react';
import {Image, ScrollView, StyleSheet, TextInput, View} from 'react-native';

export function ImageGalleryExample() {
  const [numberOfComponents, setNumberOfComponents] = useState(300);

  return (
    <ScrollView style={{flex: 1}}>
      <View style={{flexDirection: 'column'}}>
        <TextInput
          style={styles.textInput}
          value={numberOfComponents.toString()}
          onChangeText={value => {
            setNumberOfComponents(parseInt(value) || 0);
          }}
        />
        <View style={styles.gallery}>
          {new Array(numberOfComponents).fill(0).map((_, idx) => {
            return (
              <Image
                key={idx}
                source={require('../assets/placeholder2000x2000.jpg')}
                style={styles.image}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

export function ImageGalleryRemotesExample() {
  const [numberOfComponents, setNumberOfComponents] = useState(300);

  return (
    <ScrollView style={{flex: 1}}>
      <View style={{flexDirection: 'column'}}>
        <TextInput
          style={styles.textInput}
          value={numberOfComponents.toString()}
          onChangeText={value => {
            setNumberOfComponents(parseInt(value) || 0);
          }}
        />
        <View style={styles.gallery}>
          {new Array(numberOfComponents).fill(0).map((_, idx) => {
            return (
              <Image
                key={idx}
                source={{
                  uri: 'https://images.pexels.com/photos/27849695/pexels-photo-27849695/free-photo-of-a-man-riding-a-motorcycle-down-a-narrow-street.jpeg?w=1920&h=2880&dpr=3',
                }}
                style={{...styles.image, height: 100, backgroundColor: 'red'}}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '31%',
    aspectRatio: 1,
  },
  textInput: {
    backgroundColor: 'white',
    width: '100%',
    height: 36,
    color: 'black',
  },
  gallery: {
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 11,
  },
});
