import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import ChangePassPage from './auth/ChangePassPage.js';
import ForgotPassPage from './auth/ForgotPassPage';
import LoginPage from './auth/LoginPage.js';
import LogOut from './auth/logOut.js';
import RegistrationPage from './auth/RegistrationPage';
import AddEmpModal from './business/AddEmpModal.js';
import BusinessPage from './business/BusinessPage.js';
import ManageEmployeePage from './business/ManageEmployeePage.js';
import AccountPage from './common/AccountPage.js';
import LandingPage from './common/LandingPage.js';
import WelcomePageMobile from './common/WelcomePageMobile.js';
import EmployeePage from './employee/EmployeePage.js';
import MessagesPage from './common/MessagesPage.js';
import SettingsPage from './business/SettingsPage.js';
import SchedulePage from './common/ManageSchedule.js';
import ManageBusinessPage from './business/ManageBusinessPage.js';
import EditRolesPage from './business/EditRolesPage.js';
import ViewSchedulePage from './employee/ViewSchedulePage.js';
import ChangeAvailabilityPage from './employee/ChangeAvailabilityPage.js';
//import ManagePTORequestPage from './common/ManagePTORequestPage.js';
import PTORequestPage from './common/PTORequestPage.js';


const Stack = createStackNavigator();

const linking = {
    prefixes: ['http://localhost:5050'],  
    config: {
      screens: {
        // Welcome: 'welcome',
        Login: 'login',
        // ChangePass: 'changepass',
        // ForgotPass: 'forgotpass',
        // Registration: 'registration',
        // Landing: 'landing',
        // Account: 'account',
        // Business: 'business',
        // Employee: 'employee',
        // AddEmp: 'add-employee',
        // ManageEmployee: 'manage-employee',
        Messages: 'messages',
        // LogOut: 'logout',
      },
    },
  };

const NavigationManager = () => {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {


        const { width } = Dimensions.get('window');
        if (width < 768) {
          // If it's mobile, set initial route to WelcomePageMobile
          setInitialRoute('Welcome');
        } else {
          // If it's desktop, set initial route to LoginPage
          setInitialRoute('Login');
        }


    }, []);

    if (!initialRoute) {
        return null; 
    }

    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name="Welcome" component={WelcomePageMobile} options={{ headerShown: false }}/>
            <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>
            <Stack.Screen name="ChangePass" component={ChangePassPage} options={{ headerShown: false }}/>
            <Stack.Screen name="ForgotPass" component={ForgotPassPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Registration" component={RegistrationPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Account" component={AccountPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Settings" component={SettingsPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Business" component={BusinessPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Employee" component={EmployeePage} options={{ headerShown: false }}/>
            <Stack.Screen name="ManageBusiness" component={ManageBusinessPage} options={{ headerShown: false }}/>
            <Stack.Screen name="AddEmp" component={AddEmpModal} options={{ headerShown: false }}/>
            <Stack.Screen name="ManageEmployee" component={ManageEmployeePage} options={{ headerShown: false }}/>
            <Stack.Screen name="Messages" component={MessagesPage} options={{ headerShown: false }}/>
            <Stack.Screen name="ManageSchedule" component={SchedulePage} options={{ headerShown: false }}/>
            <Stack.Screen name="EditRoles" component={EditRolesPage} options={{ headerShown: false }}/>
            <Stack.Screen name="ViewSchedule" component={ViewSchedulePage} options={{ headerShown: false }}/>
            {/* <Stack.Screen name="ManagePTORequest" component={ManagePTORequestPage} options={{ headerShown: false }}/> */}
            <Stack.Screen name="PTORequest" component={PTORequestPage} options={{ headerShown: false }}/>
            <Stack.Screen name="ChangeAvailability" component={ChangeAvailabilityPage} options={{ headerShown: false }}/>
            </Stack.Navigator>
            <Stack.Screen name="LogOut" component={LogOut} options={{ headerShown: false }} />
        </NavigationContainer>
    );
};

export default NavigationManager;