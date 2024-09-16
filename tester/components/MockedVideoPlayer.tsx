import {View, Text} from 'react-native-harmony';

export function MockedVideoPlayer({
  itemId,
  height,
  playMockVideo,
  prefetchMockVideo,
}: {
  height?: number;
  itemId: string | number;
  playMockVideo: boolean;
  prefetchMockVideo?: boolean;
}) {
  const backgroundPlayingColor = playMockVideo ? 'blue' : 'lightgray';
  const backgroundPrefetchingColor = prefetchMockVideo
    ? 'lightblue'
    : 'lightgray';

  return (
    <View
      style={{
        height: height ?? 200,
        backgroundColor: playMockVideo
          ? backgroundPlayingColor
          : backgroundPrefetchingColor,
        borderWidth: 2,
        marginBottom: 5,
        justifyContent: 'center',
      }}>
      <Text style={{textAlign: 'center'}}>Item with id: {itemId}</Text>
      <Text style={{textAlign: 'center'}}>Mocked Video Player</Text>
      <Text style={{textAlign: 'center'}}>
        {playMockVideo
          ? 'Playing'
          : prefetchMockVideo
            ? 'Prefetching...'
            : 'Waiting to be visible'}
      </Text>
    </View>
  );
}
