import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Picker, ScrollView } from 'react-native';

const getAvailabilityRequestById = async (requestId) => {
    try {
        const response = await fetch(`http://localhost:5050/api/employee/getAvailabilityRequestInfo?request_id=${requestId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch availability request details');
        }
        const data = await response.json();
        if (data.success) {
            return data.requestInfo;
        } else {
            throw new Error('Availability request not found');
        }
    } catch (error) {
        console.error('Error fetching availability request details:', error);
        return null;
    }
};


const { width } = Dimensions.get('window');

const OpenAvailabilityRequestModal = ({ requestVisible, setRequestVisible, requestID, business_id, isManager }) => {
    const [pulledOpenRequest, setPulledOpenRequest] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    const [managerComments, setManagerComments] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        if (requestID) {
            getAvailabilityRequestById(requestID).then((requestData) => {
                if (requestData) {
                    setPulledOpenRequest(requestData);
                    setManagerComments(requestData.manager_comments || '');
                    setSelectedStatus(requestData.request_status || '');
    
                    if (isManager) {
                        setCanEdit(true);
                    }
                }
            });
        }
    }, [requestID]);

    const handleCancel = () => {
        setRequestVisible(false);
    };

    const handleSubmit = async () => {
        if (!pulledOpenRequest || !selectedStatus) {
            alert('Request details or status are missing.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5050/api/employee/updateAvailabilityRequestStatus', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_id: pulledOpenRequest.request_id,
                    business_id: business_id,
                    status: selectedStatus,
                    manager_comments: managerComments,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Request status updated successfully.');
                setRequestVisible(false);
            } else {
                console.error('Failed to update request:', data.message);
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error while updating request:', error);
            alert('An error occurred while updating the request.');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={requestVisible}
            onRequestClose={() => setRequestVisible(false)}
        >
            <View style={styles.screenGray}>
                <View style={styles.OpenRequestContainer}>
                    <Text style={styles.modalHeader}>Availability Request</Text>
                    <View style={styles.HDivider} />
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {pulledOpenRequest && (
                        <View style={styles.mainContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>Employee Information</Text>
                            </View>
                            <View style={styles.empInfoContainer}>
                                <View style={styles.empInfoItem}>
                                    <Text style={styles.sectionLabel}>First Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={pulledOpenRequest.first_name || ''}
                                        editable={false}
                                    />
                                </View>
                                <View style={styles.empInfoItem}>
                                    <Text style={styles.sectionLabel}>Last Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={pulledOpenRequest.last_name || ''}
                                        editable={false}
                                    />
                                </View>
                                <View style={styles.empInfoItem}>
                                    <Text style={styles.sectionLabel}>Created At</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={new Date(pulledOpenRequest.created_at).toLocaleDateString()}
                                        editable={false}
                                    />
                                </View>
                            </View>

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>Request Details</Text>
                            </View>
                            <View style={styles.empInfoContainer}>
                                <View style={styles.empInfoItem}>
                                <Text style={styles.sectionLabel}>Request Comments</Text>
                                <TextInput
                                    style={styles.inputComment}
                                    value={pulledOpenRequest?.reason || ''} 
                                    editable={false}
                                    multiline
                                />
                                    <Text style={styles.sectionLabel}>Start Date</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={new Date(pulledOpenRequest.start_date).toLocaleDateString()}
                                        editable={false}
                                    />
                                </View>
                                <View style={styles.empInfoItem}>
                                    <Text style={styles.sectionLabel}>End Date</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={new Date(pulledOpenRequest.end_date).toLocaleDateString()}
                                        editable={false}
                                    />
                                </View>
                                <View style={styles.empInfoItem}>
                                    <Text style={styles.sectionLabel}>Availability</Text>
                                    <TextInput
                                        style={styles.inputComment}
                                        value={JSON.stringify(pulledOpenRequest.availability, null, 2)} 
                                        editable={false}
                                        multiline
                                    />
                                </View>
                            </View>

                        
                                <>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionHeaderText}>Manager Actions</Text>
                                    </View>
                                    <View style={styles.empInfoContainer}>
                                        <View style={styles.empInfoItem}>
                                            <Text style={styles.sectionLabel}>Manager Comments</Text>
                                            <TextInput
                                                style={styles.inputComment}
                                                placeholder="Enter any additional comments"
                                                value={managerComments}
                                                onChangeText={setManagerComments}
                                                editable={canEdit}
                                                multiline
                                            />
                                        </View>
                                        <View style={styles.empInfoItem}>
                                            <Text style={styles.sectionLabel}>Request Status</Text>
                                            <Picker
                                                selectedValue={selectedStatus}
                                                style={styles.inputPicker}
                                                onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                                                enabled={canEdit}
                                            >
                                                <Picker.Item label="Pending" value="Pending" />
                                                <Picker.Item label="Approved" value="Approved" />
                                                <Picker.Item label="Rejected" value="Rejected" />
                                            </Picker>
                                        </View>
                                    </View>
                                </>
                        </View>
                    )}
                </ScrollView>
                    <View style={styles.buttonRowContainer}>
                        {isManager && (
                            <TouchableOpacity style={styles.bubbleButton} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.bubbleButton} onPress={handleCancel}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    screenGray: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
    },
    OpenRequestContainer: {
        width: '95%',
        maxHeight: '85%', // Adjust to ensure content fits within the screen
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        padding: 20,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    mainContainer: {
        flex: 1,
    },
    sectionHeader: {
        backgroundColor: '#9DCDCD',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 40,
        borderTopLeftRadius: 15, 
        borderTopRightRadius: 15,
    },
    sectionHeaderText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#333',
    },
    sectionLabel: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    bubbleButton: {
        borderRadius: 50,
        backgroundColor: '#9FCCF5',
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 3.5,
        marginLeft: 15,
        marginRight: 15,
    },
    buttonText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
    },
    modalHeader: {
        fontSize: 32,
        paddingHorizontal: 20,
        paddingTop: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    HDivider: {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        marginVertical: 10,
        width: '100%',
        alignSelf: 'center',
    },
    buttonRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 10,
    },
    input: {
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 8,
        borderRadius: 8,
        fontSize: 14,
        width: '100%',
    },
    inputComment: {
        borderColor: '#ddd',
        height: 100,
        borderWidth: 1,
        borderRadius: 8,
        textAlignVertical: 'top',
        padding: 10,
        fontSize: 14,
        width: '100%',
    },
    empInfoItem: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginVertical: 10,
        width: '48%',
    },
    empInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
});



export default OpenAvailabilityRequestModal;
