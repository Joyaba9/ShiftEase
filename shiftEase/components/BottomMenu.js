import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BottomMenu = ({ bottomMenuItems, onPressMenuItem }) => {
    return (
      <View style={styles.bottomMenu}>
        {bottomMenuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => onPressMenuItem(item.label)}>
            <Ionicons name={item.icon} size={30} color="black" />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    bottomMenu: {
      position: 'absolute',
      bottom: -100,
      left: 0,
      right: 0,
      height: 100,
      backgroundColor: '#E7E7E7',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#ccc',
      shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
        zIndex: 10,
    },
    menuItem: {
      alignItems: 'center',
    },
    menuText: {
      fontSize: 12,
      color: 'black',
    },
});
  
export default BottomMenu;