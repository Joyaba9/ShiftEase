import React from 'react';
import { StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions} from 'react-native';
import CommonLayout from "./CommonLayout";
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const registrationInputFields = [
    { label: 'Business Name', placeholder: 'Enter your business name' },
    { label: 'Email Address', placeholder: 'Enter your email' },
    { label: 'Password', placeholder: 'Enter your password', isPassword: true },
    { label: 'Confirm Password', placeholder: 'Confirm your password', isPassword: true }
];

const RegistrationPage = () => {
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
                inputFields={registrationInputFields}
                isMobile={isMobile}
                logo={require("../assets/images/logo1.png")}
                mainImage={require("../assets/images/woman.png")}
                customStyles={{
                  mobileBottomContainer: {top: '25%'}
                }}
              >
    
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
    
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text>Back to Login!</Text>
                </TouchableOpacity>
    
              </CommonLayout>
            </KeyboardAvoidingView>
          ) : (
            <CommonLayout
                inputFields={registrationInputFields}
                isMobile={isMobile}
                logo={require("../assets/images/logo1.png")}
                mainImage={require("../assets/images/woman.png")}
                customStyles={{
                    contentWrapper: { flexDirection: 'row-reverse' }, // Reverse the layout
                    inputContainer: {paddingRight: 0},
                    formContainer: {paddingLeft: 40 ,paddingRight: 40}
                }}
            >

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={""}
                >
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

            </CommonLayout>
        )}
    </>
  );
};

const styles = StyleSheet.create({
    registerButton: {
      borderRadius: 16,
      backgroundColor: "rgba(17, 17, 17, 1)",
      width: 250,
      maxWidth: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 70,
      marginTop: 20,
      marginBottom: 15,
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

export default RegistrationPage;
