import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NavBar from '../../components/NavBar';

const { width } = Dimensions.get('window');

const ManagePTORequest = () => {
    const navigation = useNavigation();
    const isMobile = width < 768; 
    const [activeTab, setActiveTab] = useState('Pending'); // State to track the active tab

    // Function to render content based on the selected tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Pending':
                return <Text style={styles.tabContent}>No Current Pending Requests</Text>;
            case 'Accepted':
                return <Text style={styles.tabContent}>No Current Approved Requests</Text>;
            case 'Rejected':
                return <Text style={styles.tabContent}>No Current Rejected Requests</Text>;
            default:
                return null;
        }
    };

    return (
        <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false} 
            showsHorizontalScrollIndicator={false}
        >
            <NavBar homeRoute={'Business'}/>

            <View style={styles.container}>

                <Text style={styles.containerHeader}>Time Off Request</Text>

                <View style={styles.tabContainer}>
                    {/* Tabs */}
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'Pending' && styles.activeTab]} 
                        onPress={() => setActiveTab('Pending')}
                    >
                        <Text style={styles.tabText}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'Accepted' && styles.activeTab]} 
                        onPress={() => setActiveTab('Accepted')}
                    >
                        <Text style={styles.tabText}>Accepted</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'Rejected' && styles.activeTab]} 
                        onPress={() => setActiveTab('Rejected')}
                    >
                        <Text style={styles.tabText}>Rejected</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.HDivider}/>

                {/* Tab Content */}
                <View style={styles.contentContainer}>
                    {renderTabContent()}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
    },
    container: {
        flexDirection: 'column',
        height: '80%',
        width: "95%",
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 30,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        backgroundColor: '#fff',
        padding: 20,
    },
    containerHeader: {
        fontSize: 35,
        alignSelf: 'flex-start', 
        marginBottom: 20,
        marginLeft: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    tabButton: {
        flex: 1, 
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: '#eee',
        marginHorizontal: 5,
    },
    activeTab: {
        backgroundColor: '#DDF1FA',
    },
    tabText: {
        color: '#333',
        fontWeight: 500,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContent: {
        fontSize: 16,
        color: '#333',
    },
    HDivider: {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2,
        width: '99%',
        alignSelf: 'center',
    },
});

export default ManagePTORequest;
