import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import NavigationManager from './shiftEase/pages/NavigationManager';



export default function App() {
  console.log("App is rendering");
  return (
    <View style={styles.container}>
      <NavigationManager />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
