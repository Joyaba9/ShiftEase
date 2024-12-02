import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';

const ChangeAvailabilityModal = ({ isVisible, onClose, empId, businessId }) => {
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [reason, setReason] = useState('');
    const [availabilityDetails, setAvailabilityDetails] = useState({
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: '',
        Saturday: '',
        Sunday: '',
    });

    const handleAvailabilityChange = (day, value) => {
        setAvailabilityDetails((prevDetails) => ({
            ...prevDetails,
            [day]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!selectedStartDate || !Object.values(availabilityDetails).some((val) => val) || !reason.trim()) {
            alert('Please fill in all required fields.');
            return;
        }

        const payload = {
            emp_id: empId,
            business_id: businessId,
            start_date: selectedStartDate,
            end_date: selectedEndDate || selectedStartDate,
            availability: availabilityDetails,
            reason,
        };

        try {
            const response = await fetch('http://localhost:5050/api/employee/addAvailabilityRequest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Availability request submitted successfully!');
                onClose();
            } else {
                alert(data.message || 'Failed to submit availability request.');
            }
        } catch (error) {
            console.error('Error submitting availability request:', error);
            alert('Error submitting availability request.');
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <ScrollView contentContainerStyle={styles.scrollView}>
                        <Text style={styles.modalTitle}>Change Availability</Text>

                    {/* Calendar Row for Start and End Date */}
                        <View style={styles.calendarsRow}>
                            <View style={styles.calendarWrapper}>
                                <Text style={styles.calendarLabel}>Start Date</Text>
                                <Calendar
                                    style={styles.calendar}
                                    current={selectedStartDate || undefined}
                                    onDayPress={(day) => setSelectedStartDate(day.dateString)}
                                    markedDates={{
                                        [selectedStartDate]: { selected: true, selectedColor: '#9FCCF5' },
                                    }}
                                />
                            </View>
                            <View style={styles.calendarWrapper}>
                                <Text style={styles.calendarLabel}>End Date</Text>
                                <Calendar
                                    style={styles.calendar}
                                    current={selectedEndDate || undefined}
                                    onDayPress={(day) => setSelectedEndDate(day.dateString)}
                                    markedDates={{
                                        [selectedEndDate]: { selected: true, selectedColor: '#9FCCF5' },
                                    }}
                                />
                            </View>
                        </View>


                        {/* Availability Details Inputs */}
                        <Text style={styles.label}>Availability Details</Text>
                        {Object.keys(availabilityDetails).map((day) => (
                            <View key={day} style={styles.availabilityRow}>
                                <Text style={styles.dayLabel}>{day}</Text>
                                <TextInput
                                    style={styles.availabilityInput}
                                    placeholder="e.g., 9:00 AM - 5:00 PM"
                                    value={availabilityDetails[day]}
                                    onChangeText={(value) => handleAvailabilityChange(day, value)}
                                />
                            </View>
                        ))}
                        {/* Reason Field */}
                          <Text style={styles.label}>Comments</Text>
                        <TextInput
                            style={styles.textBox}
                            placeholder="Enter your any additional comments here"
                            value={reason}
                            onChangeText={setReason}
                            multiline
                        />

                        {/* Submit Button */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.bubbleButton} onPress={handleSubmit}>
                                <Text style={styles.submitButtonText}>Submit Request</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.bubbleButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxHeight: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
    },
    scrollView: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    availabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    dayLabel: {
        width: '30%',
        fontSize: 16,
        fontWeight: '500',
    },
    availabilityInput: {
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 40,
    },
    bubbleButton: {
        borderRadius: 50,
        backgroundColor: '#9FCCF5',
        width: 150, 
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10, 
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 3.5,
        marginHorizontal: 10, 
    },
    
    buttonRow: {
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center', 
        marginTop: 20, 
    },
    
    buttonText: {
        fontSize: 18,
        color: '#333',
    },
    textBox: {
        height: 100,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        textAlignVertical: 'top', 
        marginBottom: 20,
    },
    calendarsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    calendarWrapper: {
        flex: 1,
        marginHorizontal: 5,
    },
    calendarLabel: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: 16,
    },
    calendar: {
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccc',
    },
});

export default ChangeAvailabilityModal;