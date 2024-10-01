import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ManagerPage = () => {
  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity>
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.navText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Left Pane with Buttons */}
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

        {/* Right Pane with Messaging Box */}
        <View style={styles.rightPane}>
          <Text style={styles.messagingHeader}>Team Messaging</Text>
          <View style={styles.messagingBox}></View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },

  logo: {
    width: 120,
    height: 40,
  },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  navText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
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
