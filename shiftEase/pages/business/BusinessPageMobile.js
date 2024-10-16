import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MobileSideMenu from '../../components/MobileSideMenu';
import BottomMenu from '../../components/BottomMenu';
import AddEmpModal from './AddEmpModal';

const BusinessPageMobile = () => {
    const navigation = useNavigation();

    const [isManagerDashboard, setIsManagerDashboard] = useState(false);
    const [addEmpVisible, setAddEmpVisible] = useState(false);
  
    // Function to switch between dashboards
    const switchDashboard = () => {
        setIsManagerDashboard(!isManagerDashboard); // Toggle between Business and Manager dashboard
    };

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
    
    const bottomMenuItems = [
        { icon: 'home-outline', label: 'Home' },
        { icon: 'person-outline', label: 'Account' },
        { icon: 'chatbubble-outline', label: 'Messages' },
        { icon: 'notifications-outline', label: 'Notifications' },
    ];

    const handleBottomMenuPress = (label) => {
        console.log(`${label} pressed!`);
        if (label === 'Home') {
            navigation.navigate('Business');
        } else if (label === "Account") {
            navigation.navigate('Account');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style = {styles.topContainer}>
                {/* Top Navigaton Bar */}
                <MobileSideMenu
                    profileName="John Doe"
                    menuItems={menuItems}
                    onMenuItemPress={handleMenuItemPress}
                    logoSrc={require('../../assets/images/logo1.png')}
                    profileImageSrc={require('../../assets/images/default_profile.png')}
                    style={styles.sideMenu}
                />
            </View>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.topDashContainer}>
                        {/* Conditionally render the dashboard text based on state */}
                        <Text style={styles.dashboardText}>
                        {isManagerDashboard ? 'Manager Dashboard' : 'Business Dashboard'}
                        </Text>

                        {/* Button to switch between dashboards */}
                        <TouchableOpacity onPress={switchDashboard}>
                        <Text style = {styles.managerText}>
                            {isManagerDashboard ? 'Switch to Business Dashboard!' : 'Switch to Manager Dashboard!'}
                        </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.dashboardContainer}>
                        {/* Announcements Section */}
                        <LinearGradient 
                            colors={['#E7E7E7', '#A7CAD8']} 
                            style={styles.gradientAnnounce}
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
                                
                                <TouchableOpacity style={styles.addIconContainer}>
                                    <Ionicons name="add-circle" size={50} color="black" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                        
                        
                        {/* Reports Section */}
                        <LinearGradient 
                        colors={['#E7E7E7', '#A7CAD8']} 
                        style={styles.gradient}
                        >
                            <View style={styles.reportsContainer}>
                                <View style={styles.topBar}>
                                    <Text style={styles.sectionTitle}> Daily Reports</Text>
                                    
                                    <View style={styles.spacer} />
                                    
                                    <Ionicons name="document-text-outline" size={30} color="black" />
                                </View>
                                <View style={styles.textBox}>
                                    {/* Add Reports Logic? */}
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Messaging Section */}
                        <LinearGradient 
                        colors={['#E7E7E7', '#A7CAD8']} 
                        style={styles.gradient}
                        >
                            <View style={styles.messagingContainer}>
                                <View style={styles.topBar}>
                                    <Text style={styles.sectionTitle}>Key Performance Overview</Text>
                                    
                                    <View style={styles.spacer} />

                                    <Ionicons name="bar-chart-outline" size={30} color="black" />
                                </View>
                                <View style={styles.textBox}>
                                    {/* Add Performance Logic? */}
                                </View>
                                
                            </View>  
                        </LinearGradient>

                    </View>    
                </ScrollView>
            
            {/* Bottom Menu */}
            <View style={{ marginBottom: 100 }}>
                <BottomMenu bottomMenuItems={bottomMenuItems} onPressMenuItem={handleBottomMenuPress} />
            </View>

            {addEmpVisible && (
                <AddEmpModal 
                    addEmpVisible={addEmpVisible} 
                    setAddEmpVisible={setAddEmpVisible}
                />
            )}

        </View>
    );
};
    
const styles = StyleSheet.create({
    topContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 20, // Ensure it stays above other elements
        width: '100%', // Adjust to fit the screen
        height: 120, // Customize this value based on your design
    },
    topDashContainer: {
        paddingHorizontal: 20,
        marginTop: 150,
    },
    dashboardContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 80,
        //marginTop: 150,
    },
    dashboardText: {
        fontSize: 25,
        alignSelf: 'flex-start',
        //marginTop: 20,
        //paddingLeft: 20
        
    },
    managerText: {
        alignSelf: 'flex-end',
        margin: 20,
    },
    gradientAnnounce: {
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
    gradient: {
        width: '90%',
        height: 300,
        borderRadius: 10,
        marginTop: 20, 
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    spacer: {
        flexGrow: 2, // Grow dynamically to fill space
        flexShrink: 1, // Shrink if space is limited
    },
    announcements: {
        borderRadius: 10,
        padding: 20,
    },
    addIconContainer: {
        position: 'absolute',
        bottom: -60,
        right: 10,
        zIndex: 1,
    },
    reportsContainer: {
        borderRadius: 10,
        padding: 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16
    },
    icon: {
        width: 50,
        height: 50
    },
    icon2: {
        width: 40,
        height: 40
    },
    textBox: {
        flex: 1,
        //backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    messagingContainer: {
        borderRadius: 10,
        padding: 20,
    },




});
  
export default BusinessPageMobile;