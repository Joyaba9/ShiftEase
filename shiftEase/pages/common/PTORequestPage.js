import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import NavBar from '../../components/NavBar';
import AddPTORequestModal from './AddPTORequestModal';
import OpenPTORequestModal from './OpenPTORequestModal';

const PTORequestPage = () => {
    const [activeTab, setActiveTab] = useState('Upcoming'); 
    const [addRequestVisible, setAddRequestVisible] = useState(false);
    const [requestVisible, setRequestVisible] = useState(false);
    const loggedInUser = useSelector((state) => state.user.loggedInUser);
    const businessId = loggedInUser?.employee?.business_id;
    const loggedInEmployeeId = loggedInUser?.employee?.emp_id;
    
    const handleAddRequestVis = () => {
        setAddRequestVisible(true);
    };

    const handleOpenRequest = () => {
        setRequestVisible(true);
    };
    
    //Hardcoded test content
    pulledAccount = [
        {isBusiness: 'no', BusID: '6', EmpID: '6U27'}
    ];
    pulledPendingRequest = [
        { id: 1, EmpID: '6U7', BusID: '6', EmpFName: 'John', EmpLName: 'Doe', Status: 'Pending', RequestDate: '2024-12-12', CreatedAt: '2024-11-06'},
        { id: 4, EmpID: '6U27', BusID: '6', EmpFName: 'Will', EmpLName: 'Testing', Status: 'Pending', RequestDate: '2024-12-12', CreatedAt: '2024-11-06'},
    ];
    pulledApprovedRequest = [
        { id: 2, EmpID: '6U7', BusID: '6', EmpFName: 'John', EmpLName: 'Doe', Status: 'Approved', RequestDate: '2024-12-12', CreatedAt: '2024-11-06'},
        { id: 5, EmpID: '6U27', BusID: '6', EmpFName: 'Will', EmpLName: 'Testing', Status: 'Approved', RequestDate: '2024-12-12', CreatedAt: '2024-11-06'},
    ];
    pulledRejectedRequest = [
        { id: 3, EmpID: '6U7', BusID: '6', EmpFName: 'John', EmpLName: 'Doe', Status: 'Rejected', RequestDate: '2024-12-12', CreatedAt: '2024-11-06'},
        { id: 6, EmpID: '6U27', BusID: '6', EmpFName: 'Will', EmpLName: 'Testing', Status: 'Rejected', RequestDate: '2024-12-12', CreatedAt: '2024-11-06'},
    ];
    pulledPastRequest = [];

    const getAllRequestStatusByEmployee = async ( status ) => {
        if (!loggedInEmployeeId || !businessId || !status) {
            alert('Error with emp or bus id or status');
            return;
        }

        // orig
        /*
        try {
            console.log('Payload being sent:', {
                loggedInEmployeeId,
                businessId,
                status
            });
        
            const response = await fetch('http://localhost:5050/api/employee/getAllRequestsByStatus?emp_id=${loggedInEmployeeId}&business_id=${businessId}&status=${status}', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        
            const data = await response.json();
        
            if (response.ok) {
                alert('Displayed request successfully');
            } else {
                console.error('Failed to display request:', data);
                alert(data.message || 'Failed to display request');
            }
        } catch (err) {
            console.error('Error during displaying request:', err);
            alert('Error displaying request');
        }*/

        //new
        try {
            const response = await fetch(`http://localhost:5050/api/employee/getAllRequestsByStatus?emp_id=${loggedInEmployeeId}&business_id=${businessId}&status=${status}`);
            if (!response.ok) {
              throw new Error('Failed to fetch employees');
            }
            const data = await response.json();
            console.log('Fetched roles:', data);
            //setEmployees(data.map(employee => ({ ...employee, id: employee.emp_id })));
          } catch (error) {
            console.error('Error fetching employees:', error);
          }

    }

    // Function to render content based on the selected tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Upcoming':
                return setTabContent(pulledPendingRequest);
            case 'Pending':
                return getAllRequestStatusByEmployee('Pending');
            case 'Approved':
                return setTabContent(pulledApprovedRequest);
            case 'Rejected':
                return setTabContent(pulledRejectedRequest);
            case 'Past':
                return setTabContent(pulledPastRequest);
            default:
                return null;
        }
    };
    
    // Prepares the proper array to be displayed
    const setTabContent = (pulledRequestArray) => {
        const accountType = pulledAccount[0].isBusiness;
        const businessId = pulledAccount[0].BusID;
        const employeeId = pulledAccount[0].EmpID;
    
        // Filter requests based on account type
        const filteredRequests = pulledRequestArray.filter(request =>
            accountType === 'yes' ? request.BusID === businessId : request.EmpID === employeeId
        );
    
        // Render the filtered requests
        return filteredRequests.length === 0 ? (
            <View>
                <Text style={styles.noTabContent}>No Current Requests</Text>
            </View>
        ) : (
            filteredRequests.map((request) => (
                <View key={request.id} style={styles.requestBox}>
                    <View style={styles.requestRow}>
                        <View style={[styles.requestItem, styles.idColumn]}><Text style={styles.requestText}>{request.id}</Text></View>
                        <View style={[styles.requestItem, styles.nameColumn]}><Text style={styles.requestText}>{request.EmpFName} {request.EmpLName}</Text></View>
                        <View style={[styles.requestItem, styles.statusColumn]}>
                            <View style={styles.makeHorizontal}>
                                <View style={[styles.statusCircle, getStatusCircleStyle(request.Status)]}/>
                                <Text style={styles.requestText}>{request.Status}</Text>
                            </View>
                        </View>
                        <View style={[styles.requestItem, styles.requestDateColumn]}><Text style={styles.requestText}>{request.RequestDate}</Text></View>
                        <View style={[styles.requestItem, styles.createdOnColumn]}><Text style={styles.requestText}>{request.CreatedAt}</Text></View>
                        <TouchableOpacity style={[styles.bubbleButton, styles.actionColumn]} onPress={handleOpenRequest}>
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
            <NavBar homeRoute={'Business'}/>
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
                        <Text style={[styles.requestLabel, styles.requestDateColumn]}>Requested Date</Text>
                        <Text style={[styles.requestLabel, styles.createdOnColumn]}>Created On</Text>
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
                        //businessId={loggedInBusiness.business.business_id}
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