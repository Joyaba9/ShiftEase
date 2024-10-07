import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Schedule = ({ employeeNames, currentDate, view }) => {
    // Generate the days/week data for rendering.
    const getWeekDates = () => {
        const dates = [];
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            dates.push(day);
        }
        return dates;
    };

    const getDayView = () => {
        return [currentDate];
    };

    const dates = view === 'week' ? getWeekDates() : getDayView();

    return (
        <View style={styles.scheduleContainer}>
            {/* Date Row */}
            <View style={styles.dateRow}>
                <View style={styles.employeeHeaderCell}>
                    <Text>Employees</Text>
                </View>
                {dates.map((date, index) => (
                    <View key={index} style={styles.dayCell}>
                        <Text>{date.toDateString()}</Text>
                    </View>
                ))}
            </View>

            {/* Employee Rows */}
            {employeeNames.map((employee, employeeIndex) => (
                <View key={employeeIndex} style={styles.rowContainer}>
                    <View style={styles.employeeNameCell}>
                        <Text>{employee}</Text>
                    </View>
                    {dates.map((_, dateIndex) => (
                        <View key={dateIndex} style={styles.scheduleCell}>
                            {/* Render shift information here for each employee on that date */}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    scheduleContainer: {
        flex: 1,
        marginTop: 10,
    },
    dateRow: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginHorizontal: 10,
    },
    dayCell: {
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    employeeHeaderCell: {
        width: 100,
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    employeeNameCell: {
        width: 100,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        //marginTop: 10,
    },
    scheduleCell: {
        flex: 1,
        height: 70, // Height of the empty cells
        borderWidth: 1,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
});


export default Schedule;