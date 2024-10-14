import React from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const NavBar = () => {

    const screenWidth = Dimensions.get('window').width;

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
                    <TouchableOpacity onPress={() => {/* Not sure where 'home' should go */}}>
                        <Text style={styles.navText}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {/* Settings Page logic */}}>
                        <Text style={styles.navText}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {/* Account Page logic */}}>
                        <Text style={styles.navText}>Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {/* Notification Page logic */}}>
                        <Image
                            resizeMode="contain"
                            source={require('../assets/images/notification_icon_trans.png')}
                            style={styles.notificationIcon}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logOutButton} onPress={() => {/* Log Out button logic */}}>
                        <Text style={styles.buttonText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

            </LinearGradient>
    )
}


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