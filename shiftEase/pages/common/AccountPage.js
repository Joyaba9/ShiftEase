import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NavBar from '../../components/NavBar';
import BusinessAccountDetails from '../business/BusinessAccountDetails';


//pre-set 'login' information till actual login is implemented
const loggedInUser = {
    userType: 'owner', // Can be 'owner', 'manager', or 'employee'
    userId: 1
};

const { width, height } = Dimensions.get('window');

const AccountPage = () => {
    const isMobile = width < 768; 

    // Render the mobile layout if it's a mobile screen
    // if (isMobile) {
    //     return <AccountDetailsBusinessMobile />;
    // }

    return (
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
                    <NavBar homeRoute="Business"/>
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
    );
};

const styles = StyleSheet.create({
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
