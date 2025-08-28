const {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = require('react-native');

const Item = (props) => {
  return (
    <View style={styles.item}>
      <Text>{props.msg}</Text>
    </View>
  );
};

const createItemRow = (msg, index) => <Item key={index} msg={msg} />;

const SimpleScrollViewComponent = () => {
  let _scrollView;

  const ITEMS = [...Array(12)].map((_, i) => `Item ${i}`);

  return (
    <View>
      <ScrollView
        ref={(scrollView) => {
          _scrollView = scrollView;
        }}
        automaticallyAdjustContentInsets={false}
        onScroll={() => {
          console.log('onScroll!');
        }}
        scrollEventThrottle={200}
        style={styles.scrollView}
      >
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={() => _scrollView.scrollWithoutAnimationTo(0, 0)}>
        <Text>Scroll to top</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => _scrollView.scrollToEnd({ animated: true })}>
        <Text>Scroll to bottom</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#eeeeee',
    height: 300,
  },
  button: {
    margin: 5,
    padding: 5,
    alignItems: 'center',
    backgroundColor: '#cccccc',
    borderRadius: 3,
  },
  item: {
    margin: 5,
    padding: 5,
    backgroundColor: '#cccccc',
    borderRadius: 3,
    minWidth: 96,
  },
});

exports.displayName = 'ScrollViewScrollWithoutAnimationToExample';
exports.title = '<ScrollViewScrollWithoutAnimationToExample>';
exports.description = 'A simple example of a ScrollView component with buttons to scroll to the top with scrollWithoutAnimationTo';
exports.examples = [
  {
    title: 'ScrollView with scrollWithoutAnimationTo',
    description: 'This example demonstrates a simple scrollable view with buttons to scroll to the top and bottom of the content.',
    render: function() {
      return <SimpleScrollViewComponent />;
    },
  },
];