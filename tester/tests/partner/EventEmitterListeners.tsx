// App.js

import React, {useState, useEffect} from 'react';
import {View, Text, Button, DeviceEventEmitter} from 'react-native';

export function EventEmitterListeners() {
  const [eventData, setEventData] = useState(null);
  const [listenersList, setListenersList] = useState([]);

  // 定义事件监听器
  const listener1 = message => {
    console.log('Listener 1 received:', message);
    setEventData(`Listener 1: ${message}`);
  };

  const listener2 = message => {
    console.log('Listener 2 received:', message);
    setEventData(`Listener 2: ${message}`);
  };

  useEffect(() => {
    // 注册事件监听器
    DeviceEventEmitter.addListener('event1', listener1);
    DeviceEventEmitter.addListener('event1', listener2);

    // 获取 event1 的所有监听器
    const listeners = DeviceEventEmitter.listeners('event1');
    setListenersList(listeners);

    // 清理时移除监听器
    return () => {
      DeviceEventEmitter.removeListener('event1', listener1);
      DeviceEventEmitter.removeListener('event1', listener2);
    };
  }, []);

  const triggerEvent = () => {
    // 触发 event1 事件
    DeviceEventEmitter.emit('event1', 'Hello from DeviceEventEmitter!');
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>{eventData || 'No data received yet'}</Text>
      <Button title="Trigger Event" onPress={triggerEvent} />
      <Text style={{marginTop: 20}}>Listeners for "event1":</Text>
      {listenersList.length > 0 ? (
        listenersList.map((listener, index) => (
          <Text key={index}>
            Listener {index + 1}: {listener.name}
          </Text>
        ))
      ) : (
        <Text>No listeners found.</Text>
      )}
    </View>
  );
}
