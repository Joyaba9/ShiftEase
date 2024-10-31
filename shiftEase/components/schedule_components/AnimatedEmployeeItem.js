import React from 'react';
import { View, Text, Animated, PanResponder, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatTime } from './scheduleUtils';

const AnimatedEmployeeItem = ({ employee, handleDrop }) => {
    // Create a PanResponder to handle drag-and-drop gestures for each employee
    const panResponder = PanResponder.create({
        // Enable responder for dragging on touch start
        onStartShouldSetPanResponder: () => true,

        // Handle movement of the employee item, updating its x and y positions
        onPanResponderMove: Animated.event(
            [null, { dx: employee.pan.x, dy: employee.pan.y }],
            { useNativeDriver: false }
        ),
        // Handle release of the dragged employee item
        onPanResponderRelease: (e, gesture) => {
            // Trigger the `handleDrop` function, passing gesture info and employee data
            handleDrop(gesture, employee, 'employee');

            // Reset the employee's position to the origin (x: 0, y: 0) with spring animation
            Animated.spring(employee.pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
            }).start();
        },
    });

    const hasAvailability = employee.start_time && employee.end_time;

    return (
        <Animated.View {...panResponder.panHandlers} style={[employee.pan.getLayout(), styles.draggable]}>
            {/* Gradient background that expands if availability exists */}
            <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={[styles.gradient, hasAvailability && styles.expandedGradient]}>
                {/* Display employee's name and total shift hours */}
                <View style={styles.topEmployeeItem}>
                    <Text>{`${employee.f_name} ${employee.l_name}`}</Text>
                    <Text>Hrs: {employee.shiftHours || 0}</Text>
                </View>

                {/* Display the role name of the employee */}
                <Text style={styles.roleText}>{employee.role_name}</Text>

                {/* If the employee has availability, show the time range */}
                {hasAvailability && (
                    <Text style={styles.availabilityText}>
                        {`Available: ${formatTime(employee.start_time)} - ${formatTime(employee.end_time)}`}
                    </Text>
                )}
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    draggable: {
        marginBottom: 10,
        borderRadius: 8,
    },
    gradient: {
        padding: 15,
        borderRadius: 8,
        minHeight: 65, 
    },
    expandedGradient: {
        // Increased height for gradient when availability is displayed
        height: 80,
    },
    topEmployeeItem: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    roleText: {
        marginLeft: 5
    },
    availabilityText: {
        width: '100%',
        fontSize: 12,
        color: '#555',
        marginTop: 4,
        marginLeft: 10
    },
});

export default AnimatedEmployeeItem;