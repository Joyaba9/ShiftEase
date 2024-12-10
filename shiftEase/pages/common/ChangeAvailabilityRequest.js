import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import NavBar from '../../components/NavBar';
import AddPTORequestModal from './AddPTORequestModal';
import OpenPTORequestModal from './OpenPTORequestModal';
import ChangeAvailabilityModal from './ChangeAvailabilityModal'; 
import OpenAvailabilityRequestModal from './OpenAvailabilityRequestModal';

const ChangeAvailabilityRequestPage = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [addRequestVisible, setAddRequestVisible] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [rejectedRequests, setRejectedRequests] = useState([]);
    const [requestVisible, setRequestVisible] = useState(false);
    const [requestID, setRequestID] = useState('');
    const [upcomingRequests, setUpcomingRequests] = useState([]);
    const [pastRequests, setPastRequests] = useState([]);
    const [isManager, setIsManager] = useState(false);
    const [changeAvailabilityVisible, setChangeAvailabilityVisible] = useState(false);
    const [pendingAvailabilityRequests, setPendingAvailabilityRequests] = useState([]);
    const [availabilityRequestVisible, setAvailabilityRequestVisible] = useState(false);
    const [futureAvailabilityRequests, setFutureAvailabilityRequests] = useState([]);
    const [approvedAvailabilityRequests, setApprovedAvailabilityRequests] = useState([]);
    const [rejectedAvailabilityRequests, setRejectedAvailabilityRequests] = useState([]);
    const [pastAvailabilityRequests, setPastAvailabilityRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);


    const loggedInUser = useSelector((state) => state.user.loggedInUser);
    const businessId = loggedInUser?.employee?.business_id;
    const loggedInEmployeeId = loggedInUser?.employee?.emp_id;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    useEffect(() => {
        if (activeTab === 'Pending') {
            fetchPendingAvailabilityRequests();
        } else if (activeTab === 'Approved') {
            fetchApprovedAvailabilityRequests();
        } else if (activeTab === 'Rejected') {
            fetchRejectedAvailabilityRequests();
        } else if (activeTab === 'Upcoming') {
            fetchFutureAvailabilityRequests();
        } else if (activeTab === 'Past') {
            fetchPastAvailabilityRequests();
        }
    }, [activeTab]);
    

    useEffect(() => {
        const fetchManagerStatus = async () => {
            if (!loggedInEmployeeId) return;
            try {
                const response = await fetch(`http://localhost:5050/api/employee/checkIfEmployeeIsManager?emp_id=${loggedInEmployeeId}`);
                const data = await response.json();
                if (data.success) {
                    setIsManager(data.isManager);
                } else {
                    console.error('Failed to check manager status:', data.message);
                }
            } catch (error) {
                console.error('Error checking manager status:', error);
            }
        };
        fetchManagerStatus();
    }, [loggedInEmployeeId]);

    const fetchFutureAvailabilityRequests = async () => {
        try {
            const response = await fetch(
                `http://localhost:5050/api/employee/getFutureAvailabilityRequests?emp_id=${loggedInEmployeeId}&business_id=${businessId}&isManager=${isManager}`
            );
    
            if (!response.ok) {
                throw new Error('Failed to fetch future availability requests');
            }
    
            const data = await response.json();
    
            if (data.success) {
                setFutureAvailabilityRequests(data.futureAvailabilityRequests || []);
                console.log('Future availability requests fetched successfully:', data.futureAvailabilityRequests);
            } else {
                console.error('Error fetching future availability requests:', data.message);
            }
        } catch (error) {
            console.error('Error fetching future availability requests:', error);
        }
    };
    
    const fetchPendingAvailabilityRequests = async () => {
        try {
            const response = await fetch(`http://localhost:5050/api/employee/getAllRequestsByStatus?emp_id=${loggedInEmployeeId}&business_id=${businessId}&status=Pending&isManager=${isManager}&requestType=availability`);
            const data = await response.json();
            if (response.ok && data.success) {
                setPendingAvailabilityRequests(data.allRequestsByStatus);
            }
        } catch (error) {
            console.error('Error fetching pending availability requests:', error);
        }
    };

    const fetchApprovedAvailabilityRequests = async () => {
        try {
            const response = await fetch(
                `http://localhost:5050/api/employee/getApprovedAvailabilityRequests?emp_id=${loggedInEmployeeId}&business_id=${businessId}&isManager=${isManager}`
            );
            const data = await response.json();
            if (response.ok && data.success) {
                setApprovedAvailabilityRequests(data.approvedAvailabilityRequests || []);
            } else {
                console.error('Error fetching approved availability requests:', data.message);
            }
        } catch (error) {
            console.error('Error fetching approved availability requests:', error);
        }
    };
    
    const fetchRejectedAvailabilityRequests = async () => {
        try {
            const response = await fetch(
                `http://localhost:5050/api/employee/getRejectedAvailabilityRequests?emp_id=${loggedInEmployeeId}&business_id=${businessId}&isManager=${isManager}`
            );
            const data = await response.json();
            if (response.ok && data.success) {
                setRejectedAvailabilityRequests(data.rejectedAvailabilityRequests || []);
            } else {
                console.error('Error fetching rejected availability requests:', data.message);
            }
        } catch (error) {
            console.error('Error fetching rejected availability requests:', error);
        }
    };

    const fetchPastAvailabilityRequests = async () => {
        try {
            console.log(`Fetching past availability requests for emp_id=${loggedInEmployeeId} and business_id=${businessId}&isManager=${isManager}`);
            const response = await fetch(
                `http://localhost:5050/api/employee/getPastAvailabilityRequests?emp_id=${loggedInEmployeeId}&business_id=${businessId}&isManager=${isManager}`
            );
    
            console.log('Response status:', response.status);
    
            const data = await response.json();
            console.log('Raw response data:', data);
    
            if (response.ok && data.success) {
                console.log('Fetched past availability requests:', data.pastAvailabilityRequests); 
                setPastAvailabilityRequests(data.pastAvailabilityRequests || []);
            } else {
                console.error('Error fetching past availability requests:', data.message);
            }
        } catch (error) {
            console.error('Error fetching past availability requests:', error);
        }
    };
    
    // Add a log in renderTabContent to check if pendingRequests contains data
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Upcoming':
                return setTabContent(upcomingRequests, futureAvailabilityRequests);
            case 'Pending':
                return setTabContent(pendingRequests, pendingAvailabilityRequests);
            case 'Approved':
                return setTabContent(approvedRequests, approvedAvailabilityRequests);
            case 'Rejected':
                return setTabContent(rejectedRequests, rejectedAvailabilityRequests);
            case 'Past':
                return setTabContent(pastRequests, pastAvailabilityRequests);
            default:
                return null;
        }
    };

    const handleAddRequestVis = () => {
        setAddRequestVisible(true);
    };

    const handleChangeAvailabilityVis = () => {
        setChangeAvailabilityVisible(true); 
    };

    const handleOpenRequest = (request, isAvailabilityRequest = false) => {
        console.log('Opening request:', request);
        if (isAvailabilityRequest) {
            setSelectedRequest(request); 
            setAvailabilityRequestVisible(true); 
        } else {
            if (typeof request === 'object') {
                setSelectedRequest(request); 
                setRequestID(request.request_id); 
            } else {
                setRequestID(request); 
            }
            setRequestVisible(true);
        }
    };
    
    //Hardcoded test content
    pulledAccount = [{isBusiness: 'no'}];

    // Updated setTabContent with a check to ensure pulledRequestArray is an array
    const setTabContent = (ptoRequests = [], availabilityRequests = []) => {
        if (!Array.isArray(ptoRequests) || !Array.isArray(availabilityRequests)) {
            console.error("Expected arrays for PTO and Availability requests but received:", {
                ptoRequests,
                availabilityRequests,
            });
            return null;
        }
    
        const hasPTORequests = ptoRequests.length > 0;
        const hasAvailabilityRequests = availabilityRequests.length > 0;
    
        if (!hasPTORequests && !hasAvailabilityRequests) {
            return (
                <View>
                    <Text style={styles.noTabContent}>No {activeTab} Requests</Text>
                </View>
            );
        }
    
        return (
            <>
                {ptoRequests.map((request) => (
                    <View key={`pto-${request.request_id}`} style={styles.requestBox}>
                        <View style={styles.requestRow}>
                            <View style={[styles.requestItem, styles.idColumn]}>
                                <Text style={styles.requestText}>{request.request_id}</Text>
                            </View>
                            <View style={[styles.requestItem, styles.nameColumn]}>
                                <Text style={styles.requestText}>{request.f_name} {request.l_name}</Text>
                            </View>
                            <View style={[styles.requestItem, styles.statusColumn]}>
                                <View style={styles.makeHorizontal}>
                                    <View style={[styles.statusCircle, getStatusCircleStyle(request.status)]} />
                                    <Text style={styles.requestText}>{request.status}</Text>
                                </View>
                            </View>
                            <View style={[styles.requestItem, styles.requestDateColumn]}>
                                <Text style={styles.requestText}>{formatDate(request.created_at)}</Text>
                            </View>
                            <View style={[styles.requestItem, styles.createdOnColumn]}>
                                <Text style={styles.requestText}>
                                    {request.start_date === request.end_date
                                        ? formatDate(request.start_date)
                                        : `${formatDate(request.start_date)} - ${formatDate(request.end_date)}`}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.bubbleButton, styles.actionColumn]}
                                onPress={() => handleOpenRequest(request, false)}
                            >
                                <Text style={styles.requestButtonText}>Open Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
    
                {availabilityRequests.map((request) => (
                    <View key={`availability-${request.request_id}`} style={styles.requestBox}>
                        <View style={styles.requestRow}>
                            <View style={[styles.requestItem, styles.idColumn]}>
                                <Text style={styles.requestText}>{request.request_id}</Text>
                            </View>
                            <View style={[styles.requestItem, styles.nameColumn]}>
                                <Text style={styles.requestText}>{request.f_name} {request.l_name}</Text>
                            </View>
                            <View style={[styles.requestItem, styles.statusColumn]}>
                                <View style={styles.makeHorizontal}>
                                    <View style={[styles.statusCircle, getStatusCircleStyle(request.status)]} />
                                    <Text style={styles.requestText}>{request.status}</Text>
                                </View>
                            </View>
                            <View style={[styles.requestItem, styles.requestDateColumn]}>
                                <Text style={styles.requestText}>{formatDate(request.created_at)}</Text>
                            </View>
                            <View style={[styles.requestItem, styles.createdOnColumn]}>
                                <Text style={styles.requestText}>
                                    {request.start_date === request.end_date
                                        ? formatDate(request.start_date)
                                        : `${formatDate(request.start_date)} - ${formatDate(request.end_date)}`}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.bubbleButton, styles.actionColumn]}
                                onPress={() => handleOpenRequest(request, true)}
                            >
                                <Text style={styles.requestButtonText}>Open Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </>
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
            <NavBar homeRoute={'Employee'} showLogout={false}/>
            <View style={styles.screenCenter}>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <Text style={styles.containerHeader}>Change Availability Request</Text>
                        {pulledAccount[0].isBusiness === 'no' && (
                         <TouchableOpacity style={styles.headerBubbleButton} onPress={handleChangeAvailabilityVis}>
                            <Text style={styles.buttonText}>Change Availability</Text>
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
                        <Text style={[styles.requestLabel, styles.requestDateColumn]}>Created On</Text>
                        <Text style={[styles.requestLabel, styles.createdOnColumn]}>Requested Date(s)</Text>
                        <Text style={[styles.requestLabel, styles.actionColumn]}>Action</Text>
                    </View>

                    <View style={styles.HDivider}/>                   
                    <View style={styles.scrollWrapper}>
                        <ScrollView contentContainerStyle={styles.scrollContainer}>
                            <View style={styles.contentContainer}>{renderTabContent()}</View>
                        </ScrollView>
                    </View>
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
                        business_id={businessId}
                        isManager={isManager}
                    />
                    <ChangeAvailabilityModal
                        isVisible={changeAvailabilityVisible}
                        onClose={() => setChangeAvailabilityVisible(false)}
                        empId={loggedInEmployeeId}
                        businessId={businessId}
                    />
                    <OpenAvailabilityRequestModal
                        requestVisible={availabilityRequestVisible}
                        setRequestVisible={setAvailabilityRequestVisible}
                        requestID={selectedRequest?.request_id}
                        business_id={businessId}
                        isManager={isManager}
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
        paddingBottom: 20,
    },
    scrollView: {
        maxHeight: 500,
        width: '100%',
    },
     scrollWrapper: {
        flex: 1,
        maxHeight: 460, 
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
        paddingHorizontal: 40,
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

export default ChangeAvailabilityRequestPage; 