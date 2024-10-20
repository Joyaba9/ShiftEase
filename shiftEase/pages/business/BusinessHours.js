import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const BusinessHours = ({ businessHours = {}, isEditing, setBusinessHours }) => {
    // Function to handle changes to the business hours
    const handleHoursChange = (day, type, value) => {
        // Create a copy of the current business hours
        const updatedHours = { ...businessHours };
        // Update the specific day's open/close time
        updatedHours[day][type] = value;
        // Set the updated hours
        setBusinessHours(updatedHours);
    };

    return (
        <View>
            <Text style={styles.header}>Business Hours:</Text>
            <View style={styles.container}>
                {Object.keys(businessHours).map((day, index) => (
                    <View key={index} style={styles.hoursRow}>
                        <Text style={styles.dayLabel}>{day}</Text>
                        <TextInput
                            style={[styles.hoursInput, isEditing && styles.editableInput]}
                            value={businessHours[day]?.open || ''}
                            placeholder="Open Time"
                            placeholderTextColor= 'grey' 
                            readOnly={!isEditing}
                            onChangeText={(value) => handleHoursChange(day, 'open', value)}
                        />
                        <Text> - </Text>
                        <TextInput
                            style={[styles.hoursInput, isEditing && styles.editableInput]}
                            value={businessHours[day]?.close || ''}
                            placeholder="Close Time"
                            placeholderTextColor= 'grey'
                            readOnly={!isEditing}
                            onChangeText={(value) => handleHoursChange(day, 'close', value)}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        marginTop: 20,
    },
    container: {
        marginTop: 10,
        paddingLeft: 30,
        //borderWidth: 2,
        //borderColor: 'green'
    },
    hoursRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    dayLabel: {
        width: 80,
    },
    hoursInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        width: 90,
        textAlign: 'center',
    },
    editableInput: {
        borderColor: '#000', // Black border when editing
        borderWidth: 1,
        backgroundColor: '#FFF', // White background when editing
    }
});



export default BusinessHours;