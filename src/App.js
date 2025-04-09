import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function App() {
  return (
    <View style={styles.app}>
      <View style={styles.header}>
        <Text style={styles.title}>Hello World</Text>
        <View style={styles.namesContainer}>
          <Text style={styles.name}>Carl</Text>
          <Text style={styles.name}>Aharon</Text>
          <Text style={styles.name}>Jake</Text>
          <Text style={styles.name}>Jonothan</Text>
          <Text style={styles.name}>Jacob</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  namesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10, // Note: gap is not supported in React Native; use margin instead
  },
  name: {
    marginHorizontal: 5,
    fontSize: 16,
  },
});

export default App;
