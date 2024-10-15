import React from 'react';
import { View, StyleSheet, Dimensions} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NavBar from '../../components/NavBar';
//import AccountDetails from '../employee/AccountDetails';
//import AccountDetailsBusinessMobile from '../manager/AccountDetailsBusinessMobile';
import BusinessAccountDetails from '../manager/BusinessAccountDetails';

//pre-set 'login' information till actual login is implemented
const loggedInUser = {
    userType: 'owner', // Can be 'owner', 'manager', or 'employee'
    userId: 1
};

const { width } = Dimensions.get('window');

const AccountPage = () => {
    const isMobile = width < 768; 

    /* Render the mobile layout if it's a mobile screen
    if (isMobile) {
        return <AccountDetailsBusinessMobile />;
    }*/

    return (
        <LinearGradient 
            colors={['#E7E7E7', '#9DCDCD']} 
            style={styles.desktopContainer}
        >
            <View style = {styles.topContainer}>
                <NavBar homeRoute="Business"/>
            </View>
            
            <View style={styles.container}>
                <BusinessAccountDetails />
                {/*{loggedInUser.userType === 'owner' ? (
                    <AccountDetailsBusiness />
                ) : (
                    <AccountDetails />
                )}*/}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    desktopContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "center",
        //paddingVertical: 20,
        //paddingHorizontal: 30
    },
    topContainer: {
        width: '100%',
    },
    container: {
        //flexGrow: 1,
        width: '90%',
        maxWidth: 1200,
        maxHeight: '95%',
        marginVertical: 20,
        marginHorizontal: 30,
        backgroundColor: "rgba(255, 255, 255, 1)",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default AccountPage;
