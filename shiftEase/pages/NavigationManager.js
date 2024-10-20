import React, {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Dimensions } from 'react-native';
import WelcomePageMobile from './common/WelcomePageMobile.js';
import LoginPage from './auth/LoginPage.js';
import ChangePassPage from './auth/ChangePassPage.js';
import ForgotPassPage from './auth/ForgotPassPage';
import RegistrationPage from './auth/RegistrationPage';
import LandingPage from './common/LandingPage.js';
import BusinessPage from './business/BusinessPage.js';
import EmployeePage from './employee/EmployeePage.js';
import LogOut from './auth/logOut.js';
import AccountPage from './common/AccountPage.js';
import AddEmpModal from './business/AddEmpModal.js';
import ManageEmployeePage from './business/ManageEmployeePage.js';


const Stack = createStackNavigator();

const NavigationManager = () => {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {


        const { width } = Dimensions.get('window');
        if (width < 768) {
          // If it's mobile, set initial route to WelcomePageMobile
          setInitialRoute('Account');
        } else {
          // If it's desktop, set initial route to LoginPage
          setInitialRoute('Business');
        }


    }, []);

    if (!initialRoute) {
        return null; // You can also show a loading spinner here
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name="Welcome" component={WelcomePageMobile} options={{ headerShown: false }}/>
            <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>
            <Stack.Screen name="ChangePass" component={ChangePassPage} options={{ headerShown: false }}/>
            <Stack.Screen name="ForgotPass" component={ForgotPassPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Registration" component={RegistrationPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Account" component={AccountPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Business" component={BusinessPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Employee" component={EmployeePage} options={{ headerShown: false }}/>
            <Stack.Screen name="AddEmp" component={AddEmpModal} options={{ headerShown: false }}/>
            <Stack.Screen name="ManageEmployee" component={ManageEmployeePage} options={{ headerShown: false }}/>
            </Stack.Navigator>
            <Stack.Screen name="LogOut" component={LogOut} options={{ headerShown: false }} />
        </NavigationContainer>
    );
};

export default NavigationManager;