import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Picker } from 'react-native';

// getRequestById - function to get request details from your backend
const getRequestById = async (requestID) => {
    try {
        const response = await fetch(`http://localhost:5050/api/employee/getRequestInfo?request_id=${requestID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch request details');
        }
        const data = await response.json();
        if (data.success) {
            return data.requestInfo; // Return the request data
        } else {
            throw new Error('Request not found');
        }
    } catch (error) {
        console.error('Error fetching request details:', error);
        return null;
    }
};

const { width } = Dimensions.get('window');

const OpenPTORequest = ({ requestVisible, setRequestVisible, requestID }) => {
    const [pulledOpenRequest, setPulledOpenRequest] = useState([]);
    const [canEdit, setCanEdit] = useState(false);
    const [managerComments, setManagerComments] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        if (requestID) {
            getRequestById(requestID).then((requestData) => {
                if (requestData) {
                    setPulledOpenRequest([requestData]); // Assuming only one request is returned
                    console.log('request Data:' , setPulledOpenRequest);
                    setSelectedStatus(requestData.status);
                    if (requestData.role === 'manager') {
                        setCanEdit(true);
                    }
                }
            });
        }
    }, [requestID]);


    const handleCancel = () => {
        setRequestVisible(false);
    };

    const handleSubmit = () => {
        console.log("Submit pressed")
        //Enter Logic...
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
                    <Text style={styles.modalHeader}>Manage a Request</Text>
                    <View style={styles.HDivider} />

                    <View style={styles.mainContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>Employee Information</Text>
                        </View>
                        <View style={styles.empInfoContainer}>
                            <View style={styles.empInfoItem}>
                                <Text style={styles.sectionLabel}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    //value={pulledOpenRequest[0].EmpFName}
                                    readOnly={true} 
                                />
                            </View>
                            <View style={styles.empInfoItem}>
                                <Text style={styles.sectionLabel}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    //value={pulledOpenRequest[0].EmpLName}
                                    readOnly={true} 
                                />
                            </View>
                            <View style={styles.empInfoItem}>
                                <Text style={styles.sectionLabel}>Created At</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pulledOpenRequest.created_at}
                                    readOnly={true} 
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
                                    value={pulledOpenRequest.reason}
                                    readOnly={true} 
                                    multiline
                                />

                                <Text style={styles.sectionLabel}>Manager Comments</Text>
                                <TextInput
                                    style={styles.inputComment}
                                    placeholder="Enter any additional comments"
                                    value={managerComments}
                                    onChangeText={setManagerComments}
                                    readOnly={!canEdit}
                                    multiline
                                />
                            </View>

                            <View style={styles.empInfoItem}>
                                <Text style={styles.sectionLabel}>Start Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pulledOpenRequest.start_date}
                                    readOnly={true} 
                                />

                                <Text style={styles.sectionLabel}>End Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pulledOpenRequest.end_date}
                                    readOnly={true} 
                                />

                                <Text style={styles.sectionLabel}>Start Time</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pulledOpenRequest.start_time}
                                    readOnly={true} 
                                />

                                <Text style={styles.sectionLabel}>End Time</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pulledOpenRequest.start_time}
                                    readOnly={true} 
                                />
                            </View>

                            <View style={styles.empInfoItem}>
                                <Text style={styles.sectionLabel}>Request ID</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pulledOpenRequest.request_id}
                                    readOnly={true} 
                                />

                                <Text style={styles.sectionLabel}>Request Status</Text>
                                <Picker
                                    selectedValue={pulledOpenRequest.status}
                                    style={styles.inputPicker}
                                    onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                                    enabled={canEdit}
                                >
                                    <Picker.Item label="Pending" value="Pending" />
                                    <Picker.Item label="Approved" value="Approved" />
                                    <Picker.Item label="Denied" value="Denied" />
                                </Picker>

                                <Text style={styles.sectionLabel}>Time-Off Type</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pulledOpenRequest.day_type}
                                    readOnly={true} 
                                />
                            </View>
                        </View>

                        
                    </View>
                    
                    <View style={styles.buttonRowContainer}>
                        <TouchableOpacity style={styles.bubbleButton} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>

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
        paddingHorizontal: 20,
    },
    OpenRequestContainer: {
        width: '98%',
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
    mainContainer: {
        flex: 1,
    },
    sectionHeader: {
        backgroundColor: '#9DCDCD',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        width: '97%',
        height: '8%',
        borderTopLeftRadius: 15, 
        borderTopRightRadius: 15, 
    },
    sectionHeaderText: {
        paddingVertical: 7,
        paddingHorizontal: 12,
        fontWeight: 'bold',
        fontSize: 18,
    },
    sectionLabel: {
        marginTop: 10,
        fontSize: 14,
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
    modalHeader: {
        fontSize: 40,
        paddingHorizontal: 20,
        paddingTop: 15,
        fontWeight: '400',
    },
    HDivider: {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2,
        marginVertical: 8,
        width: '100%',
        alignSelf: 'center',
    },
    VDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'gray',
        marginHorizontal: 20,
    },
    buttonRowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 10,
    },
    input: {
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
    },
    inputPicker: {
        borderColor: 'gray',
        borderWidth: 1,
        padding: 8,
    },
    inputComment: {
        borderColor: 'gray',
        height: 110,
        borderWidth: 1,
        textAlignVertical: 'top',
        padding: 10, 
    },
    empInfoItem: {
        flexDirection: 'column',
        marginHorizontal: 'auto',
        width: '30%'
    },
    empInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    }
});

export default OpenPTORequest;
