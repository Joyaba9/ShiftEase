import React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, TextInput } from 'react-native';
import CommonLayout from '../common/CommonLayout';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');


const ForgotPassPage = () => {
    const isMobile = width < 768;
    const navigation = useNavigation();

     // State variables to store the form data
     const [employeeId, setEmployeeId] = useState('');
     const [email, setEmail] = useState('');

    return (
        <>
            {isMobile ? (
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <CommonLayout
                        //inputFields={forgotPassInputFields}
                        isMobile={isMobile}
                        logo={require("../../assets/images/logo1.png")}
                        mainImage={require("../../assets/images/forgot_password.png")}
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

                    <Text style={styles.changeText}>Forgot Password?</Text>
                    <Text style={styles.paragraphText}>Enter your employee ID and email address associated 
                                with your account and we’ll send you instructions to reset your password 
                    </Text>


                    {/* TextInput Components */}
                    <Text style={styles.label}>Employee ID</Text>

                    <TextInput
                        placeholder="Enter your employee ID"
                        placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
                        value={employeeId}
                        onChangeText={setEmployeeId}
                        style={styles.input}
                    />

                    <Text style={styles.label}>Email Address</Text>

                    <TextInput
                        placeholder="Email@gmail.com"
                        placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        style={styles.input}
                    />

                        {/* Reset Password Button */}
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => console.log('Reset password')}
                        >
                            <Text style={styles.buttonText}>Reset Password</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text>Back to Login</Text>
                        </TouchableOpacity>

                    </CommonLayout>
                </KeyboardAvoidingView>
            ) : (
                <CommonLayout
                    isMobile={isMobile}
                    logo={require("../../assets/images/logo1.png")}
                    mainImage={require("../../assets/images/forgot_password.png")}
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

                <Text style={styles.changeText}>Forgot Password?</Text>
                <Text style={styles.paragraphText}>Enter your employee ID and email address associated 
                        with your account and we’ll send you instructions to reset your password 
                </Text>

                <Text style={styles.label}>Employee ID</Text>

                {/* TextInput Components */}
                <TextInput
                    placeholder="Enter your employee ID"
                    placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
                    value={employeeId}
                    onChangeText={setEmployeeId}
                    style={styles.input}
                />

                <Text style={styles.label}>Email Address</Text>

                <TextInput
                    placeholder="Email@gmail.com"
                    placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.input}
                />

                {/* Reset Password Button */}
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => console.log('Reset password logic here')}
                >
                    <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={{ color: 'black', textAlign: 'center', margin: 20 }}>Back to Login</Text>
                </TouchableOpacity>
            </CommonLayout>
        )}
    </>
  );
};
const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',  
        alignSelf: 'flex-start',
    },
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
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',  
        alignSelf: 'flex-start',
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
      marginTop: 50,
      //marginBottom: 30,
    },
    buttonText: {
        fontSize: 24,
        color: "rgba(255, 255, 255, 1)",
        fontWeight: "500",
    },
    input: {
      width: '100%',
      height: 56,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 10,
      borderRadius: 8,
  }
});

export default ForgotPassPage;