import { FC, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PALETTE } from './palette';

export const TestCaseStateTemplate: FC<{
  name: string;
  renderStatusLabel: () => any;
  renderDetails?: () => any;
  renderModal?: () => any;
}> = ({ name, renderModal, renderDetails, renderStatusLabel }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const renderName = (customStyles: any) => (
    <Text
      style={[
        styles.testCaseHeader,
        {
          ...customStyles,
        },
      ]}
    >
      {name}
    </Text>
  );

  return (
    <View style={styles.testCaseContainer}>
      <View style={styles.testCaseHeaderContainer}>
        {!!renderModal ? (
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              setIsModalVisible(true);
            }}
          >
            {renderName({ color: PALETTE.purple, fontWeight: 'bold' })}
          </TouchableOpacity>
        ) : (
          renderName({})
        )}
        {renderStatusLabel && renderStatusLabel()}
      </View>
      {!!renderModal && (
        <Modal visible={isModalVisible} transparent>
          <View
            style={{
              width: '100%',
              flex: 1,
              backgroundColor: '#222',
              padding: 16,
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  color: PALETTE.purple,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
            <View style={styles.testCaseHeaderContainer}>
              {renderName({})}
              {renderStatusLabel && renderStatusLabel()}
            </View>
            {renderModal()}
          </View>
        </Modal>
      )}
      {renderDetails && renderDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  testCaseContainer: {
    marginBottom: 16,
  },
  testCaseHeaderContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  testCaseHeader: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    color: '#EEE',
  },
});
