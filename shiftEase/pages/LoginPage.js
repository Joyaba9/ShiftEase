import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, TextInput } from 'react-native';
import CommonLayout from "./CommonLayout";
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// LoginPage component
const LoginPage = () => {
  const isMobile = width < 768;
  const navigation = useNavigation();

  // State variables to store form data
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Validate that all fields are filled
    if (!employeeId || !password) {
      alert('Please enter both Employee ID and Password');
      return;
    }

    // Call the backend API to handle login
    // not implemented yet but assuming it will be the same server as the registration
    try {
      const response = await fetch('http://localhost:5050/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId,
          password
        })
      });

      // Check the response status
      if (response.status === 200) {
        alert('Login successful');
        navigation.navigate('Manager'); // Navigate to the Manager page upon successful login
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert('Login error');
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
        logo={require('../assets/images/logo1.png')}
        mainImage={require('../assets/images/two_women.jpg')}
        customStyles={{
          mobileBottomContainer: isMobile ? { top: '25%' } : {},
          contentWrapper: !isMobile ? { flexDirection: 'row-reverse' } : {}, // Reverse layout on web
          inputContainer: !isMobile ? { paddingRight: 0 } : {},
          formContainer: !isMobile ? { paddingLeft: 40, paddingRight: 40 } : {},
        }}
      >
        {/* Directly render TextInput components */}
        <TextInput
          placeholder="Enter your employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          style={styles.input}
        />
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        
        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPass')} style={{ alignSelf: 'flex-end' }}>
          <Text>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Register Here */}
        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text>Register Here!</Text>
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
  loginButton: {
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

export default LoginPage;
