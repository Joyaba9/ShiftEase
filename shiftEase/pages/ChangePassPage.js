import React from "react";
import { StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import CommonLayout from "./CommonLayout";

const { width } = Dimensions.get('window');

const passwordInputFields = [
    { label: 'Temporary Password', placeholder: 'Enter your password', isPassword: true },
    { label: 'New Password', placeholder: 'Enter your new password', isPassword: true },
    { label: 'Confirm New Password', placeholder: 'Confirm your new password', isPassword: true }
];

const ChangePassPage = () => {
    const isMobile = width < 768;

    return (
        <>
            {isMobile ? (
            <KeyboardAvoidingView 
              style={{ flex: 1 }} 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <CommonLayout
                inputFields={passwordInputFields}
                isMobile={isMobile}
                logo={require("../assets/images/logo1.png")}
                mainImage={require("../assets/images/retail_worker_happy.jpg")}
                aboveInputsContent={<Text style={styles.passwordText}>Change Password</Text>}
              >

                <TouchableOpacity
                  style={styles.mobileButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

              </CommonLayout>
            </KeyboardAvoidingView>
          ) : (
            <CommonLayout
                inputFields={passwordInputFields}
                isMobile={isMobile}
                logo={require("../assets/images/logo1.png")}
                mainImage={require("../assets/images/retail_worker_happy.jpg")}
                aboveInputsContent={<Text style={styles.passwordText}>Change Password</Text>}
                customStyles={{
                    logoContainer: {margin: 20}
                }}
            >
    
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </CommonLayout>
          )}
        </>
    );
};

const styles = StyleSheet.create({
    passwordText: {
        fontSize: 24,
        color: "rgba(0, 0, 0, 1)",
        fontWeight: "500",
        marginBottom: 30,
    },
    mobileButton: {
      borderRadius: 16,
      backgroundColor: "rgba(17, 17, 17, 1)",
      width: 250,
      maxWidth: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 70,
      marginTop: 20,
      marginBottom: 20,
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
  
export default ChangePassPage;
        
