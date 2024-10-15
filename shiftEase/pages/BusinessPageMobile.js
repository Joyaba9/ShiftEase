import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import BottomMenu from '../components/BottomMenu';

const BusinessPageMobile = () => {
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
        // You can handle navigation or any other actions here
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
                    source={require('../assets/images/menu_icon.png')}
                    style={styles.menuIcon}
                    />
                </TouchableOpacity>

                <Image
                    resizeMode="contain"
                    source={require('../assets/images/logo1.png')}
                    style={styles.logo}
                />
            </LinearGradient>

            {/* Side Menu */}
            {isMenuOpen && (
                <View style={styles.sideMenu}>
                    <View style={styles.profileSection}>
                        <Image
                            source={require('../assets/images/default_profile.png')}
                            style={styles.profileImage}
                        />
                        <Text style={styles.profileName}>User's Name</Text>
                    </View>

                    {/* Menu Items */}
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="home-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="person-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>My Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="briefcase-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Manage Business</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="person-add-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Add Employee</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="people-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Manage Employee</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="create-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Edit Roles</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="notifications-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="settings-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="log-out-outline" size={30} color="#A7CAD8" />
                        <Text style={styles.menuItemText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.dashboardContainer}>

                    <Text style={styles.dashboardText}>Business Dashboard</Text>

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
        top: 120,               // Aligns the top of the screen
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        width: '60%',
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