import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, KeyboardAvoidingView, Platform} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import NavBar from '../../components/NavBar';
import BusinessAccountDetails from '../business/BusinessAccountDetails';
import MobileSideMenu from '../../components/MobileSideMenu';
import BottomMenu from '../../components/BottomMenu';


//pre-set 'login' information till actual login is implemented
const loggedInUser = {
    userType: 'owner', // Can be 'owner', 'manager', or 'employee'
    userId: 1
};

const { width, height } = Dimensions.get('window');

const AccountPage = () => {
    const isMobile = width < 768; 
    const navigation = useNavigation();
    const [isManagerDashboard, setIsManagerDashboard] = useState(false);

    //For mobile version nav bar
    const menuItems = [
        { icon: 'home-outline', label: 'Home' },
        { icon: 'person-outline', label: 'My Account' },
        { icon: isManagerDashboard ? 'calendar-outline' : 'briefcase-outline', label: isManagerDashboard ? 'Manage Schedule' : 'Manage Business' },
        { icon: 'person-add-outline', label: 'Add Employee' },
        { icon: 'people-outline', label: 'Manage Employee' },
        { icon: 'create-outline', label: 'Edit Roles' },
        { icon: 'notifications-outline', label: 'Notifications' },
        { icon: 'settings-outline', label: 'Settings' },
        { icon: 'log-out-outline', label: 'Log Out' },
    ];
    //For mobile version nav bar
    const handleMenuItemPress = (label) => {
        console.log(`${label} pressed!`);
        // Handle navigation or other actions
        if (label === 'Home') {
          navigation.navigate('Business');
        } else if (label === "My Account") {
            navigation.navigate('Account');
        } else if (label === "Add Employee") {
            setAddEmpVisible(true);
        } else if (label === "Manage Employee") {
            navigation.navigate('ManageEmployee');
        }
    };
    //For mobile version bottom menu
    const bottomMenuItems = [
        { icon: 'home-outline', label: 'Home' },
        { icon: 'person-outline', label: 'Account' },
        { icon: 'chatbubble-outline', label: 'Messages' },
        { icon: 'notifications-outline', label: 'Notifications' },
    ];
    //For mobile version bottom menu
    const handleBottomMenuPress = (label) => {
        console.log(`${label} pressed!`);
        if (label === 'Home') {
            navigation.navigate('Business');
        } else if (label === "Account") {
            navigation.navigate('Account');
        }
    };

    return (
        <>
            {isMobile ? (
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={20} // Adjust this value if needed
                >
                    <View style = {styles.mobileTopContainer}>
                        <MobileSideMenu
                            profileName="John Doe"
                            menuItems={menuItems}
                            onMenuItemPress={handleMenuItemPress}
                            logoSrc={require('../../assets/images/logo1.png')}
                            profileImageSrc={require('../../assets/images/default_profile.png')}
                            style={styles.sideMenu}
                        /> 
                    </View>
                    
                    <ScrollView 
                        contentContainerStyle={styles.mobileScrollContainer} 
                        style={{ height: height * 0.85, width: '100%', paddingTop: 120 }}
                        showsVerticalScrollIndicator={false} 
                        showsHorizontalScrollIndicator={false} 
                    >
                        
                        <BusinessAccountDetails />
                        
                    </ScrollView>
                    

                    {/* Bottom Menu */}
                    <View style={{ marginBottom: 100 }}>
                        <BottomMenu bottomMenuItems={bottomMenuItems} onPressMenuItem={handleBottomMenuPress} />
                    </View>
                </KeyboardAvoidingView>

            ) : (
            
                <LinearGradient 
                    colors={['#E7E7E7', '#9DCDCD']} 
                    style={styles.desktopContainer}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContainer} 
                        style={{ height: height * 0.85, width: '100%' }}
                        showsVerticalScrollIndicator={false} 
                        showsHorizontalScrollIndicator={false} 
                    >
                        <View style = {styles.topContainer}>
                                <NavBar homeRoute="Business"/> : 
                        </View>
                    
                        <BusinessAccountDetails />
                        {/*<View style={styles.container}>
                            <BusinessAccountDetails />
                            {loggedInUser.userType === 'owner' ? (
                                <AccountDetailsBusiness />
                            ) : (
                                <AccountDetails />
                            )} 
                        </View>*/}
                    </ScrollView>
                </LinearGradient>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    //Mobile
    keyboardAvoidingView: {
        flex: 1,
    },
    mobileTopContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: 120,
        width: '100%', 
        zIndex: 20, 
    },
    mobileScrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 100,
    },
    //Web
    desktopContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "center",
    },
    topContainer: {
        width: '100%'
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
    },
});

export default AccountPage;
