import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/actions/userActions';
import { loginBusiness } from '../../redux/actions/userActions'; 
import { useNavigation } from '@react-navigation/native';
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CommonLayout from '../common/CommonLayout';

const { width } = Dimensions.get('window');

// LoginPage component
const LoginPage = () => {
  const isMobile = width < 768;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  console.log('LoginPage rendered');

  const [isBusinessLogin, setIsBusinessLogin] = useState(false);

  const switchLogin = (loginType) => {
    setIsBusinessLogin(loginType === 'Business'); // Toggle between Business and Employee Login
  };

  // State variables to store form data
  const [employeeId, setEmployeeId] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Access the login state from Redux using the useSelector hook
  // It pulls values from the Redux store, including loading (login in progress), error (any login error), and loggedInUser (the logged-in user's data).
  const { loading, error, loggedInUser } = useSelector((state) => state.user);

  // Access the business login state from Redux
  const { loading: businessLoading, error: businessError, businessInfo } = useSelector((state) => state.business);
  

  const handleLogin = async () => {
    // Determine which login mode is active
    const loginMode = isBusinessLogin ? 'Business' : 'Employee';


    if (isBusinessLogin && (!businessId || !password)) {
      alert('Please enter both Business ID and Password');
      return;
    }
    if (!isBusinessLogin && (!employeeId || !password)) {
      alert('Please enter both Employee ID and Password');
      return;
    }

    console.log(`Trying to login as ${loginMode}`);

    // If it's a business login, dispatch the loginBusiness action
    if (isBusinessLogin) {
      dispatch(loginBusiness(businessId, password));
    } else {
      // If it's an employee login, dispatch the loginUser action
      const employeeString = `${businessId}U${employeeId}`; // You might want to ensure correct formatting
      dispatch(loginUser(employeeString, password));
    }
  };

  // useEffect hook that watches the loggedInUser value from Redux
  // It triggers when the loggedInUser changes, and based on the user data, it performs navigation or shows alerts
  useEffect(() => {
    if (loggedInUser) {
      // If the user needs to change their password, navigate to the ChangePass page
      if (loggedInUser.promptPasswordChange) {
        navigation.navigate('ChangePass', { employee: loggedInUser });
      } else {
        // If the login is successful, show an alert and navigate to either Business or Employee page based on the login mode
        alert('Login successful');
        navigation.navigate(isBusinessLogin ? 'Business' : 'Employee');
      }
    }
    if (businessInfo) {
      alert('Business login successful');
      navigation.navigate('Business');
    }
  }, [loggedInUser, businessInfo, navigation]); // This effect runs when either loggedInUser or navigation changes


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={isMobile} // Only enable on mobile
    >
      <CommonLayout
        isMobile={isMobile} // Pass the isMobile prop to CommonLayout
        logo={require('../../assets/images/logo1.png')}
        mainImage={require('../../assets/images/two_women.jpg')}
        customStyles={{
          mobileBottomContainer: isMobile ? { top: '30%' } : {},
          mobileLogo: isMobile ? { marginTop: 40 } : {},
          contentWrapper: !isMobile ? { flexDirection: 'row-reverse' } : {}, // Reverse layout on web
          desktopImage: !isMobile ? { borderTopRightRadius: 20, borderBottomRightRadius: 20 } : {},
          inputContainer: !isMobile ? { paddingRight: 0 } : {},
          formContainer: !isMobile ? { paddingLeft: 40, paddingRight: 40 } : {},
        }}
      >


        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.employeeButton, isBusinessLogin ? styles.inactiveButton : styles.activeButton,]} onPress={() => switchLogin('Employee')}>
            <Text style={styles.buttonSwitchText}>Employee</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.businessButton, isBusinessLogin ? styles.activeButton : styles.inactiveButton,]} onPress={() => switchLogin('Business')}>
            <Text style={styles.buttonSwitchText}>Business</Text>
          </TouchableOpacity>
        </View>


        {/* Label for the TextInput */}
        <Text style={styles.label}>
          {isBusinessLogin ? 'Business ID:' : 'Employee ID:'}
        </Text>

        {/* Directly render TextInput components */}
        <TextInput
          placeholder={isBusinessLogin ? 'Enter Business ID' : ' Enter Employee ID'}
          placeholderTextColor={isMobile ? 'gray' : 'lightgray'}
          value={isBusinessLogin ? businessId : employeeId}
          onChangeText={isBusinessLogin ? setBusinessId : setEmployeeId}
          style={styles.input}
        />
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password:</Text>
        
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

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPass')} style={{ alignSelf: 'flex-end' }}>
          <Text>Forgot Password?</Text>
        </TouchableOpacity>
        
        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Register Here */}
        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text style = {styles.registerText}>Register Here!</Text>
        </TouchableOpacity>

      </CommonLayout>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align items horizontally at the start (top)
    alignItems: 'center',
    marginBottom: 20,
  },
  employeeButton: {
    width: 100,
      //backgroundColor: '#A9C9D9',
      borderTopLeftRadius: 10,    
      borderBottomLeftRadius: 10,
      borderRightWidth: 1,        
      borderRightColor: 'grey',
      padding: 7,
      alignItems: 'center',
  },
  businessButton: {
    width: 100,
      //backgroundColor: '#A9C9D9',
      borderTopRightRadius: 10,    
      borderBottomRightRadius: 10,
      padding: 7,
      alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#A9C9D9', // Active button color
  },
  inactiveButton: {
    backgroundColor: 'lightgray', // Inactive button color
  },
  buttonSwitchText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',  
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row', 
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
  registerText: {
    marginBottom: 30, 
    fontSize: 15,
    color: 'black',
  }
});

export default LoginPage;
