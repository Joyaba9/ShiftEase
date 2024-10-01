import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InputField from './InputField';

const CommonLayout = ({ 
  inputFields, 
  isMobile, 
  logo, 
  mainImage, 
  customStyles,
  aboveInputsContent, 
  children,
 }) => {
  return (
    <>
      {isMobile ? (
        // Mobile Layout
        <View style={styles.mobileContainer}>
          <View style={styles.mobileTopContainer}>
            <Image
                resizeMode="cover"
                source={mainImage}
                style={styles.topImage}
            />
          </View>
          <View style={[styles.mobileBottomContainer, customStyles?.mobileBottomContainer]}>
            <LinearGradient 
              colors={['#E7E7E7', '#9DCDCD']} 
              style={styles.mobileBottomContainerGradient}
            >
              <Image
                resizeMode="contain"
                source={logo}
                style={[styles.mobileLogo, customStyles?.mobileLogo]}
              />
              <ScrollView 
                contentContainerStyle={styles.scrollViewContent} 
                keyboardShouldPersistTaps="handled" 
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {aboveInputsContent}

                {inputFields.map((field, index) => (
                  <InputField
                    key={index}
                    label={field.label}
                    placeholder={field.placeholder}
                    isPassword={field.isPassword}
                  />
                ))}

                {children}

              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      ) : (
        //Desktop Layout
        <LinearGradient 
          colors={['#E7E7E7', '#9DCDCD']} 
          style={styles.desktopContainer}
        >
          <View style={[styles.inputContainer, customStyles?.inputContainer]}>
            <View style={[styles.contentWrapper, customStyles?.contentWrapper]}>
              <View style={styles.imageContainer}>
                <Image
                  resizeMode="cover"
                  source={mainImage}
                  style={styles.desktopImage}
                />
              </View>
              <View style={[styles.formContainer, customStyles?.formContainer]}>
                <View style={[styles.logoContainer, customStyles?.logoContainer]}>
                  <Image
                    resizeMode="contain"
                    source={logo}
                    style={[styles.desktopLogo, customStyles?.desktopLogo]}
                  />
                </View>
                {aboveInputsContent}

                {inputFields.map((field, index) => (
                    <InputField
                      key={index}
                      label={field.label}
                      placeholder={field.placeholder}
                      isPassword={field.isPassword}
                    />
                ))}

                {children}

              </View>
            </View>
          </View>
        </LinearGradient>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Mobile Layout
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
  topImage: {
    borderRadius: 20,
      width: '100%', // Ensure it takes full width of the container
      height: '100%', // Ensure it takes full height of the container
      resizeMode: 'cover',
  },
  mobileLoginImage: {
    width: '100%',
    height: '100%',
  },
  mobileBottomContainer: {
    position: 'absolute',
    top: '30%',
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
    marginTop: 25,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
    minWidth: '100%',
  },

  //Desktop Layout
  desktopContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: "center",
    padding: 30,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 1200,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 20,
    paddingRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  contentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',  
    height: '100%',
  },
  desktopImage: {
    borderRadius: 20,
    width: '100%',
    height: '100%',
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    margin: 40,
  },
  desktopLogo: {
    width: 500,
    height: 150,
  },
  
});

export default CommonLayout;