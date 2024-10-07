import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ShiftCard from '../../components/ShiftCard';
import BottomMenu from '../../components/BottomMenu';

const EmployeePageMobile = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    const menuItems = [
        { icon: 'home-outline', label: 'Home' },
        { icon: 'person-outline', label: 'Account' },
        { icon: 'chatbubble-outline', label: 'Messages' },
        { icon: 'notifications-outline', label: 'Notifications' },
    ];

    const handleMenuPress = (label) => {
        console.log(`${label} pressed!`);
        // handle navigation for menu buttons
    };

    return (
    
        <View style={{ flex: 1 }}>
            {/* Top Navigaton Bar */}
            <LinearGradient 
                colors={['#E7E7E7', '#9DCDCD']} 
                style={styles.topBarContainer}
            >
                <TouchableOpacity onPress={toggleMenu}>
                    <Image
                    source={require('../../assets/images/menu_icon.png')}
                    style={styles.menuIcon}
                    />
                </TouchableOpacity>

                <Image
                    resizeMode="contain"
                    source={require('../../assets/images/logo1.png')}
                    style={styles.logo}
                />
            </LinearGradient>

            {/* Side Menu */}
            {isMenuOpen && (
                <View style={styles.sideMenu}>
                    <View style={styles.profileSection}>
                        <Image
                            source={require('../../assets/images/default_profile.png')}
                            style={styles.profileImage}
                        />
                        <Text style={styles.profileName}>Employee's Name</Text>
                    </View>

                    {/* Menu Items */}
                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to Home Page? */}} >
                        <Ionicons name="home-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to Account Page/Popup? */}}>
                        <Ionicons name="person-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>My Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to View Schedule Page? */}}>
                        <Ionicons name="calendar-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>View Schedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to Submit Request Page/Popup? */}}>
                        <Ionicons name="paper-plane-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Submit Request</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to Change Availability Page? */}}>
                        <Ionicons name="time-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Change Availability</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to Offer Up Shift Page/Popup? */}}>
                        <Ionicons name="swap-horizontal-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Offer Up Shift</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to Time Card History Page? */}}>
                        <Ionicons name="document-text-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Time Card History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to Notifications Page? */}}>
                        <Ionicons name="notifications-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Navigate to Settings Page? */}}>
                        <Ionicons name="settings-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {/* Logging Out Logic */}}>
                        <Ionicons name="log-out-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            )}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.dashboardContainer}>

                    <Text style={styles.dashboardText}>Employee Dashboard</Text>

                    {/* Announcements Section */}
                    <LinearGradient 
                        colors={['#E7E7E7', '#A7CAD8']} 
                        style={styles.gradient}
                    >
                        <View style={styles.announcements}>
                            <View style={styles.topBar}>
                                <Text style={styles.sectionTitle}>Announcements</Text>
                            
                                <View style={styles.spacer} />
                            
                                <Ionicons name="megaphone-outline" size={30} color="black" />
                            </View>

                            <View style={styles.textBox}>
                                {/* Add Announcements Logic? */}
                            </View>
                            
                        </View>
                    </LinearGradient>

                    {/* Upcoming Shifts Section */}
                    <LinearGradient 
                            colors={['#E7E7E7', '#A7CAD8']} 
                            style={styles.gradient}
                    >
                        <View style={styles.announcements}>
                            <View style={styles.topBar}>
                                <Text style={styles.sectionTitle}>Upcoming Shifts</Text>

                                <View style={styles.spacer} />

                                <Ionicons name="calendar-outline" size={30} color="black" />
                            </View>
                            <View style={styles.textBox}>
                                {/* Add Upcoming Shifts Logic? */}
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Available Shifts Section */}
                    <LinearGradient 
                        colors={['#E7E7E7', '#A7CAD8']} 
                        style={styles.gradient2}
                    >
                        <View style={styles.availableShifts}>
                            <View style={styles.topBar}>
                                <Text style={styles.sectionTitle}>Available Shifts</Text>

                                <View style={styles.spacer} />

                                <TouchableOpacity style={styles.availabilityButton}>
                                    <Text style={styles.buttonText}>With Availability</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.shiftButton}>
                                    <Text style={styles.buttonText}>All Shifts</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.shiftCardContainer}>
                                {/* Where offered up shifts should be displayed */}
                                <ShiftCard />
                                    
                            </View>
                        </View>
                    </LinearGradient>    
                </View>
            </ScrollView>
            
            {/* Quick Punch In/Out */}
            <View style = {styles.quickPunch}>
                <TouchableOpacity onPress={() => { /* Quick Punch In/Out Logic */ }}>
                    <Image
                        source={require('../../assets/images/quick_punch.png')}
                        style={styles.quickPunchImage}
                        onPress={ () => { /* Quick Punch In/Out Logic */ }}
                    />
                </TouchableOpacity>
            </View>

            {/* Bottom Menu */}
            <View style={{ marginBottom: 100 }}>
                <BottomMenu menuItems={menuItems} onPressMenuItem={handleMenuPress} />
            </View>
        </View>
    
    );
};

const styles = StyleSheet.create({
    topBarContainer: {
        width: '100%',
        height: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 20
    },
    menuIcon: {
        width: 20,
        height: 20,
        marginTop: 40
    },
    logo: {
        width: 200,
        height: 200,
        marginTop: 60
    },
    sideMenu: {
        position: 'absolute',  // Ensure it overlays the main content
        top: 120,               
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        width: '70%',
        height: '100%',
        zIndex: 10,   
        padding: 20,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileName: {
        color: 'white',
        marginLeft: 15,
        fontSize: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    menuItemText: {
        color: '#A7CAD8',
        marginLeft: 10,
        fontSize: 20,
    },
    dashboardContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 80
    },
    dashboardText: {
        fontSize: 25,
        alignSelf: 'flex-start',
        marginTop: 20,
        paddingLeft: 20
        
    },
    gradient: {
        width: '90%',
        height: 200,
        borderRadius: 10,
        marginTop: 20, 
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    announcements: {
        borderRadius: 10,
        padding: 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spacer: {
        flexGrow: 2, // Grow dynamically to fill space
        flexShrink: 1, // Shrink if space is limited
    },
    sectionTitle: {
        fontSize: 16
    },
    gradient2: {
        width: '90%',
        height: 400,
        borderRadius: 10, 
        marginTop: 20, 
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    availableShifts: {
        borderRadius: 10,
        padding: 20,
    },
    availabilityButton: {
        width: 100,
        backgroundColor: '#A9C9D9',
        borderTopLeftRadius: 10,    
        borderBottomLeftRadius: 10,
        borderRightWidth: 1,        
        borderRightColor: 'grey',
        padding: 7,
        marginTop: 15,
        alignItems: 'center',
    },
    shiftButton: {
        width: 80,
        backgroundColor: '#A9C9D9',
        borderTopRightRadius: 10,    
        borderBottomRightRadius: 10,
        padding: 7,
        marginTop: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 10,
    },
    shiftCardContainer: {
        alignItems: 'center',
        //backgroundColor: 'black',
        marginTop: 10
    },
    quickPunch: {
        position: 'absolute',
        alignSelf: 'flex-end',
        bottom: 100, // Adjust this value to set it above the bottom menu
        right: 20,
        zIndex: 10,
    },
    quickPunchImage: {
        width: 80,
        height: 80
    }
});
  
export default EmployeePageMobile;