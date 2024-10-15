import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MobileSideMenu = ({ profileName, menuItems, onMenuItemPress, logoSrc, profileImageSrc }) => {
    const windowHeight = Dimensions.get('window').height;
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };
  
    return (
      <View style={{ flex: 1 }}>
        {/* Top Navigation Bar */}
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
  
          {/* Company logo */}
          <Image
            resizeMode="contain"
            source={logoSrc}
            style={styles.logo}
          />
        </LinearGradient>
  
        {/* Side Menu */}
        {isMenuOpen && (
          <View style={[styles.sideMenu, { height: windowHeight }]}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <Image
                source={profileImageSrc}
                style={styles.profileImage}
              />
              <Text style={styles.profileName}>{profileName}</Text>
            </View>
  
            {/* Dynamic Menu Items */}
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => onMenuItemPress(item.label)}
              >
                <Ionicons name={item.icon} size={30} color="#A7CAD8" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        width: '60%',
        height: 700,
        zIndex: 20,   
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
});

export default MobileSideMenu;