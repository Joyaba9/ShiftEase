import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SidebarButton = ({ icon, label, onPress, customContainerStyle, customIconStyle}) => {

    return (
        
        <TouchableOpacity onPress = {onPress}>
          <LinearGradient 
                colors={['#E7E7E7', '#A7CAD8']} 
                style={styles.gradient}
          >
            <View style={styles.buttonContainer}>
              <Text style = {styles.label}>{label}</Text>
              
              <View style = {[styles.iconContainer, customContainerStyle]}>
                  <Image source = {icon} style = {[styles.icon, customIconStyle]} />
              </View>
            </View>
          </LinearGradient>  
        </TouchableOpacity>

    );
};

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    height: 150,
    borderRadius: 8, 
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  buttonContainer: {
    paddingTop: 16,
    paddingLeft: 16,
    borderRadius: 8,
    flexDirection: 'row', 
  },
  iconContainer: {
    position: 'absolute',
    height: 100,
    marginTop: 25,
    right: -20,
  },
  icon: {
    width: 150,
    height: 100,  
  },
  label: {
    fontSize: 16,
    color: '#000',
  },
});
  
export default SidebarButton;