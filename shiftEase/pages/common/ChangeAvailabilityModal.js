import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

const ChangeAvailabilityModal = ({ isVisible, onClose, empId, businessId }) => {
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [reason, setReason] = useState('');
    const [availabilityDetails, setAvailabilityDetails] = useState({
        Monday: { start: '', end: '' },
        Tuesday: { start: '', end: '' },
        Wednesday: { start: '', end: '' },
        Thursday: { start: '', end: '' },
        Friday: { start: '', end: '' },
        Saturday: { start: '', end: '' },
        Sunday: { start: '', end: '' },
    });

    useEffect(() => {
        if (!isVisible) {
            // Reset fields when the modal is closed
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            setReason('');
            setAvailabilityDetails({
                Monday: { start: '', end: '' },
                Tuesday: { start: '', end: '' },
                Wednesday: { start: '', end: '' },
                Thursday: { start: '', end: '' },
                Friday: { start: '', end: '' },
                Saturday: { start: '', end: '' },
                Sunday: { start: '', end: '' },
            });
        }
    }, [isVisible]);

    const handleSubmit = async () => {
        if (!selectedStartDate || !Object.values(availabilityDetails).some((val) => val) || !reason.trim()) {
            alert('Please fill in all required fields.');
            return;
        }
    
        const payload = {
            emp_id: empId,
            business_id: businessId,
            start_date: formatToMMDDYYYY(selectedStartDate), // Convert to MM/DD/YYYY
            end_date: selectedEndDate ? formatToMMDDYYYY(selectedEndDate) : formatToMMDDYYYY(selectedStartDate),
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
                resetForm();
                onClose();
            } else {
                alert(data.message || 'Failed to submit availability request.');
            }
        } catch (error) {
            console.error('Error submitting availability request:', error);
            alert('Error submitting availability request.');
        }
    };

    const resetForm = () => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setReason('');
        setAvailabilityDetails({
            Monday: '',
            Tuesday: '',
            Wednesday: '',
            Thursday: '',
            Friday: '',
            Saturday: '',
            Sunday: '',
        });
    };
    
    

    const handleAvailabilityChange = (day, field, value) => {
        setAvailabilityDetails((prevDetails) => ({
            ...prevDetails,
            [day]: {
                ...prevDetails[day],
                [field]: value,
            },
        }));
    };

    const pickerItems = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2) % 12 || 12; // Calculate the hour
        const minutes = i % 2 === 0 ? '00' : '30'; // Add either '00' or '30' for half-hour intervals
        const suffix = i < 24 ? 'AM' : 'PM'; // Determine AM or PM
        return { label: `${hour}:${minutes} ${suffix}`, value: `${hour}:${minutes} ${suffix}` };
    });
    
        // Function to format date to MM/DD/YYYY for display
        const formatToMMDDYYYY = (dateString) => {
            const [year, month, day] = dateString.split('-');
            return `${month}/${day}/${year}`;
        };

        // Function to handle date selection and maintain ISO format in state
        const handleDayPress = (dateKey, day) => {
            if (dateKey === 'start') {
                setSelectedStartDate(day.dateString); // ISO format
            } else if (dateKey === 'end') {
                setSelectedEndDate(day.dateString); // ISO format
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
                                    onDayPress={(day) => handleDayPress('start', day)}
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
                                    onDayPress={(day) => handleDayPress('end', day)}
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
                                
                                <View style={styles.pickerContainer}>
                                    <Text style={styles.pickerLabel}>Start Time</Text>
                                    <Picker
                                        selectedValue={availabilityDetails[day].start}
                                        onValueChange={(value) => handleAvailabilityChange(day, 'start', value)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Start Time" value="" />
                                        {pickerItems.map((item) => (
                                            <Picker.Item key={item.value} label={item.label} value={item.value} />
                                        ))}
                                    </Picker>
                                </View>
                                
                                <View style={styles.pickerContainer}>
                                    <Text style={styles.pickerLabel}>End Time</Text>
                                    <Picker
                                        selectedValue={availabilityDetails[day].end}
                                        onValueChange={(value) => handleAvailabilityChange(day, 'end', value)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="End Time" value="" />
                                        {pickerItems.map((item) => (
                                            <Picker.Item key={item.value} label={item.label} value={item.value} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        ))}


                        {/* Reason Field */}
                        <Text style={styles.label}>Comments</Text>
                        <TextInput
                            style={styles.textBox}
                            placeholder="Enter any additional comments here"
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
        marginBottom: 20, 
        paddingHorizontal: 10, 
    },
    dayLabel: {
        fontSize: 18, 
        fontWeight: 'bold',
        marginBottom: 10, 
        color: '#333',
    },
    pickerContainer: {
        marginBottom: 15, 
    },
    pickerLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5, 
        color: '#555',
    },
    picker: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        fontSize: 16,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: '#333',
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
