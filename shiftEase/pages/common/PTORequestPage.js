import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import NavBar from '../../components/NavBar';
import AddPTORequestModal from './AddPTORequestModal';
import OpenPTORequestModal from './OpenPTORequestModal';

const PTORequestPage = () => {
    const [activeTab, setActiveTab] = useState('Pending'); 
    const [addRequestVisible, setAddRequestVisible] = useState(false);
    const [requestVisible, setRequestVisible] = useState(false);
    
    const handleAddRequestVis = () => {
        setAddRequestVisible(true);
    };

    const handleOpenRequest = () => {
        setRequestVisible(true);
    };

    //Hardcoded test content
    pulledAccount = [
        {isBusiness: 'no', BusID: '6', EmpID: '6U7'}
    ];

    pulledPendingRequest = [
        { id: 1, EmpID: '6U7', BusID: '6', EmpFName: 'John', EmpLName: 'Doe', Status: 'Pending', RequestDate: '2024-12-12', CreatedAt: '2024-11-06'},
    ];
    pulledApprovedRequest = [];
    pulledRejectedRequest = [];
    pulledPastRequest = [];

    // Function to render content based on the selected tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Pending':
                return (
                    <>
                        <View>
                            {pulledPendingRequest.length === 0 ? (
                                <View>
                                    <Text style={styles.noTabContent}>No Current Pending Requests</Text>
                                </View>
                            ) : (
                                pulledPendingRequest.map((request) => (
                                    <View key={request.id} style={styles.requestBox}>
                                        <View style={styles.requestRow}>
                                            <View style={styles.requestItem}>{request.id}</View>
                                            <View style={styles.requestItem}>{request.EmployeeName}</View>
                                            <View style={styles.requestItem}>{request.Status}</View>
                                            <View style={styles.requestItem}>{request.RequestDate}</View>
                                            <View style={styles.requestItem}>{request.CreatedAt}</View>
                                            <TouchableOpacity style={styles.bubbleButton} onPress={handleOpenRequest}>
                                                <Text style={styles.requestButtonText}>Open Request</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </>
                );
            case 'Approved':
                return <Text style={styles.noTabContent}>No Current Approved Requests</Text>;
            case 'Rejected':
                return <Text style={styles.noTabContent}>No Current Rejected Requests</Text>;
            case 'Past':
                return <Text style={styles.noTabContent}>No Current Past Requests</Text>;    
            default:
                return null;
        }
    };

    return (
        <>
            <NavBar homeRoute={'Business'}/>

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.containerHeader}>Time Off Request</Text>
                    {pulledAccount[0].isBusiness === 'no' && (
                        <TouchableOpacity style={styles.headerBubbleButton} onPress={handleAddRequestVis}>
                            <Text style={styles.buttonText}>Add Request</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.tabContainer}>
                    {/* Tabs */}
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'Pending' && styles.activeTab]} 
                        onPress={() => setActiveTab('Pending')}
                    >
                        <Text style={styles.tabText}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'Approved' && styles.activeTab]} 
                        onPress={() => setActiveTab('Approved')}
                    >
                        <Text style={styles.tabText}>Approved</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'Rejected' && styles.activeTab]} 
                        onPress={() => setActiveTab('Rejected')}
                    >
                        <Text style={styles.tabText}>Rejected</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'Past' && styles.activeTab]} 
                        onPress={() => setActiveTab('Past')}
                    >
                        <Text style={styles.tabText}>Past</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.HDivider}/>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.contentContainer}>
                        {renderTabContent()}
                    </View>
                </ScrollView>
                <View style={styles.HDivider}/>

                <AddPTORequestModal
                    addRequestVisible={addRequestVisible}
                    setAddRequestVisible={setAddRequestVisible}
                    //businessId={loggedInBusiness.business.business_id}
                />
                <OpenPTORequestModal
                    requestVisible={requestVisible}
                    setRequestVisible={setRequestVisible}
                    //businessId={loggedInBusiness.business.business_id}
                />
            </View>
        </>
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
        marginVertical: '1%',
        marginHorizontal: 'auto',
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
    noTabContent: {
        fontSize: 16,
        color: '#333',
    },
    HDivider: {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2,
        width: '99%',
        alignSelf: 'center',
    },
    headerBubbleButton: {
        borderRadius: 50,
        backgroundColor: '#9FCCF5',
        width: 215,
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 3.5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    bubbleButton: {
        borderRadius: 50,
        backgroundColor: '#9FCCF5',
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 3.5,
        marginLeft: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#333',
    },
    requestButtonText: {
        fontSize: 14,
        color: '#333',
    },
    requestBox: {
        flexGrow: 1,
        backgroundColor: '#f2f0ef',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    requestRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        width: "100%"
    },
    requestItem: {
        paddingVertical: 10,
    },
    requestLabel: {
        fontWeight: 'bold',
        color: '#333',
    },
    
});

export default PTORequestPage;
