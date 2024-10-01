import React, {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Dimensions } from 'react-native';
import WelcomePageMobile from './WelcomePageMobile';
import LoginPage from './LoginPage';
import ChangePassPage from './ChangePassPage';
import ForgotPassPage from './ForgotPassPage';
import RegistrationPage from './RegistrationPage';
import LandingPage from './LandingPage';

const Stack = createStackNavigator();

const NavigationManager = () => {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {


        const { width } = Dimensions.get('window');
        if (width < 768) {
          // If it's mobile, set initial route to WelcomePageMobile
          setInitialRoute('Welcome');
        } else {
          // If it's desktop, set initial route to LoginPage
          setInitialRoute('Landing');
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default NavigationManager;