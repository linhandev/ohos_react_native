import {StyleSheet, Text, TextStyle, View} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {SAMPLE_PARAGRAPH_TEXT} from './fixtures';
import {TestCase} from '../../components';

function LoremIpsum({style}: {style?: Partial<TextStyle>}) {
  return (
    <Text
      style={{
        padding: 5,
        ...style,
      }}>
      Lorem ipsum dolor sit amet
    </Text>
  );
}

export function TextStyleTest() {
  return (
    <TestSuite name="TextStyle">
      <TestCase.Example itShould="show text with the Pacifico Regular font on the blue background">
        <View style={{backgroundColor: 'cyan', alignSelf: 'flex-start'}}>
          <LoremIpsum style={{fontFamily: 'Pacifico-Regular'}} />
        </View>
        <View style={{backgroundColor: 'pink', alignSelf: 'flex-start'}}>
          <LoremIpsum />
        </View>
      </TestCase.Example>
      <TestCase.Example
        itShould="show text with the 'sans-serif' font"

        // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/860
      >
        <View style={{height: 30, width: '100%'}}>
          <LoremIpsum
            style={{
              ...styles.blackText,
              fontFamily: 'sans-serif',
            }}
          />
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show text with the 'serif' font">
        <View style={{height: 30, width: '100%'}}>
          <LoremIpsum
            style={{
              ...styles.blackText,
              fontFamily: 'serif',
            }}
          />
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show text with the 'monospace' font">
        <View style={{height: 30, width: '100%'}}>
          <LoremIpsum
            style={{
              ...styles.blackText,
              fontFamily: 'monospace',
            }}
          />
        </View>
      </TestCase.Example>
      <TestSuite name="Text Shadow">
        <TestCase.Example itShould="show text with a blue shadow">
          <View style={{alignSelf: 'flex-start'}}>
            <LoremIpsum
              style={{
                textShadowColor: 'blue',
                textShadowRadius: 5,
              }}
            />
          </View>
        </TestCase.Example>
        <TestCase.Example itShould="show text with a red shadow offset by (2, 2)">
          <View style={{alignSelf: 'flex-start'}}>
            <LoremIpsum
              style={{
                textShadowColor: 'red',
                textShadowOffset: {width: 2, height: 2},
                textShadowRadius: 2,
              }}
            />
          </View>
        </TestCase.Example>
        <TestCase.Example itShould="show a nested text fragment with red shadow">
          <View style={{alignSelf: 'flex-start'}}>
            <Text>
              Some longer text{' '}
              <Text
                style={{
                  textShadowColor: 'red',
                  textShadowOffset: {width: 2, height: 2},
                  textShadowRadius: 2,
                }}>
                containing a frament
              </Text>{' '}
              with shadow
            </Text>
          </View>
        </TestCase.Example>
      </TestSuite>
      <TestCase.Example itShould="show text with different horizontal alignments">
        <Text style={{textAlign: 'left'}}>Left:</Text>
        <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
        <Text style={{textAlign: 'center'}}>Center:</Text>
        <Text style={{fontSize: 8, textAlign: 'center'}}>
          {SAMPLE_PARAGRAPH_TEXT}
        </Text>
        <Text style={{textAlign: 'right'}}>Right:</Text>
        <Text style={{fontSize: 8, textAlign: 'right'}}>
          {SAMPLE_PARAGRAPH_TEXT}
        </Text>
        <Text style={{textAlign: 'justify'}}>Justify:</Text>
        <Text style={{fontSize: 8, textAlign: 'justify'}}>
          {SAMPLE_PARAGRAPH_TEXT}
        </Text>
      </TestCase.Example>
      <TestCase.Example itShould="show text with different vertical alignments (textAlignVertical)">
        <View style={styles.smallContainerRow}>
          <Text style={styles.blueShortText}>Auto</Text>
          <Text
            style={{
              ...styles.blueShortText,
              textAlignVertical: 'top',
            }}>
            Top
          </Text>
          <Text
            style={{
              ...styles.blueShortText,
              textAlignVertical: 'center',
            }}>
            Center
          </Text>
          <Text
            style={{
              ...styles.blueShortText,
              textAlignVertical: 'bottom',
            }}>
            Bottom
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show text with different vertical alignments (verticalAlign)">
        <View style={styles.smallContainerRow}>
          <Text style={styles.blueShortText}>Auto</Text>
          <Text style={{...styles.blueShortText, verticalAlign: 'top'}}>
            Top
          </Text>
          <Text
            style={{
              ...styles.blueShortText,
              verticalAlign: 'middle',
            }}>
            Middle
          </Text>
          <Text
            style={{
              ...styles.blueShortText,
              verticalAlign: 'bottom',
            }}>
            Bottom
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="format nested Text components">
        <View style={styles.container}>
          <Text style={{...styles.text, textAlign: 'right'}}>
            <Text style={{fontWeight: 'bold'}}>Bold</Text>
            <Text style={{fontStyle: 'italic'}}>Italic</Text>
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="test the the left and right padding of the text">
        <View style={{height: 32, flexDirection: 'row'}}>
          <Text
            style={{
              height: '100%',
              backgroundColor: 'red',
              color: 'white',
              paddingLeft: 10,
              paddingRight: 30,
            }}>
            left
          </Text>
          <Text
            style={{height: '100%', backgroundColor: 'red', color: 'white'}}>
            right
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="align text same way after adding padding">
        <View style={{height: 70, flexDirection: 'column'}}>
          <Text
            style={{
              paddingLeft: 10,
              paddingRight: 40,
              backgroundColor: 'red',
              maxWidth: 200,
              textAlign: 'center',
            }}>
            {'fragment1'}fragment2
          </Text>
          <Text
            style={{
              paddingLeft: 10,
              paddingRight: 40,
              backgroundColor: 'red',
              maxWidth: 200,
              textAlign: 'center',
            }}>
            fragment1fragment2
          </Text>
          <Text
            style={{
              paddingRight: 10,
              backgroundColor: 'red',
              maxWidth: 200,
              textAlign: 'right',
            }}>
            {'fragment1'}fragment2
          </Text>
          <Text
            style={{
              paddingRight: 10,
              backgroundColor: 'red',
              maxWidth: 200,
              textAlign: 'right',
            }}>
            fragment1fragment2
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show text with different textDecorationLines">
        <View style={styles.container}>
          <Text style={styles.text}>None</Text>
          <Text style={{...styles.text, textDecorationLine: 'underline'}}>
            underline
          </Text>
          <Text style={{...styles.text, textDecorationLine: 'line-through'}}>
            line-through
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example
        itShould="show lined-through text with text decoration color or font color"
        skip={{android: false, harmony: {arkTs: true, cAPI: false}}}
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/271
      >
        <View style={styles.container}>
          <Text
            style={{
              ...styles.smallText,
              textDecorationLine: 'line-through',
              textDecorationColor: 'blue',
            }}>
            line-through blue
          </Text>
          <Text
            style={{
              ...styles.smallText,
              textDecorationLine: 'line-through',
            }}>
            line-through white
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show text with big letter spacing">
        <View style={styles.smallContainer}>
          <Text style={{...styles.smallText, letterSpacing: 8}}>
            Spacing: 8
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show text with shadow">
        <View>
          <Text
            style={{
              height: 40,
              fontSize: 20,
              fontWeight: '900',
              textShadowColor: 'rgba(0,0,255,0.8)',
              textShadowOffset: {width: 1, height: 1},
              textShadowRadius: 20,
            }}>
            Text with shadow
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example
        itShould="show text with correct textTransform"
        //  123 1one is added to the end of text to see if the code correctly handles number
      >
        <View style={styles.bigContainer}>
          <Text style={styles.smallText}>Text transform none 123 1one</Text>
          <Text
            style={{
              ...styles.smallText,
              textTransform: 'capitalize',
            }}>
            Text transform capitalize 123 1one
          </Text>
          <Text
            style={{
              ...styles.smallText,
              textTransform: 'uppercase',
            }}>
            Text transform uppercase 123 1one
          </Text>
          <Text
            style={{
              ...styles.smallText,
              textTransform: 'lowercase',
            }}>
            Text transform lowercase 123 1one
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show text with different writing direction">
        <View style={styles.container}>
          <Text style={styles.smallText}>Writing direction auto</Text>
          <Text
            style={{
              ...styles.smallText,
              writingDirection: 'ltr',
            }}>
            Writing direction ltr
          </Text>
          <Text
            style={{
              ...styles.smallText,
              writingDirection: 'rtl',
            }}>
            Writing direction rtl
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example
        itShould="show text aligned vertically with/without font padding included"
        skip={{android: false, harmony: true}}
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/281
      >
        <View style={styles.smallContainerRow}>
          <Text
            style={{
              ...styles.smallText,
              textAlignVertical: 'center',
              includeFontPadding: false,
            }}>
            TEXT
          </Text>
          <Text
            style={{
              ...styles.smallText,
              textAlignVertical: 'center',
            }}>
            TEXT
          </Text>
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show text with different dataDetectorType">
        <Text>phoneNumber:</Text>
        <Text dataDetectorType={'phoneNumber'}>13612345678</Text>
        <Text>link:</Text>
        <Text dataDetectorType={'link'}>www.huawei.com</Text>
        <Text>email:</Text>
        <Text dataDetectorType={'email'}>huawei@huawei.com</Text>
        <Text>all:</Text>
        <Text dataDetectorType={'all'}>
          13612345678 www.huawei.com huawei@huawei.com
        </Text>
        <Text>none:</Text>
        <Text dataDetectorType={'none'}>
          13612345678 www.huawei.com huawei@huawei.com
        </Text>
      </TestCase.Example>
      <TestCase.Example itShould="show text with font variants">
        <Text style={{fontFamily: 'serif', fontVariant: ['small-caps']}}>
          The quick brown fox jumps over the lazy dog
        </Text>
        <Text style={{fontFamily: 'serif', fontVariant: ['oldstyle-nums']}}>
          0123456789
        </Text>
        <Text style={{fontFamily: 'serif', fontVariant: ['lining-nums']}}>
          0123456789
        </Text>
        <Text style={{fontFamily: 'serif', fontVariant: ['tabular-nums']}}>
          0123456789
        </Text>
        <Text style={{fontFamily: 'serif', fontVariant: ['proportional-nums']}}>
          0123456789
        </Text>
      </TestCase.Example>
    </TestSuite>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 80,
    backgroundColor: 'red',
  },
  smallContainer: {
    width: 200,
    height: 40,
    backgroundColor: 'red',
  },
  smallContainerRow: {
    width: 200,
    height: 40,
    backgroundColor: 'red',
    flexDirection: 'row',
  },
  bigContainer: {
    width: 200,
    height: 120,
    backgroundColor: 'red',
  },
  text: {
    width: '100%',
    color: 'white',
  },
  smallText: {
    height: 30,
    color: 'white',
  },
  blueShortText: {
    height: 30,
    width: 50,
    color: 'white',
    backgroundColor: 'blue',
  },
  blackText: {
    width: '100%',
    height: '100%',
    color: 'black',
  },
});
