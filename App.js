import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NavigationManager from './shiftEase/pages/NavigationManager';
import { store, persistor } from './shiftEase/redux/store';



export default function App() {
  console.log("App is rendering");
  return (
    // Wrap the app in the Provider and pass the store
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={styles.container}>
          <NavigationManager />
          <StatusBar style="auto" />
        </View>
      </PersistGate>  
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
