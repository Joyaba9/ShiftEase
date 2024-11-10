import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { store, persistor } from '../redux/store';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/reducers/userReducer';
import { logoutBusiness } from '../redux/reducers/businessReducer';
import { auth } from '../../backend/firebase';
import { signOut } from "firebase/auth";
import { setPersistence, browserSessionPersistence } from "firebase/auth";


const NavBar = ({ homeRoute }) => {

    const screenWidth = Dimensions.get('window').width;
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [isLoggingOut, setIsLoggingOut] = useState('');

    // Define the handleLogout function is here temnporarily
    const handleLogout = async () => {
        try {
            // local state variable to track the logout process
            setIsLoggingOut(true);

            // Ensure that Firebase does not automatically restore the session
            await setPersistence(auth, browserSessionPersistence);
            await signOut(auth);
            console.log("Signed out from Firebase");

            // Send logout request to the backend
            const response = await fetch('http://localhost:5050/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                console.log(result.message); // Logged out successfully

                // Clear only user-specific data from localStorage while keeping schedule-related data
                Object.keys(localStorage).forEach((key) => {
                    // Remove keys that are not schedule-related
                    if (!key.startsWith("employeeHours_") && 
                        !key.startsWith("rowMappingBySchedule") && 
                        !key.startsWith("totalHours_")) {
                        localStorage.removeItem(key);
                    }
                });

                // Dispatch logout actions for both user and business
                dispatch(logout());
                dispatch(logoutBusiness());
                

                // Purge persisted state after logout
                await persistor.purge();
                console.log("Persistor purged");

                // Log the persistor state to check if it's null or still holds any data
                console.log("Persistor state after purge:", persistor.getState());
                console.log("Firebase Auth current user:", auth.currentUser);
                console.log('Redux state after logout:', store.getState());

                const isLoggedOut = !auth.currentUser &&
                    store.getState().user.loggedInUser === null &&
                    store.getState().business.businessInfo === null;

                if (isLoggedOut) {
                    console.log("All logged out conditions met, navigating to login page...");
                    setTimeout(() => {
                        navigation.replace('Login');
                        setIsLoggingOut(false);
                    }, 500);
                } else {
                    console.log("Still logging out...");
                }
            } else {
                console.error('Logout failed:', result.message);
                setIsLoggingOut(false);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            setIsLoggingOut(false);
        }
    };

    useEffect(() => {
        const userLoggedIn = store.getState().user.loggedInUser !== null;
        const businessLoggedIn = store.getState().business.businessInfo !== null;
    
        if (!userLoggedIn && !businessLoggedIn && !auth.currentUser) {
            console.log("Conditions met in useEffect, navigating to login page...");
            navigation.replace('Login');
        }
    }, [store.getState().user.loggedInUser, store.getState().business.businessInfo, auth.currentUser]);

    return (
            <LinearGradient 
                colors={['#E7E7E7', '#9DCDCD']} 
                style={styles.topBarContainer}
            >
                <Image
                    resizeMode="contain"
                    source={require('../assets/images/logo1.png')}
                    style={styles.desktopLogo}
                />

                <View style={styles.spacer} />

                <View style = {styles.navBarContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate(homeRoute)}>
                        <Text style={styles.navText}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {/* Settings Page logic */}}>
                        <Text style={styles.navText}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Account')}>
                        <Text style={styles.navText}>Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {/* Notification Page logic */}}>
                        <Image
                            resizeMode="contain"
                            source={require('../assets/images/notification_icon_trans.png')}
                            style={styles.notificationIcon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logOutButton} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Log Out</Text>
                </TouchableOpacity>
                </View>

            </LinearGradient>
    );
};


const styles = StyleSheet.create({
    topBarContainer: {
        width: '100%',
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    desktopLogo: {
        width: 230,
        height: 230,
        marginTop: 17,
    },
    spacer: {
        flexGrow: 2, // Grow dynamically to fill space
        flexShrink: 1, // Shrink if space is limited
    },
    navBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 1,
    },
    navText: {
        fontSize: 16,
        marginRight: 20, // Adds space between the nav items
    },
    notificationIcon: {
        width: 25,
        height: 25,
        marginRight: 20,
    },
    logOutButton: {
        borderRadius: 30,
        backgroundColor: 'white',
        width: 90,
        height: 27,
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonText: {
        fontSize: 15,
        color: 'black',
        fontWeight: '500',
      },
});

export default NavBar;