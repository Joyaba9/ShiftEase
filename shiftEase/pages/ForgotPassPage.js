import React from 'react';
import { StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions} from 'react-native';
import CommonLayout from "./CommonLayout";
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');

const forgotPassInputFields = [
    { label: 'Employee ID', placeholder: 'Enter your employee id' },
    { label: 'Email Address', placeholder: 'Email@gmail.com' },
];

const ForgotPassPage = () => {
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
                inputFields={forgotPassInputFields}
                isMobile={isMobile}
                logo={require("../assets/images/logo1.png")}
                mainImage={require("../assets/images/forgot_password.png")}
                customStyles={{
                  mobileBottomContainer: {top: '25%'},
                  mobileLogo: {marginTop: 30}
                }}
                aboveInputsContent={
                    <>
                        <Text style={styles.changeText}>Forgot Password?</Text>
                        <Text style={styles.paragraphText}>Enter your employee ID and email address associated 
                            with your account and we’ll send you instructions to reset your password 
                        </Text>
                    </>
                }
              >
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={""}
                >
                  <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
    
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text>Back to Login</Text>
                </TouchableOpacity>
    
              </CommonLayout>
            </KeyboardAvoidingView>
          ) : (
            <CommonLayout
                inputFields={forgotPassInputFields}
                isMobile={isMobile}
                logo={require("../assets/images/logo1.png")}
                mainImage={require("../assets/images/forgot_password.png")}
                customStyles={{
                    contentWrapper: { flexDirection: 'row-reverse' }, // Reverse the layout
                    inputContainer: {paddingRight: 0},
                    formContainer: {paddingLeft: 40 ,paddingRight: 40},
                    logoContainer: {margin: 20, paddingTop: 20},
                    desktopLogo: {height: 100}
                }}
                aboveInputsContent={
                    <>
                        <Text style={styles.changeText}>Forgot Password?</Text>
                        <Text style={styles.paragraphText}>Enter your employee ID and email address associated 
                            with your account and we’ll send you instructions to reset your password 
                        </Text>
                    </>
                }
            >
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={""}
                >
                    <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>

            </CommonLayout>
        )}
    </>
  );
};

const styles = StyleSheet.create({
    changeText: {
        fontSize: 24,
        color: "rgba(0, 0, 0, 1)",
        fontWeight: "500",
        marginBottom: 30,
    },
    paragraphText: {
        fontSize: 16,
        color: "rgba(0, 0, 0, 1)",
        marginBottom: 30,
    },
    resetButton: {
      borderRadius: 16,
      backgroundColor: "rgba(17, 17, 17, 1)",
      width: 300,
      maxWidth: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 60,
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
      paddingHorizontal: 60,
      marginTop: 90,
      marginBottom: 90,
    },
    buttonText: {
        fontSize: 24,
        color: "rgba(255, 255, 255, 1)",
        fontWeight: "500",
    }
});

export default ForgotPassPage;