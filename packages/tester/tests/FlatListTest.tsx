import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  FlatListProps,
  TouchableOpacity,
  ViewToken,
  ScrollViewComponent,
  ScrollResponderMixin,
  ViewabilityConfig,
} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {
  Button,
  MockedVideoPlayer,
  ObjectDisplayer,
  TestCase,
} from '../components';

interface ItemData {
  title: string;
  id: string;
}
const DATA: ItemData[] = [
  {
    id: 'gd5jc6gnbb2sbrz9w8z2',
    title: 'First Item',
  },
  {
    id: 'jb95igwbswt13etu073o',
    title: 'Second Item',
  },
  {
    id: 'zcp3zsdkkjmc7cx66hjl',
    title: 'Third Item',
  },
  {
    id: 'fx72rfguehrydmd4n21l',
    title: 'Fourth Item',
  },
  {
    id: '8kadvdlhtr7m3yv3fp4v',
    title: 'Fifth Item',
  },
];

type ItemProps = {title: string};

const Item = ({title}: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);
const commonProps = {
  style: {
    height: 120,
  },
  data: DATA,
  nestedScrollEnabled: true,
  renderItem: ({item}) => <Item title={item.title} />,
  keyExtractor: item => item.id,
} satisfies FlatListProps<any>;

export const FlatListTest = () => {
  return (
    <TestSuite name="FlatList">
      <TestCase.Example itShould="display items in the FlatList (data, renderItem)">
        <FlatList {...commonProps} />
      </TestCase.Example>
      <TestCase.Example itShould="display items with separator between them in the FlatList">
        <FlatList
          {...commonProps}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 2,
                alignSelf: 'center',
                width: '90%',
                backgroundColor: 'black',
              }}
            />
          )}
        />
      </TestCase.Example>
      <TestCase.Example modal itShould="render only the first two items">
        <InitialNumToRenderTestCase />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="display an array of fully visible items">
        <ObjectDisplayer
          renderContent={setObject => {
            return <ViewabilityConfigTest setObject={setObject} />;
          }}
        />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="turn the items red on press (extraData)">
        <ExtraDataTestCase />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="the left list should render the added items one by one, while the right list should render almost all at once (maxToRenderPerBatch)">
        <MaxToRenderPerBatchTestCase />
      </TestCase.Example>
      <TestCase.Example itShould="display empty list with a text saying that the list is empty ">
        <View style={{height: 40}}>
          <FlatList
            data={[]}
            nestedScrollEnabled
            renderItem={() => null}
            ListEmptyComponent={
              <Text style={{textAlign: 'center'}}>This list is empty</Text>
            }
          />
        </View>
      </TestCase.Example>
      <TestCase.Example
        skip={{android: false, harmony: {arkTs: true, cAPI: true}}}
        itShould="scroll to the third item at the middle (scrollToIndex)">
        <ScrollToIndexTestCase />
      </TestCase.Example>
      <TestCase.Example itShould="scroll to the third item at the middle (scrollToOffset)">
        <ScrollToOffsetTestCase />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="scroll to the third item (scrollToItem)">
        <ScrollToItemTestCase />
      </TestCase.Example>
      <TestCase.Example
        modal
        skip={{android: true, harmony: {arkTs: false, cAPI: false}}}
        itShould="support sticky headers (fails on Android with enabled Fabric)">
        <View style={{height: 100, backgroundColor: '#fff'}}>
          <FlatList
            data={DATA}
            renderItem={({item}) => (
              <View
                style={{
                  padding: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                }}>
                <Text style={{fontSize: 16}}>{item.title}</Text>
              </View>
            )}
            keyExtractor={item => item.id}
            ListHeaderComponent={() => (
              <View
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  Sticky Header
                </Text>
              </View>
            )}
            stickyHeaderIndices={[0]} // Make the header sticky
          />
        </View>
      </TestCase.Example>
      <TestCase.Manual
        modal
        itShould="get the node number - getScrollableNode()"
        initialState={undefined}
        arrange={({state, setState}) => {
          return (
            <FlatListGetScrollableNode state={state} setState={setState} />
          );
        }}
        assert={({state, expect}) => {
          expect(state).to.be.an('number');
        }}
      />
      <TestCase.Manual
        modal
        itShould="get the nativeScrollRef - getNativeScrollRef()"
        initialState={undefined}
        arrange={({state, setState}) => {
          return (
            <FlatListGetNativeScrollRef state={state} setState={setState} />
          );
        }}
        assert={({state, expect}) => {
          expect(state).to.be.not.undefined;
        }}
      />
      <TestCase.Manual
        modal
        itShould="get the scroll responder - getScrollResponder()"
        initialState={undefined}
        arrange={({state, setState}) => {
          return (
            <FlatListGetScrollResponder state={state} setState={setState} />
          );
        }}
        assert={({state, expect}) => {
          expect(state).to.be.not.undefined;
        }}
      />
      <TestCase.Example
        modal
        itShould="change background color of visible items after scrolling slightly (to blue when fully visible and lightblue when at least 20% is visible)">
        <FlatListTestViewabiliyConfigCallbackPairs />
      </TestCase.Example>
      <TestCase.Example
        modal
        skip={{
          android: 'fails on Android with enabled Fabric',
          harmony: {arkTs: false, cAPI: false},
        }}
        itShould="stick first item to the bottom (invertStickyHeaders)">
        <View style={{height: 100, backgroundColor: '#fff'}}>
          <FlatList
            data={DATA}
            renderItem={({item}) => (
              <View
                style={{
                  padding: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                }}>
                <Text style={{fontSize: 16}}>{item.title}</Text>
              </View>
            )}
            keyExtractor={item => item.id}
            ListHeaderComponent={() => (
              <View
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>Header</Text>
              </View>
            )}
            stickyHeaderIndices={[1]}
            invertStickyHeaders
          />
        </View>
      </TestCase.Example>
    </TestSuite>
  );
};
function InitialNumToRenderTestCase() {
  return (
    <View
      style={{
        height: 120,
      }}>
      <FlatList
        style={{
          height: 120,
        }}
        data={DATA}
        nestedScrollEnabled
        renderItem={({item}) => {
          return <Item title={item.title} />;
        }}
        keyExtractor={item => item.id}
        initialNumToRender={2}
        windowSize={1}
      />
    </View>
  );
}
function ViewabilityConfigTest({
  setObject,
}: {
  setObject: (obj: Object) => void;
}) {
  const viewabilityConfig = {viewAreaCoveragePercentThreshold: 100};
  const onViewableItemsChanged = useRef(
    (item: {viewableItems: Array<ViewToken>; changed: Array<ViewToken>}) => {
      setObject(item.viewableItems.map(i => i.item));
    },
  );
  return (
    <View style={{height: 300}}>
      <FlatList
        {...commonProps}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
    </View>
  );
}

function MaxToRenderPerBatchTestCase() {
  const [data, setData] = useState<string[]>([]);

  const renderItem = ({item}: {item: string; index: number}) => {
    return <Text style={{height: 20}}>{item}</Text>;
  };

  return (
    <View style={{height: 500}}>
      <View style={{flexDirection: 'row'}}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          maxToRenderPerBatch={1}
        />
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          maxToRenderPerBatch={60}
        />
      </View>
      <Button
        label="Add 60 items"
        onPress={() => {
          setData(prevData => [
            ...prevData,
            ...Array.from({length: 60}, (_, i) => `New item ${i + 1}`),
          ]);
        }}
      />
    </View>
  );
}

interface SelectableListItemProps {
  id: string;
  onPressItem: (id: string) => void;
  selected: boolean;
  title: string;
}

class SelectableListItem extends React.PureComponent<SelectableListItemProps> {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const textColor = this.props.selected ? 'red' : 'black';
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View>
          <Text style={{color: textColor}}>{this.props.title}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

interface MultiSelectListState {
  selected: Map<string, boolean>;
}

class ExtraDataTestCase extends React.PureComponent<{}, MultiSelectListState> {
  state: MultiSelectListState = {
    selected: new Map<string, boolean>(),
  };

  _keyExtractor = (item: ItemData, _index: number) => item.id;

  _onPressItem = (id: string) => {
    this.setState(state => {
      const selected = new Map(state.selected);
      selected.set(id, !selected.get(id));
      return {selected};
    });
  };

  _renderItem = ({item}: {item: ItemData}) => (
    <SelectableListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={!!this.state.selected.get(item.id)}
      title={item.title}
    />
  );

  render() {
    return (
      <View style={{height: 200}}>
        <FlatList
          data={DATA}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
      </View>
    );
  }
}

function ScrollToIndexTestCase() {
  const flatlistRef = useRef<FlatList>(null);
  const [error, setError] = useState('');
  return (
    <>
      <Button
        label={'Scroll to the 3rd item at the middle'}
        onPress={() => {
          flatlistRef.current?.scrollToIndex({
            animated: true,
            index: 2,
            viewPosition: 0.5,
          });
        }}
      />
      <FlatList
        {...commonProps}
        ref={flatlistRef}
        onScrollToIndexFailed={info => {
          setError('Scroll to index failed ' + JSON.stringify(info));
        }}
      />
      <Text>{error}</Text>
    </>
  );
}
function ScrollToOffsetTestCase() {
  const flatlistRef = useRef<FlatList>(null);

  return (
    <>
      <Button
        label={'Scroll to the 3rd item at top'}
        onPress={() => {
          flatlistRef.current?.scrollToOffset({
            animated: true,
            offset: 200,
          });
        }}
      />
      <FlatList {...commonProps} ref={flatlistRef} />
    </>
  );
}
function ScrollToItemTestCase() {
  const flatlistRef = useRef<FlatList>(null);

  return (
    <>
      <Button
        label={'Scroll to the 3rd item'}
        onPress={() => {
          flatlistRef.current?.scrollToItem({
            animated: true,
            item: DATA[2],
          });
        }}
      />
      <FlatList {...commonProps} ref={flatlistRef} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
    height: 40,
    width: '100%',
  },
});

function FlatListGetScrollableNode({
  state,
  setState,
}: {
  state: number | undefined;
  setState: (state: any) => void;
}) {
  const flatlistRef = useRef<FlatList>(null);

  const getScrollableNode = useCallback(() => {
    const node = flatlistRef.current?.getScrollableNode();
    setState(node);
  }, []);

  return (
    <>
      <Button label={'Get Scrollable Node'} onPress={getScrollableNode} />
      <FlatList {...commonProps} ref={flatlistRef} />
      <Text>{state}</Text>
    </>
  );
}

type NativeScrollRef = React.ElementRef<typeof ScrollViewComponent>;

function FlatListGetNativeScrollRef({
  setState,
}: {
  state: NativeScrollRef | undefined;
  setState: (state: any) => void;
}) {
  const flatlistRef = useRef<FlatList>(null);

  const getNativeScrollRef = useCallback(() => {
    const nativeScrollRef = flatlistRef.current?.getNativeScrollRef();
    setState(nativeScrollRef);
  }, []);

  return (
    <>
      <Button label={'Get nativeScrollRef'} onPress={getNativeScrollRef} />
      <FlatList {...commonProps} ref={flatlistRef} />
    </>
  );
}

function FlatListGetScrollResponder({
  setState,
}: {
  state: ScrollResponderMixin | undefined;
  setState: (state: any) => void;
}) {
  const flatlistRef = useRef<FlatList>(null);

  const getScrollResponder = useCallback(() => {
    const scrollResponder = flatlistRef.current?.getScrollResponder();
    setState(scrollResponder);
  }, []);

  return (
    <>
      <Button label={'Get scrollResponder'} onPress={getScrollResponder} />
      <FlatList {...commonProps} ref={flatlistRef} />
    </>
  );
}

const firstViewabilityConfig: ViewabilityConfig = {
  waitForInteraction: true,
  minimumViewTime: 100,
  itemVisiblePercentThreshold: 100,
};

const secondViewabilityConfig: ViewabilityConfig = {
  waitForInteraction: true,
  minimumViewTime: 100,
  itemVisiblePercentThreshold: 20,
};

const CUSTOM_DATA: ItemData[] = Array(50)
  .fill(0)
  .map((_, index) => ({
    id: index.toString(),
    title: `Item ${index + 1}`,
  }));

function FlatListTestViewabiliyConfigCallbackPairs() {
  const [firstVisibleItems, setFirstVisibleItems] = useState<string[]>([]);
  const [secondVisibleItems, setSecondVisibleItems] = useState<string[]>([]);

  const viewabilityConfigCallbackPairsRef = useRef([
    {
      viewabilityConfig: firstViewabilityConfig,
      onViewableItemsChanged: ({
        viewableItems,
      }: OnViewableItemsChangedType<ItemData>) => {
        const newFirstVisibleItems = viewableItems.map(
          viewableItem => viewableItem.item.id,
        );
        setFirstVisibleItems(newFirstVisibleItems);
      },
    },
    {
      viewabilityConfig: secondViewabilityConfig,
      onViewableItemsChanged: ({
        viewableItems,
      }: OnViewableItemsChangedType<ItemData>) => {
        const newSecondVisibleItems = viewableItems.map(
          viewableItem => viewableItem.item.id,
        );
        setSecondVisibleItems(newSecondVisibleItems);
      },
    },
  ]);

  return (
    <View style={{height: 600}}>
      <View style={{marginBottom: 10}}>
        <Text>
          First threshold {firstViewabilityConfig.itemVisiblePercentThreshold}%{' '}
          visible items are: {JSON.stringify(firstVisibleItems)}
        </Text>
        <Text>
          second threshold {secondViewabilityConfig.itemVisiblePercentThreshold}
          % visible items are: {JSON.stringify(secondVisibleItems)}
        </Text>
      </View>
      <FlatList
        data={CUSTOM_DATA}
        nestedScrollEnabled={true}
        renderItem={({item}: {item: ItemData}) => (
          <MockedVideoPlayer
            height={300}
            itemId={item.id}
            playMockVideo={firstVisibleItems.includes(item.id)}
            prefetchMockVideo={secondVisibleItems.includes(item.id)}
          />
        )}
        keyExtractor={(item: ItemData) => item.id}
        viewabilityConfigCallbackPairs={
          viewabilityConfigCallbackPairsRef.current
        }
      />
    </View>
  );
}
interface ViewItemToken<TItem> {
  item: TItem;
  key: string;
  index: number | null;
  isViewable: boolean;
  section?: any | undefined;
}
type OnViewableItemsChangedType<TItem> = {
  viewableItems: Array<ViewItemToken<TItem>>;
  changed: Array<ViewItemToken<TItem>>;
};

export default FlatListTest;
