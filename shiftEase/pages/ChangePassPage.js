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
        
        
        
        
        
        
        
        
    







/*
const ChangePassPage = () => {
    console.log("ChangePassPage is rendering");

    const isMobile = width < 768;

    return (
        <>
            {isMobile ? (
                //Mobile Layout
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior for iOS and Android
                >
                    <View style ={styles.mobileContainer}>
                        <View style={styles.mobileTopContainer}>
                            <Image
                                resizeMode="cover"
                                source={require("../assets/images/retail_worker_happy.jpg")}
                                style={styles.mobileLoginImage}
                            />
                        </View>

                        <View style={styles.mobileBottomContainer}>
                            <LinearGradient
                                colors={['#E7E7E7', '#9DCDCD']} // Define your gradient colors
                                style={styles.mobileBottomContainerGradient} // Apply the gradient to the container
                            >
                                <Image
                                    resizeMode="contain"
                                    source={require("../assets/images/logo1.png")}
                                    style={styles.mobileLogo}
                                />
                                
                                <ScrollView 
                                    contentContainerStyle={styles.scrollViewContent} 
                                    keyboardShouldPersistTaps="handled"
                                    bounces={false}
                                >
                                    <Text style={styles.passwordText}>Change Password</Text>
                                
                                    <InputField
                                        label="Temporary Password:"
                                        placeholder="Enter your password"
                                        isPassword={true}
                                        //errorMessage="Error message"
                                    />    
                            
                                    <InputField
                                        label="New Password"
                                        placeholder="Enter your new password"
                                        isPassword={true}
                                        //errorMessage="Error message"
                                    />
        
                                    <InputField
                                        label="Confirm New Password"
                                        placeholder="Confirm your new password"
                                        isPassword={true}
                                        //errorMessage="Error message"
                                    />

                                    <TouchableOpacity style={styles.mobileLoginButton} accessibilityRole="button">
                                        <Text style={styles.loginButtonText}>Login</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </LinearGradient>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            ) : (
                //Desktop Layout
                <LinearGradient
                    colors={['#E7E7E7', '#9DCDCD']} 
                    style={styles.container}
                >
                    <View style={styles.changePassCard}>
                        <View style={styles.contentWrapper}>
                            <View style={styles.imageContainer}>
                                <Image
                                resizeMode="cover"
                                source={require("../assets/images/retail_worker_happy.jpg")}
                                style={styles.changePassImage}
                                />
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.logoContainer}>
                                    <Image
                                        resizeMode="contain"
                                        source={require("../assets/images/logo1.png")}
                                        style={styles.logo}
                                    />
                                </View>

                                <Text style={styles.passwordText}>Change Password</Text>
                                    
                                <InputField
                                    label="Temporary Password:"
                                    placeholder="Enter your password"
                                    isPassword={true}
                                    //errorMessage="Error message"
                                />    
                            
                                <InputField
                                    label="New Password"
                                    placeholder="Enter your new password"
                                    isPassword={true}
                                    //errorMessage="Error message"
                                />

                                <InputField
                                    label="Confirm New Password"
                                    placeholder="Confirm your new password"
                                    isPassword={true}
                                    //errorMessage="Error message"
                                />
                            
                                <TouchableOpacity style={styles.loginButton} accessibilityRole="button">
                                    <Text style={styles.loginButtonText}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    //Mobile Layout
    scrollViewContent: {
        flexGrow: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingBottom: 60,
        minWidth: '100%', 
    },
    mobileContainer: {
        flex: 1,
        width: '100%',  
        height: '100%',
        position: 'relative',
    },
    mobileTopContainer: {
        width: '100%',
        height: '40%',
        justifyContent: 'flex-start',
    },
    mobileLoginImage: {
        width: '100%',
        height: '100%', // Ensures the image fills the top container
    },
    mobileBottomContainer: {
        position: 'absolute', // Make the bottom container overlap the top container
        top: '28%',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    mobileBottomContainerGradient: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    mobileLogo: {
        width: 400,
        height: 100,
        marginTop: 40,
        resizeMode: 'cover',
    },
    mobileLoginButton: {
        backgroundColor: '#000',
        width: '80%',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },
    loginButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    //Desktop Layout
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    changePassCard: {
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 1)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "100%",
        maxWidth: 1323,
        paddingRight: 20,
    },
    contentWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
    },  
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',  
        height: '100%',
    },
    changePassImage: {
        borderRadius: 20,
        width: '100%', // Ensure it takes full width of the container
        height: '100%', // Ensure it takes full height of the container
        resizeMode: 'cover', // fill the container
    },
    formContainer: {
        flex: 1,
        alignItems: 'center',
        paddingLeft: 20,
    },
    logoContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 30,
    },
    logo: {
        width: 500,
        height: 150,
        resizeMode: 'contain',
    },
    passwordText: {
        fontSize: 24,
        color: "rgba(0, 0, 0, 1)",
        fontWeight: "500",
        marginBottom: 30,
    },
    loginButton: {
        borderRadius: 16,
        backgroundColor: "rgba(17, 17, 17, 1)",
        width: 391,
        maxWidth: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 70,
        marginTop: 100,
        marginBottom: 90,
    },
    loginButtonText: {
        fontSize: 24,
        color: "rgba(255, 255, 255, 1)",
        fontWeight: "500",
    },
});

export default ChangePassPage;*/


