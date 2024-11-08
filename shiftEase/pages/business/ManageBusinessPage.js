import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, Image, View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Modal, TextInput } from 'react-native';
import NavBar from '../../components/NavBar';

const ManageBusinessPage = () => {

    return (
        <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false} 
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.container}>
                <NavBar homeRoute={'Business'}/>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
      flex: 1, 
    },
    container: {
      flexGrow: 1,
      alignItems: 'center',
      paddingBottom: 20,
      minHeight: '100%',
      height: 200,
      minWidth: 950,
    },
});

export default ManageBusinessPage;
