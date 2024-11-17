import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import NavBar from '../../components/NavBar';
import AddPTORequestModal from './AddPTORequestModal';
import OpenPTORequestModal from './OpenPTORequestModal';

const PTORequestPage = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [addRequestVisible, setAddRequestVisible] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [rejectedRequests, setRejectedRequests] = useState([]);
    const [requestVisible, setRequestVisible] = useState(false);
    const [requestID, setRequestID] = useState('');
    const [upcomingRequests, setUpcomingRequests] = useState([]);
    const [pastRequests, setPastRequests] = useState([]);


    const loggedInUser = useSelector((state) => state.user.loggedInUser);
    const businessId = loggedInUser?.employee?.business_id;
    const loggedInEmployeeId = loggedInUser?.employee?.emp_id;
    const loggedInEmployeeFName = loggedInUser?.employee?.f_Name;
    const loggedInEmployeeLName = loggedInUser?.employee?.l_Name;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    useEffect(() => {
        if (activeTab === 'Pending') {
            getAllRequestStatusByEmployee('Pending');
        } else if (activeTab === 'Approved') {
            getAllRequestStatusByEmployee('Approved');
        } else if (activeTab === 'Rejected') {
            getAllRequestStatusByEmployee('Rejected');
        } else if (activeTab === 'Upcoming') {
            getAllRequestStatusByEmployee('Upcoming');
        } else if (activeTab === 'Past') {
            getAllRequestStatusByEmployee('Past');
        }
    }, [activeTab]);

    const getAllRequestStatusByEmployee = async (status) => {
        if (!loggedInEmployeeId || !businessId) {
            alert('Error with employee or business ID');
            return;
        }
    
        try {
            let url;
            let setFunction;
    
            if (status === 'Pending' || status === 'Approved' || status === 'Rejected') {
                // For Pending, Approved, and Rejected, use the existing route
                url = `http://localhost:5050/api/employee/getAllRequestsByStatus?emp_id=${loggedInEmployeeId}&business_id=${businessId}&status=${status}`;
                setFunction = status === 'Pending' ? setPendingRequests : status === 'Approved' ? setApprovedRequests : setRejectedRequests;
            } else if (status === 'Upcoming') {
                // For Upcoming, use the getFutureRequests route
                url = `http://localhost:5050/api/employee/getFutureRequests?emp_id=${loggedInEmployeeId}&business_id=${businessId}`;
                setFunction = setUpcomingRequests;
            } else if (status === 'Past') {
                // For Past, use the getPastRequests route
                url = `http://localhost:5050/api/employee/getPastRequests?emp_id=${loggedInEmployeeId}&business_id=${businessId}`;
                setFunction = setPastRequests;
            }
    
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch requests');
    
            const data = await response.json();
            if (data.success) {
                setFunction(data.allRequestsByStatus || data.pastRequests || data.futureRequests || []);
            } else {
                console.error('Unexpected response format:', data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            alert('Error fetching requests');
        }
    };

    // Add a log in renderTabContent to check if pendingRequests contains data
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Upcoming':
                return setTabContent(upcomingRequests || []);
            case 'Pending':
                return setTabContent(pendingRequests || []);
            case 'Approved':
                return setTabContent(approvedRequests || []);
            case 'Rejected':
                return setTabContent(rejectedRequests || []);
            case 'Past':
                return setTabContent(pastRequests || []);
            default:
                return null;
        }
    };

    const handleAddRequestVis = () => {
        setAddRequestVisible(true);
    };

    const handleOpenRequest = (requestId) => {
        console.log("Opening request with ID:", requestId); // Log the ID being passed
        setRequestID(requestId);
        setRequestVisible(true);
    };

    //Hardcoded test content
    pulledAccount = [
        {isBusiness: 'no', BusID: '6', EmpID: '6U27'}
    ];
    pulledPastRequest = [];

    // Updated setTabContent with a check to ensure pulledRequestArray is an array
    const setTabContent = (pulledRequestArray = []) => {
        if (!Array.isArray(pulledRequestArray)) {
            console.error("Expected an array but received:", pulledRequestArray);
            return null;
        }
    
        return pulledRequestArray.length === 0 ? (
            <View>
                <Text style={styles.noTabContent}>No {activeTab} Requests</Text>
            </View>
        ) : (
            pulledRequestArray.map((request) => (
                <View key={request.request_id} style={styles.requestBox}>
                    <View style={styles.requestRow}>
                        <View style={[styles.requestItem, styles.idColumn]}>
                            <Text style={styles.requestText}>{request.request_id}</Text>
                        </View>
                        <View style={[styles.requestItem, styles.nameColumn]}>
                            <Text style={styles.requestText}>{loggedInEmployeeFName} {loggedInEmployeeLName}</Text>
                        </View>
                        <View style={[styles.requestItem, styles.statusColumn]}>
                            <View style={styles.makeHorizontal}>
                                <View style={[styles.statusCircle, getStatusCircleStyle(request.status)]} />
                                <Text style={styles.requestText}>{request.status}</Text>
                            </View>
                        </View>
                        <View style={[styles.requestItem, styles.requestDateColumn]}>
                            <Text style={styles.requestText}>{formatDate(request.start_date)}</Text>
                        </View>
                        <View style={[styles.requestItem, styles.createdOnColumn]}>
                            <Text style={styles.requestText}>{formatDate(request.end_date)}</Text>
                        </View>
                        <TouchableOpacity style={[styles.bubbleButton, styles.actionColumn]} onPress={() => handleOpenRequest(request.request_id)}>
                            <Text style={styles.requestButtonText}>Open Request</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))
        );
    };

    // Function to return the appropriate circle style based on status
    const getStatusCircleStyle = (statusTab) => {
        switch (statusTab) {
            case 'Pending':
                return { backgroundColor: '#F5C242' }; 
            case 'Approved':
                return { backgroundColor: '#5CB85C' };
            case 'Rejected':
                return { backgroundColor: '#D9534F' }; 
            default:
                return { backgroundColor: '#CCC' }; 
        }
    };
    
    return (
        <>
            <NavBar homeRoute={'Employee'}/>
            <View style={styles.screenCenter}>
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
                            style={[styles.tabButton, activeTab === 'Upcoming' && styles.activeTab]} 
                            onPress={() => setActiveTab('Upcoming')}
                        >
                            <Text style={styles.tabText}>Upcoming</Text>
                        </TouchableOpacity>
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

                    <View style={styles.requestRowLabel}>
                        <Text style={[styles.requestLabel, styles.idColumn]}>Request ID</Text>
                        <Text style={[styles.requestLabel, styles.nameColumn]}>Employee Name</Text>
                        <Text style={[styles.requestLabel, styles.statusColumn]}>Status</Text>
                        <Text style={[styles.requestLabel, styles.requestDateColumn]}>Requested Start Date</Text>
                        <Text style={[styles.requestLabel, styles.createdOnColumn]}>Requested End Date</Text>
                        <Text style={[styles.requestLabel, styles.actionColumn]}>Action</Text>
                    </View>

                    <View style={styles.HDivider}/>                   
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
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
                        requestID={requestID}
                    />
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    statusCircle: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        marginRight: 8,
        marginTop: 3,
    },
    screenCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        width: '95%',
        height: '85%',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
        marginBottom: 10,
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
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        width: '100%',
    },
    scrollView: {
        maxHeight: 500,
        width: '100%',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    requestBox: {
        backgroundColor: '#f2f0ef',
        width: '100%',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 30,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    requestRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    requestRowLabel: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    requestLabel: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#555',
    },
    requestItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    requestText: {
        fontWeight: 600,
    },

    idColumn: { width: '10%' },
    nameColumn: { width: '20%' },
    statusColumn: { width: '20%' },
    requestDateColumn: { width: '20%' },
    createdOnColumn: { width: '20%' },
    actionColumn: { width: '10%' },
    makeHorizontal: { flexDirection: 'row'}

});

export default PTORequestPage; 