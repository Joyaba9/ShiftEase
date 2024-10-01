import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ManagerPage = () => {
  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <View style={styles.leftPane}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Manage Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add Employee</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Manage Employee</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightPane}>
        <Text style={styles.messagingHeader}>Team Messaging</Text>
        <View style={styles.messagingBox}></View>
      </View>
    </View>
  );
};

// Define styles using StyleSheet.create()
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  leftPane: {
    flex: 1,
    justifyContent: 'space-around',
  },
  rightPane: {
    flex: 2,
    padding: 20,
    backgroundColor: '#e0e8f0',
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: '#333',
  },
  messagingHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  messagingBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
});

export default ManagerPage;
