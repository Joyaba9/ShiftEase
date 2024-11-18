import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { formatDate, formatTime } from './schedule_components/scheduleUtils';

const ShiftCard = ({ date, time, addedHours, totalHours, onAddShift }) => {
    return (
        <View style={styles.shiftCard}>
            {/* Individual Shift Cards */}
            <View style = {styles.leftsideShiftCard}>
                <Text style={styles.shiftText}>{formatDate(date)}</Text>
                <Text style={styles.shiftText}>{time}</Text>
                <Text style={styles.shiftText}>Front of House</Text>
            </View>
                                    
            <View style = {styles.rightsideShiftCard}>
                <Text style={styles.hourText}>+ {addedHours} hr</Text>
                <Text style={styles.totalHourText}>Total hrs: {totalHours}</Text>

                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add Shift</Text>
                </TouchableOpacity>
            </View>    
        </View>    
    );
};

const styles = StyleSheet.create({
    shiftCard: {
        flexDirection: 'row',
        width: 350,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        marginBottom: 5, // Space between shift cards
    },
    leftsideShiftCard: {
        flex: 1,
        justifyContent: 'space-between',
    },
    shiftText: {
        fontSize: 16,
        marginBottom: 5
    },
    rightsideShiftCard: {
        flex: 1,
        alignItems: "flex-end",
    },
    hourText: {
        fontSize: 10,
        color: 'green'
    },
    totalHourText: {
        fontSize: 12,
    },
    addButton: {
        width: 100,
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 7,
        marginTop: 15,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
});

export default ShiftCard;