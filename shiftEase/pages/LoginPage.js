import React from "react";
import { StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import CommonLayout from './CommonLayout';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');

const loginInputFields = [
  { label: 'Employee ID', placeholder: 'Enter your employee ID' },
  { label: 'Password', placeholder: 'Enter your password', isPassword: true }
];

const LoginPage = () => {
  const isMobile = width < 768;
  const navigation = useNavigation();

  return (
    <>
      {isMobile ? (
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <CommonLayout
            inputFields={loginInputFields}
            isMobile={isMobile}
            logo={require("../assets/images/logo1.png")}
            mainImage={require("../assets/images/two_women.jpg")}
            customStyles={{
              mobileLogo: {marginTop: 40}
            }}
          >
            <TouchableOpacity 
              style={{ alignSelf: 'flex-end' }}
              onPress={() => navigation.navigate('ForgotPass')}
            >
              <Text>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileButton}
              onPress={""}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Registration')}
            >
              <Text>Register Here!</Text>
            </TouchableOpacity>

          </CommonLayout>
        </KeyboardAvoidingView>
      ) : (
        <CommonLayout
          inputFields={loginInputFields}
          isMobile={isMobile}
          logo={require("../assets/images/logo1.png")}
          mainImage={require("../assets/images/two_women.jpg")}
        >
          <TouchableOpacity 
            style={{ alignSelf: 'flex-end'}}
            onPress={() => navigation.navigate('ForgotPass')}
          >
            <Text>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={""}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

        </CommonLayout>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  mobileButton: {
    borderRadius: 16,
    backgroundColor: "rgba(17, 17, 17, 1)",
    width: 250,
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 70,
    marginTop: 50,
    marginBottom: 50,
  },
  button: {
    borderRadius: 16,
    backgroundColor: "rgba(17, 17, 17, 1)",
    width: 300,
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 70,
    marginTop: 90,
    marginBottom: 90,
  },
  buttonText: {
    fontSize: 24,
        color: "rgba(255, 255, 255, 1)",
        fontWeight: "500",
  }
});

export default LoginPage;
