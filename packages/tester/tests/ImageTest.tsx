import {
  Dimensions,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import React, {useEffect, useMemo, useState} from 'react';
import {Button, TestCase} from '../components';
import {getScrollViewContentHorizontal} from './ScrollViewTest/fixtures';
import {useEnvironment} from '../contexts';

const WRONG_IMAGE_SRC = 'not_image';
const LOCAL_IMAGE_ASSET_ID = require('../assets/pravatar-131.jpg');
const REMOTE_IMAGE_URL =
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=400&q=80';
const INVALID_IMAGE_URL = '';
const BASE64_IMAGE_STRING =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';
const LARGE_REMOTE_IMAGE_URL =
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4';
const RANDOM_REMOTE_IMAGE_URL = 'https://picsum.photos/5000';
const REMOTE_REDIRECT_IMAGE_URL =
  'https://ix-marketing.imgix.net/bg-remove_after.png?auto=format,compress&w=1946';
const REMOTE_GIF_URL =
  'https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif';
const DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const FILE_URI = 'file:///data/storage/el2/base/files/pravatar-131.jpg';

export const ImageTest = () => {
  const {
    env: {isConnectedToInternet},
  } = useEnvironment();

  const noInternetSkipMsg = isConnectedToInternet
    ? undefined
    : 'Internet connection required';

  return (
    <TestSuite name="Image">
      <TestCase.Example itShould="support loading local images">
        <Image
          style={{borderRadius: 8, borderWidth: 1}}
          source={LOCAL_IMAGE_ASSET_ID}
        />
      </TestCase.Example>
      <ImageExampleCase
        itShould="support loading remote images"
        source={{uri: REMOTE_IMAGE_URL}}
      />
      <ImageExampleCase
        itShould="support loading remote images (with http redirect)"
        source={{uri: REMOTE_REDIRECT_IMAGE_URL}}
      />
      <ImageExampleCase
        itShould="support loading large remote images (over 5mb)"
        source={{uri: LARGE_REMOTE_IMAGE_URL}}
      />
      <ImageExampleCase
        itShould="support loading image data uris"
        source={{uri: DATA_URI}}
      />
      <ImageExampleCase
        itShould="support loading remote animated gifs"
        source={{uri: REMOTE_GIF_URL}}
      />
      <TestCase.Example itShould="display accessible image which reads 'EXAMPLE IMAGE' when focused">
        <View style={{minHeight: 50}}>
          <Image source={LOCAL_IMAGE_ASSET_ID} alt="EXAMPLE IMAGE" />
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="display an image nested inside Text">
        <TextNestedImageTest />
      </TestCase.Example>
      <TestCase.Logical
        skip={{android: false, harmony: {arkTs: false, cAPI: 'NOT SUPPORTED'}}}
        itShould="retrieve remote image size"
        fn={({expect}) => {
          return new Promise((resolve, reject) => {
            Image.getSize(
              REMOTE_IMAGE_URL,
              (width, height) => {
                expect(width).to.be.eq(100);
                expect(height).to.be.eq(100);
                resolve();
              },
              e => {
                reject(e);
              },
            );
          });
        }}
      />
      <TestCase.Logical
        itShould="fail when retrieving image size for an invalid uri"
        fn={({expect}) => {
          return new Promise((resolve, reject) => {
            Image.getSize(
              INVALID_IMAGE_URL,
              () => {
                reject(
                  'retrieving the size of an image with invalid uri should fail, but it returned a success',
                );
              },
              e => {
                expect(e).to.not.be.undefined;
                resolve();
              },
            );
          });
        }}
      />
      <TestCase.Logical
        itShould="retrieve base64 image size"
        fn={({expect}) => {
          return new Promise((resolve, reject) => {
            Image.getSize(
              BASE64_IMAGE_STRING,
              (width, height) => {
                expect(width).to.be.eq(10);
                expect(height).to.be.eq(10);
                resolve();
              },
              e => {
                reject(e);
              },
            );
          });
        }}
      />
      <TestCase.Logical
        itShould="retrieve base64 image size (withHeaders)"
        fn={({expect}) => {
          return new Promise((resolve, reject) => {
            Image.getSizeWithHeaders(
              BASE64_IMAGE_STRING,
              {crossOrigin: 'use-credentials'},
              (width, height) => {
                expect(width).to.be.eq(10);
                expect(height).to.be.eq(10);
                resolve();
              },
              e => {
                reject(e);
              },
            );
          });
        }}
      />
      <TestCase.Logical
        skip={{
          android: false,
          harmony: {arkTs: false, cAPI: 'NOT SUPPORTED'},
        }}
        itShould="retrieve remote image size (with custom headers provided)"
        fn={({expect}) => {
          return new Promise((resolve, reject) => {
            Image.getSizeWithHeaders(
              REMOTE_IMAGE_URL,
              {referrerPolicy: 'no-referrer-when-downgrad'},
              (width, height) => {
                expect(width).to.be.eq(100);
                expect(height).to.be.eq(100);
                resolve();
              },
              e => {
                reject(e);
              },
            );
          });
        }}
      />
      <FileExampleCase />
      <TestCase.Logical
        itShould="retrieve local image size"
        fn={({expect}) => {
          const resolvedAsset = Image.resolveAssetSource(LOCAL_IMAGE_ASSET_ID);
          expect(resolvedAsset.width).to.be.eq(150);
          expect(resolvedAsset.height).to.be.eq(150);
        }}
      />
      <TestCase.Logical
        skip={noInternetSkipMsg}
        itShould="prefetch image"
        fn={async ({expect}) => {
          let ex: any;
          try {
            await Image.prefetch(WRONG_IMAGE_SRC);
          } catch (e) {
            ex = e;
          }
          expect(ex).to.be.not.undefined;
          expect(await Image.prefetch(REMOTE_IMAGE_URL)).to.be.true;
          expect(await Image.prefetch(REMOTE_IMAGE_URL)).to.be.true;
        }}
      />
      <TestCase.Logical
        skip={noInternetSkipMsg}
        tags={['sequential']}
        itShould="abort prefetch image"
        fn={async ({expect}) => {
          expect(
            await Image.prefetch(
              `${RANDOM_REMOTE_IMAGE_URL}?t=${new Date().getTime()}`,
              // @ts-ignore
              (requestId: number) => {
                setTimeout(() => {
                  Image.abortPrefetch?.(requestId);
                }, 50);
              },
            ),
          ).to.be.false;
        }}
      />
      <TestCase.Logical
        skip={{android: true, harmony: noInternetSkipMsg ?? false}}
        itShould="query cache"
        fn={async ({expect}) => {
          await Image.prefetch(REMOTE_IMAGE_URL);
          expect(Image.queryCache).not.to.be.undefined;
          const result = await Image.queryCache?.([
            REMOTE_IMAGE_URL,
            WRONG_IMAGE_SRC,
          ]);
          expect(result).to.be.not.undefined;
          expect(result?.[REMOTE_IMAGE_URL]).to.be.not.undefined;
          expect(result?.[REMOTE_IMAGE_URL]).to.be.eq('disk');
          expect(result?.[WRONG_IMAGE_SRC]).to.be.undefined;
        }}
      />
      <TestCase.Example
        skip={{android: false, harmony: {arkTs: true, cAPI: true}}} // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/246
        itShould="render circular image on a red rectangle (overlayColor)">
        <Image
          source={LOCAL_IMAGE_ASSET_ID}
          style={{overlayColor: 'red', borderRadius: Number.MAX_SAFE_INTEGER}}
        />
      </TestCase.Example>
      <TestCase.Example itShould="Image should have 10 edge insertion area on four edges.">
        <Image
          source={LOCAL_IMAGE_ASSET_ID}
          capInsets={{top: 10, left: 10, bottom: 10, right: 10}}
        />
      </TestCase.Example>
      <TestCase.Automated
        itShould="display an image even if prefetch fails"
        skip={noInternetSkipMsg}
        initialState={{
          uri: `${REMOTE_IMAGE_URL}&t=${new Date().getTime()}`,
          wasOnErrorCalled: false,
          wasOnLoadEndCalled: false,
        }}
        arrange={({state, setState, done}) => {
          return (
            <Image
              source={{uri: state.uri}}
              style={{width: 100, height: 100}}
              onError={() => {
                setState(prev => ({...prev, wasOnErrorCalled: true}));
              }}
              onLoadEnd={() => {
                setState(prev => ({...prev, wasOnLoadEndCalled: true}));
                done();
              }}
            />
          );
        }}
        act={async ({state}) => {
          await Image.prefetch(
            state.uri,
            // @ts-ignore
            (requestId: number) => {
              setTimeout(() => {
                Image.abortPrefetch?.(requestId);
              }, 10);
            },
          );
        }}
        assert={({expect, state}) => {
          expect(state.wasOnErrorCalled).to.be.eq(false);
        }}
      />
      <TestCase.Automated
        itShould="call onLoadStart"
        initialState={'not called'}
        arrange={({state, setState, done}) => {
          return (
            <View>
              <Text>{JSON.stringify(state)}</Text>
              <Image
                source={LOCAL_IMAGE_ASSET_ID}
                onLoadStart={() => {
                  setState('called');
                  done();
                }}
              />
            </View>
          );
        }}
        act={() => {}}
        assert={({expect, state}) => {
          expect(state).to.be.eq('called');
        }}
      />

      <TestCase.Automated
        itShould="call onProgress"
        //TODO: https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/1521
        skip={'broken'}
        initialState={'not called'}
        arrange={({state, setState, done}) => {
          return (
            <View>
              <Text>{JSON.stringify(state)}</Text>
              <Image
                source={LOCAL_IMAGE_ASSET_ID}
                onProgress={() => {
                  setState('called');
                  done();
                }}
              />
            </View>
          );
        }}
        act={() => {}}
        assert={({expect, state}) => {
          expect(state).to.be.eq('called');
        }}
      />
      <TestCase.Automated
        itShould="call onLoad"
        initialState={{}}
        arrange={({setState, state, done}) => {
          return (
            <View>
              <Text>{JSON.stringify(state)}</Text>
              <Image
                source={LOCAL_IMAGE_ASSET_ID}
                onLoad={event => {
                  setState(event.nativeEvent.source);
                  done();
                }}
              />
            </View>
          );
        }}
        act={() => {}}
        assert={({expect, state}) => {
          expect(state).to.contain.all.keys('width', 'height', 'uri');
        }}
      />
      <TestCase.Automated
        itShould="call onLoadEnd"
        initialState={'not called'}
        arrange={({setState, state, done}) => {
          return (
            <View>
              <Text>{JSON.stringify(state)}</Text>
              <Image
                source={LOCAL_IMAGE_ASSET_ID}
                onLoadEnd={() => {
                  setState('called');
                  done();
                }}
              />
            </View>
          );
        }}
        act={() => {}}
        assert={({expect, state}) => {
          expect(state).to.be.eq('called');
        }}
      />
      <TestCase.Automated
        itShould="call onError (local)"
        initialState={null}
        arrange={({setState, state, done}) => {
          return (
            <View>
              <Text>{JSON.stringify(state)}</Text>
              <Image
                source={require('../assets/fonts/Pacifico-Regular.ttf')}
                onError={event => {
                  setState(event.nativeEvent.error);
                  done();
                }}
              />
            </View>
          );
        }}
        act={() => {}}
        assert={({expect, state}) => {
          expect(state).to.be.not.null;
        }}
      />
      <TestCase.Automated
        itShould="call onError (remote)"
        initialState={null}
        arrange={({setState, state, done}) => {
          return (
            <View>
              <Text>{JSON.stringify(state)}</Text>
              <Image
                source={{uri: 'https://www.google.com/image'}}
                onError={event => {
                  setState(event.nativeEvent.error);
                  done();
                }}
              />
            </View>
          );
        }}
        act={() => {}}
        assert={({expect, state}) => {
          expect(state).to.be.not.null;
        }}
      />
      <TestSuite
        name="resizeMode" // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/245
      >
        <TestCase.Example itShould="render small image in the center (center)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="center"
          />
        </TestCase.Example>
        <TestCase.Example itShould="render image touching top and bottom edges in the center (contain)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="contain"
          />
        </TestCase.Example>
        <TestCase.Example itShould="fully cover test case area while preserving aspect ratio (cover)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="cover"
          />
        </TestCase.Example>
        <TestCase.Example itShould="cover test case area by repeating image (repeat)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="repeat"
          />
        </TestCase.Example>
        <TestCase.Example itShould="cover test case area by stretching (stretch)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="stretch"
          />
        </TestCase.Example>
      </TestSuite>
      <TestSuite name="blurRadius">
        <TestCase.Example itShould="blur images with various blur radius">
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            <Image
              style={{width: 64, height: 64, margin: 4}}
              source={LOCAL_IMAGE_ASSET_ID}
              blurRadius={0}
            />
            <Image
              style={{width: 64, height: 64, margin: 4}}
              source={LOCAL_IMAGE_ASSET_ID}
              blurRadius={5}
            />
            <Image
              style={{width: 64, height: 64, margin: 4}}
              source={LOCAL_IMAGE_ASSET_ID}
              blurRadius={10}
            />
            <Image
              style={{width: 64, height: 64, margin: 4}}
              source={LOCAL_IMAGE_ASSET_ID}
              blurRadius={15}
            />
            <Image
              style={{width: 64, height: 64, margin: 4}}
              source={LOCAL_IMAGE_ASSET_ID}
              blurRadius={20}
            />
            <Image
              style={{width: 64, height: 64, margin: 4}}
              source={LOCAL_IMAGE_ASSET_ID}
              blurRadius={25}
            />
          </View>
        </TestCase.Example>
      </TestSuite>
      <TestCase.Example itShould="replace opaque pixels with the green color (tintColor)">
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <Image
            source={require('../assets/test.png')}
            style={{
              width: 100,
              height: 100,
            }}
          />
          <Image
            source={require('../assets/test.png')}
            style={{
              width: 100,
              height: 100,
              tintColor: 'green',
            }}
          />
        </View>
      </TestCase.Example>
      <TestCase.Example modal itShould="stop displaying on press">
        <SwitchSourceTest />
      </TestCase.Example>
      <TestCase.Example itShould="render top image in a bit lower quality (difference barely visible)">
        <Image
          style={{width: 200, height: 200}}
          source={require('../assets/noise.png')}
          resizeMethod="resize"
          resizeMode="stretch"
        />
        <View style={{height: 10}} />
        <Image
          style={{width: 200, height: 200}}
          source={require('../assets/noise.png')}
          resizeMethod="scale"
          resizeMode="stretch"
        />
      </TestCase.Example>
      <TestCase.Example
        modal
        skip={{android: false, harmony: {arkTs: true, cAPI: true}}} // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/483
        itShould="fade images with varying durations">
        <View style={{flexDirection: 'row', gap: 24}}>
          <View style={{width: 100}}>
            <Image
              // HACK: ?v=Date.now() is used to prevent caching
              // - cached images are not fading/faded in
              source={{uri: REMOTE_IMAGE_URL + '?v=' + Date.now()}}
              style={{width: 100, height: 100, borderRadius: 8}}
              fadeDuration={0}
            />
            <Text>This image will fade in over the time of 0s.</Text>
          </View>
          <View style={{width: 100}}>
            <Image
              source={{uri: REMOTE_IMAGE_URL + '?v=' + Date.now()}}
              style={{width: 100, height: 100, borderRadius: 8}}
              fadeDuration={1500}
            />
            <Text>This image will fade in over the time of 1.5s.</Text>
          </View>
          <View style={{width: 100}}>
            <Image
              source={{uri: REMOTE_IMAGE_URL + '?v=' + Date.now()}}
              style={{width: 100, height: 100, borderRadius: 8}}
              fadeDuration={5000}
            />
            <Text>This image will fade in over the time of 5s.</Text>
          </View>
        </View>
        {/* To test local fadeDuration for localImages you have to disable caching */}
        <View style={{flexDirection: 'row', gap: 24}}>
          <View style={{width: 100}}>
            <Image
              source={LOCAL_IMAGE_ASSET_ID}
              style={{width: 100, height: 100, borderRadius: 8}}
              fadeDuration={0}
            />
            <Text>This image will fade in over the time of 0s.</Text>
          </View>
          <View style={{width: 100}}>
            <Image
              source={LOCAL_IMAGE_ASSET_ID}
              style={{width: 100, height: 100, borderRadius: 8}}
              fadeDuration={1500}
            />
            <Text>This image will fade in over the time of 1.5s.</Text>
          </View>
          <View style={{width: 100}}>
            <Image
              source={LOCAL_IMAGE_ASSET_ID}
              style={{width: 100, height: 100, borderRadius: 8}}
              fadeDuration={5000}
            />
            <Text>This image will fade in over the time of 5s.</Text>
          </View>
        </View>
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="load many large images without causing out-of-memory issues">
        <ScrollView>
          {Array.from({length: 25}, (_, index) => (
            <Image
              key={index}
              style={{width: 200, height: 200}}
              source={{uri: LARGE_REMOTE_IMAGE_URL}}
            />
          ))}
        </ScrollView>
      </TestCase.Example>
      <TestCase.Example itShould="allow scrolling by touching the image">
        <ImagePointerEventsTest />
      </TestCase.Example>
      <TestCase.Example
        skip={{harmony: 'currently fails (in 0.76 and 0.77)', android: false}}
        itShould="display placeholder image before loading image"
        modal>
        <Image
          style={{width: 200, height: 200}}
          source={{
            uri:
              'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' +
              Date.now(),
          }}
          defaultSource={require('../assets/test.png')}
        />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould='Load images from different folders within assets directory (e.g. "assets/large-images", "assets/small-images")'>
        <LoadLocalImagesFromDifferentFolders />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="Display custom loading indicator until image is ready to be displayed">
        <Image
          loadingIndicatorSource={require('../assets/test.png')}
          source={{
            uri:
              'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' +
              +Date.now(),
          }}
          style={{width: '100%', height: 200, marginVertical: 16}}
        />
      </TestCase.Example>
      <TestCase.Example modal itShould="Prefetch large number of images">
        <ImagePrefetchTest />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="Load proper image source for different container dimensions">
        <MultipleSourceImage />
      </TestCase.Example>
      <TestCase.Example modal itShould="Use higher resolution image">
        <ImageSuffixesTest />
      </TestCase.Example>
    </TestSuite>
  );
};

const ImagePointerEventsTest = () => {
  return (
    <View style={{height: 200, justifyContent: 'center', alignItems: 'center'}}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          zIndex: 1,
          height: 150,
          width: 150,
          backgroundColor: 'green',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={LOCAL_IMAGE_ASSET_ID}
          style={{width: 100, height: 100}}
          resizeMode="cover"
          //@ts-ignore
          pointerEvents="none"
        />
      </View>
      <ScrollView style={{height: 200}} horizontal>
        {getScrollViewContentHorizontal({})}
      </ScrollView>
    </View>
  );
};

const ImageExampleCase = ({
  itShould,
  source,
}: {
  itShould: string;
  source: ImageSourcePropType;
}) => (
  <TestCase.Example itShould={itShould}>
    <Image
      style={{borderRadius: 8, borderWidth: 1, height: 150}}
      source={source}
      onError={e => console.error(e.nativeEvent.error, source)}
      // resizeMode="contain"
    />
  </TestCase.Example>
);

const FileExampleCase = () => {
  const [error, setError] = React.useState<string | undefined>(undefined);

  return (
    <TestCase.Example
      skip={{android: true, harmony: {arkTs: false, cAPI: false}}}
      itShould="load image from local file">
      {error !== undefined ? (
        <Text>{error}</Text>
      ) : (
        <Image
          style={{borderRadius: 8, borderWidth: 1, height: 150}}
          source={{uri: FILE_URI}}
          onError={_e =>
            setError(
              'To load the image, place it as' +
                '`/data/app/el2/100/base/com.rnoh.tester/files/pravatar-131.jpg`' +
                ' on your phone',
            )
          }
          // resizeMode="contain"
        />
      )}
    </TestCase.Example>
  );
};

const SwitchSourceTest = () => {
  const SOURCES = [
    REMOTE_IMAGE_URL,
    '',
    REMOTE_REDIRECT_IMAGE_URL,
    WRONG_IMAGE_SRC,
  ];

  const [idx, setIdx] = React.useState(0);

  return (
    <View>
      <View style={{flexDirection: 'row'}}>
        <Image source={{uri: SOURCES[idx]}} style={{width: 100, height: 100}} />
        <Text>{`Source: ${SOURCES[idx]}`}</Text>
      </View>
      <Button
        label="Switch Source"
        onPress={() => {
          setIdx(i => (i + 1) % SOURCES.length);
        }}
      />
    </View>
  );
};

const LOCAL_CODE_IMAGE_ASSET_1 = require('../assets/code-images/altumcode-dMUt0X3f59Q-unsplash.jpg');
const LOCAL_CODE_IMAGE_ASSET_2 = require('../assets/code-images/james-harrison-vpOeXr5wmR4-unsplash.jpg');

const LOCAL_DASHBOARD_IMAGE_ASSET_1 = require('../assets/dashboard-images/dashboard/luke-chesser-JKUTrJ4vK00-unsplash.jpg');
const LOCAL_DASHBOARD_IMAGE_ASSET_2 = require('../assets/dashboard-images/dashboard/stephen-dawson-qwtCeJ5cLYs-unsplash.jpg');

const LoadLocalImagesFromDifferentFolders = () => {
  return (
    <View style={{}}>
      <Text style={{marginTop: 16}}>Images from: /assets/ </Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Image
          style={{width: 100, height: 100, margin: 4, borderRadius: 8}}
          source={LOCAL_IMAGE_ASSET_ID}
        />
      </View>
      <Text style={{marginTop: 16}}>Images from: /assets/code-images/ </Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Image
          style={{width: 100, height: 100, margin: 4, borderRadius: 8}}
          source={LOCAL_CODE_IMAGE_ASSET_1}
        />
        <Image
          style={{width: 100, height: 100, margin: 4, borderRadius: 8}}
          source={LOCAL_CODE_IMAGE_ASSET_2}
        />
      </View>
      <Text style={{marginTop: 16}}>
        Images from: /assets/dashboard-images/dashboard
      </Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Image
          style={{width: 100, height: 100, margin: 4, borderRadius: 8}}
          source={LOCAL_DASHBOARD_IMAGE_ASSET_1}
        />
        <Image
          style={{width: 100, height: 100, margin: 4, borderRadius: 8}}
          source={LOCAL_DASHBOARD_IMAGE_ASSET_2}
        />
      </View>
    </View>
  );
};

const IMAGE_ID_OFFSET = new Date().getTime();
const NUMBER_OF_IMAGES = 45;

const ImagePrefetchTest = () => {
  const [renderImageList, setRenderImageList] = useState(false);

  useEffect(() => {
    // Delay the rendering of the images to allow the prefetch to start
    setTimeout(() => {
      setRenderImageList(true);
    }, 500);

    const promisesArray: Promise<boolean>[] = [];
    for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
      const promise = Image.prefetch(
        REMOTE_IMAGE_URL + '&v=' + (i + IMAGE_ID_OFFSET),
      );
      promisesArray.push(promise);
    }
    Promise.all(promisesArray)
      .then(res => console.log('Successfully loaded all images', res))
      .catch(err => console.log('Failed to load all images', err));
  }, []);

  return (
    <>
      {renderImageList && (
        <ScrollView style={{height: '70%'}}>
          <Button
            label="Reload Images"
            onPress={() => {
              setRenderImageList(false);

              setTimeout(() => {
                setRenderImageList(true);
              }, 500);
            }}
          />
          <View
            style={{
              width: '100%',
              flexWrap: 'wrap',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            {new Array(NUMBER_OF_IMAGES).fill(0).map((_, idx) => {
              return (
                <Image
                  key={idx}
                  source={{
                    uri: REMOTE_IMAGE_URL + '&v=' + (idx + IMAGE_ID_OFFSET),
                  }}
                  style={{
                    width: 60,
                    height: 60,
                    aspectRatio: 1,
                    backgroundColor: 'blue',
                  }}
                />
              );
            })}
          </View>
        </ScrollView>
      )}
    </>
  );
};

const MultipleSourceImage = () => {
  const {containerSizes, imageSources} = useMemo(() => {
    const imageContainerSizes = [
      [100, 100],
      [200, 200],
      [300, 300],
    ];
    const imageSourcesArr = [
      {
        uri: 'https://images.pexels.com/photos/5370674/pexels-photo-5370674.jpeg?cs=tinysrgb&w=100&h=100',
        width: 100,
        height: 100,
      },
      {
        uri: 'https://images.pexels.com/photos/5475178/pexels-photo-5475178.jpeg?w=200&h=200',
        width: 200,
        height: 200,
      },
      {
        uri: 'https://images.pexels.com/photos/27849695/pexels-photo-27849695/free-photo-of-a-man-riding-a-motorcycle-down-a-narrow-street.jpeg?cs=tinysrgb&w=300&h=300',
        width: 300,
        height: 300,
      },
    ];
    const pointScaleFactor = Dimensions.get('screen').scale;
    imageContainerSizes.map(el => [
      el[0] * pointScaleFactor,
      el[1] * pointScaleFactor,
    ]);
    imageSourcesArr.map(el => {
      el.width = el.width * pointScaleFactor;
      el.height = el.height * pointScaleFactor;
    });

    return {
      containerSizes: imageContainerSizes,
      imageSources: imageSourcesArr,
    };
  }, []);

  const [containerSizeIndex, setContainerSizeIndex] = useState(0);
  const [mountImageComponent, setMountImageComponent] = useState(true);

  return (
    <View>
      <Button
        label="Change container size"
        onPress={() => {
          setContainerSizeIndex(
            (containerSizeIndex + 1) % containerSizes.length,
          );
          // Make sure that component is re-mounted to apply new size
          setMountImageComponent(false);
          setTimeout(() => {
            setMountImageComponent(true);
          }, 50);
        }}
      />
      <View
        style={{
          padding: 16,
          backgroundColor: 'red',
          width: '100%',
          height: 325,
        }}>
        {mountImageComponent && (
          <Image
            source={imageSources}
            style={{
              width: containerSizes[containerSizeIndex][0],
              height: containerSizes[containerSizeIndex][1],
            }}
          />
        )}
      </View>
    </View>
  );
};

function ImageSuffixesTest() {
  return (
    <View>
      <Image source={require('../assets/fig-without-poppy.jpeg')} />
    </View>
  );
}

function TextNestedImageTest() {
  return (
    <View>
      <Text>
        This is an image{' '}
        <Image
          source={{uri: REMOTE_IMAGE_URL}}
          style={{height: 25, width: 25}}
        />{' '}
        nested in text.
      </Text>
    </View>
  );
}
