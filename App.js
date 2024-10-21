import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import NavigationManager from './shiftEase/pages/NavigationManager';
import { store } from './shiftEase/redux/store';



export default function App() {
  console.log("App is rendering");
  return (
    // Wrap the app in the Provider and pass the store
    <Provider store={store}>
      <View style={styles.container}>
        <NavigationManager />
        <StatusBar style="auto" />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
