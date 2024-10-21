import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CommonLayout from '../common/CommonLayout';

const { width } = Dimensions.get('window');

// ChangePassPage component
const ChangePassPage = () => {
  const isMobile = width < 768;
  const navigation = useNavigation();

  console.log('ChangePassPage rendered');

  // State variables to store form data
  const [employeeId, setEmployeeId] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNewPassword = async () => {
    // Validate that all fields are filled
    if (!employeeId || !currentPass || !newPass || !confirmNewPass) {
      alert('Please fill in all fields');
      return;
    }

    // Validate that the new password and confirmation password match
    if (newPass !== confirmNewPass) {
      alert('Passwords do not match');
      return;
    }

    console.log('trying to change password');

    // Call the backend API to handle password change
    try {
      const response = await fetch('http://localhost:5050/api/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: employeeId,
          currentPassword: currentPass,
          newPassword: newPass
        })
      });

      const data = await response.json();

      if (response.status === 200) {
        alert('Password changed successfully');
        navigation.navigate('Login'); // Navigate to the Login page upon successful password change
      } else {
        alert('Failed to change password: ' + data.error);
      }
    } catch (err) {
      console.error('Error during password change:', err);
      alert('An error occurred during password change. Please try again.');
    }
  };

  return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={isMobile} // Only enable on mobile
      >
    
        <CommonLayout
          isMobile={isMobile} // Pass the isMobile prop to CommonLayout
          logo={require('../../assets/images/logo1.png')}
          mainImage={require('../../assets/images/retail_worker_happy.jpg')}
          customStyles={{
            mobileBottomContainer: isMobile ? { top: '25%' } : {},
            mobileLogo: isMobile ? ({ 
              height: 90,  /* Adjust this to limit the height */
              overflow: 'hidden',
              maxHeight: '100%',
             }) : {},
            inputContainer: !isMobile ? { paddingRight: 0 } : {},
            logoContainer: !isMobile ? 
            ({
              height: 90,  /* Adjust this to limit the height */
              overflow: 'hidden',
              marginTop: 20,
              marginBottom: 0
            }) : {},
            //formContainer: !isMobile ? { paddingLeft: 40, paddingRight: 40 } : {},
          }}
        >
            <View style={isMobile ? styles.mobileContainer : styles.container}>
              <Text style={styles.header}>Change Password</Text>

              <Text style={styles.label}>Employee ID:</Text>

              <TextInput
                style={styles.input}
                placeholder="Employee ID"
                placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
                value={employeeId}
                onChangeText={setEmployeeId}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}> Current Password:</Text>
              
                <TouchableOpacity
                  style={styles.showHideButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Image
                      resizeMode="contain"
                      source={{ uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/f3b55df132da99dbc33a809c79877e7b0101eee6c8864bc69b8efc2d312f6d9c?placeholderIfAbsent=true&apiKey=b4d9577c60d14a339753390c221813ce" }}
                      style={styles.eyeIcon}
                  />
                  <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Current Password"
                placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
                value={currentPass}
                onChangeText={setCurrentPass}
                secureTextEntry={!showPassword}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}> New Password:</Text>
              
                <TouchableOpacity
                  style={styles.showHideButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Image
                      resizeMode="contain"
                      source={{ uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/f3b55df132da99dbc33a809c79877e7b0101eee6c8864bc69b8efc2d312f6d9c?placeholderIfAbsent=true&apiKey=b4d9577c60d14a339753390c221813ce" }}
                      style={styles.eyeIcon}
                  />
                  <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
                value={newPass}
                onChangeText={setNewPass}
                secureTextEntry={!showPassword}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}> Confirm New Password:</Text>
              
                <TouchableOpacity
                  style={styles.showHideButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Image
                      resizeMode="contain"
                      source={{ uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/f3b55df132da99dbc33a809c79877e7b0101eee6c8864bc69b8efc2d312f6d9c?placeholderIfAbsent=true&apiKey=b4d9577c60d14a339753390c221813ce" }}
                      style={styles.eyeIcon}
                  />
                  <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
                value={confirmNewPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showPassword}
              />
      
              <TouchableOpacity style={styles.button} onPress={handleNewPassword}>
                <Text style={styles.buttonText}>Change Password</Text>
              </TouchableOpacity>

            </View>
        </CommonLayout>
      </KeyboardAvoidingView>  
  );
};

const styles = StyleSheet.create({
  mobileContainer: {
    width: '100%',
    justifyContent: 'center',
    padding: 20,
    marginTop: 0,
    marginBottom: 20,
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',  
    alignSelf: 'flex-start',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row', 
  },
  input: {
    width: '100%',
    height: 56,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  showHideButton: {
    position: 'absolute',
    right: 10, 
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 24,
    height: 24,
    marginRight: 3,
  },
  showHideText: {
    fontSize: 16,
    color: "rgba(102, 102, 102, 1)",
  },
  button: {
    alignSelf: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(17, 17, 17, 1)',
    width: 300,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 70,
    marginTop: 20,
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ChangePassPage;