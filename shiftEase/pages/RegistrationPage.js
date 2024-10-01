import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, TextInput } from 'react-native';
import CommonLayout from "./CommonLayout";
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const RegistrationPage = () => {
  const isMobile = width < 768;
  const navigation = useNavigation();

  // State variables to store the form data
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const registerBusiness = async () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate that all fields are filled
    if (!businessName || !businessEmail || !password) {
      alert('Please fill in all the fields');
      return;
    }
  
    // Call the backend API to register the business
    try {
      const response = await fetch('http://localhost:5050/api/regBusiness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName,
          businessEmail,
          password
        })
      });
  
      // Check the response status
      if (response.status === 201) {
        alert('Business registered successfully');
         navigation.navigate('Manager');
      } else {
        alert('Error registering business');
      }
    } catch (err) {
      console.error('Error registering business:', err);
      alert('Error registering business');
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={isMobile} // Only enable on mobile
    >
      <CommonLayout
        isMobile={isMobile}
        logo={require('../assets/images/logo1.png')}
        mainImage={require('../assets/images/woman.png')}
        customStyles={{
          mobileBottomContainer: isMobile ? { top: '25%' } : {},
          contentWrapper: !isMobile ? { flexDirection: 'row-reverse' } : {}, // Reverse layout on web
          inputContainer: !isMobile ? { paddingRight: 0 } : {},
          formContainer: !isMobile ? { paddingLeft: 40, paddingRight: 40 } : {},
        }}
      >
        {/* Directly render TextInput components */}
        <TextInput
          placeholder="Enter your business name"
          value={businessName}
          onChangeText={setBusinessName}
          style={styles.input}
        />
        <TextInput
          placeholder="Enter your email"
          value={businessEmail}
          onChangeText={setBusinessEmail}
          keyboardType='email-address'
          style={styles.input}
        />
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={registerBusiness}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text>Back to Login!</Text>
        </TouchableOpacity>
      </CommonLayout>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  registerButton: {
    borderRadius: 16,
    backgroundColor: 'rgba(17, 17, 17, 1)',
    width: 250,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 70,
    marginTop: 20,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '500',
  },
});

export default RegistrationPage;
