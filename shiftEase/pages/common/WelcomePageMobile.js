import React from 'react';
import { View, StyleSheet, ImageBackground, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CustomButton = ({ title, onPress, style }) => {
    return (
      <TouchableOpacity style={[styles.button, style]} onPress={onPress} accessible={true} accessibilityRole="button">
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    );
};

const WelcomePageMobile = () => {
    const navigation = useNavigation();
    
    return (
      <View style={styles.container}>
        <ImageBackground
          resizeMode="cover"
          source={require("../../assets/images/happy_coworkers.png")}
          style={styles.backgroundImage}
        >
            <View style={styles.contentWrapper}>
                <View style={styles.welcomeWrapper}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Image
                        resizeMode="contain"
                        source={require("../../assets/images/logo1.png")}
                        style={styles.logo}
                    />
                </View>
                <CustomButton
                    title="Employee Login"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.employeeLoginButton}
                />
                <CustomButton
                    title="Business Registration"
                    onPress={() => navigation.navigate('Registration')}
                    style={styles.businessRegistrationButton}
                />
            </View>
        </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 16,
        backgroundColor: 'rgba(161, 207, 207, 1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: 277,
        maxWidth: '100%',
    },
    buttonText: {
        color: 'rgba(0, 0, 0, 1)',
        fontSize: 24,
        fontWeight: '500',
        fontFamily: 'Poppins',
    },
    container: {
      flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    contentWrapper: {
        alignItems: 'center',
        padding: 20,
    },
    welcomeWrapper: {
        alignItems: 'center',
        margin: 55
    },
    welcomeText: {
        fontSize: 36,
        fontWeight: '700',
        color: 'rgba(0, 0, 0, 1)',
        marginBottom: 20,
    },
    logo: {
        width: 400,
        height: 82,
    },
    employeeLoginButton: {
        marginTop: 340,
    },
    businessRegistrationButton: {
        marginTop: 50,
    },
});

export default WelcomePageMobile;