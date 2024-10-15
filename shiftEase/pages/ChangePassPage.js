import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CommonLayout from "./CommonLayout";

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
      const response = await fetch('http://localhost:5050/api/change-password', {
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
    <CommonLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={isMobile} // Only enable on mobile
      >
        <View style={styles.container}>
          <Text style={styles.header}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Employee ID"
            value={employeeId}
            onChangeText={setEmployeeId}
          />
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            value={currentPass}
            onChangeText={setCurrentPass}
            secureTextEntry={!showPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPass}
            onChangeText={setNewPass}
            secureTextEntry={!showPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={confirmNewPass}
            onChangeText={setConfirmPass}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text>{showPassword ? 'Hide' : 'Show'} Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleNewPassword}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </CommonLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ChangePassPage;