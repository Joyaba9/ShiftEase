import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, TextInput, View } from 'react-native';
import CommonLayout from "../common/CommonLayout";
import { useNavigation } from '@react-navigation/native';
import { getBusinessById } from '../manager/manageBusiness/businessMockDatabase';


const { width } = Dimensions.get('window');

const RegistrationPage = () => {
  const isMobile = width < 768;
  const navigation = useNavigation();

  // State variables to store the form data
  const [businessId, setBusinessId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State to track whether the success message should be shown after saving
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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
  
      // Check the response status after registering the business
      if (response.status === 201) {

        // If registration is successful, make a second request to fetch the business ID
        try{
          const response = await fetch('http://localhost:5050/api/getBusinessId', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              business_email: businessEmail,
            })
          });
        
          // Parse the response to extract the business_id
          const data = await response.json();

          // If the business_id is returned successfully, store it in state
          if (data && data.business_id) {
            const businessId = data.business_id; // Extract business ID from the response
            setBusinessId(businessId); // Store the received business_id in state
          } else {
            alert('Business ID not found in response');
          }
        } catch (err) {
          console.error('Error receiving business_id:', err);
          alert('Error receiving business_id');
        }

        // Show the success message indicating the registration was successful with the Business ID displayed
        setShowSuccessMessage(true);

        // Hide the message after 7 seconds
        setTimeout(() => {
            setShowSuccessMessage(false);
            navigation.navigate('Login'); // Navigate to Login after success
        }, 7000); // 7000 ms = 7 seconds
        
        

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
        logo={require('../../assets/images/logo1.png')}
        mainImage={require('../../assets/images/woman.png')}
        customStyles={{
          mobileBottomContainer: isMobile ? { top: '25%' } : {},
          contentWrapper: !isMobile ? { flexDirection: 'row-reverse' } : {}, // Reverse layout on web
          inputContainer: !isMobile ? { paddingRight: 0 } : {},
          formContainer: !isMobile ? { paddingLeft: 40, paddingRight: 40 } : {},
          desktopLogo: !isMobile ? {height: 90} : {}
        }}
      >
        {/* Directly render TextInput components */}

        <Text style={styles.label}>Business Name</Text>

        <TextInput
          placeholder="Enter your business name"
          placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
          value={businessName}
          onChangeText={setBusinessName}
          style={styles.input}
        />

        <Text style={styles.label}>Email Address</Text>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
          value={businessEmail}
          onChangeText={setBusinessEmail}
          keyboardType='email-address'
          style={styles.input}
        />
        
        <View style={styles.passContainer}>
          <Text style={styles.label}>Password</Text>

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
          placeholder="Enter your password"
          placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry = {!showPassword}
          style={styles.input}
        />

        <View style={styles.passContainer}>
          <Text style={styles.label}>Confirm Password</Text>  

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
          placeholder="Confirm your password"
          placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry = {!showPassword}
          style={styles.input}
        />

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={registerBusiness}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style = {styles.loginText}>Back to Login!</Text>
        </TouchableOpacity>

        {/* Render success message if showSuccessMessage is true */}
        {showSuccessMessage && (
          <Text style={styles.successMessage}>Business registered successfully! Business ID: {businessId}</Text>
        )}
      </CommonLayout>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  passContainer: {
    width: '100%',
    flexDirection: 'row', 
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',  
    alignSelf: 'flex-start',
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
  loginText: {
    marginBottom: 30, // Correct way to apply marginBottom
    fontSize: 15,
    color: 'black',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: 10,
    marginBottom: 40,
    textAlign: 'center',
    borderRadius: 5,
    fontSize: 16,
  },
});

export default RegistrationPage;
