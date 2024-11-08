import React, { useImperativeHandle, useRef, useEffect, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// ScheduleGrid component that represents the grid for displaying employee assignments and shift times
// forwardRef is used to expose internal methods to the parent component via ref
const ScheduleGrid = forwardRef(({dates, employeeAssignments, shiftAssignments, rowCount, onDrop, onRemove }, ref) => {
    // References to all individual grid cells
    const cellRefs = useRef({});

    // Expose handleDrop method to the parent component via ref
    useImperativeHandle(ref, () => ({
        handleDrop: (x, y, item, type) => {
            // Iterate through each cell to determine if the drop coordinates (x, y) are within any cell bounds
            Object.keys(cellRefs.current).forEach((cellId) => {
                const cell = cellRefs.current[cellId];
                // Measure each cell's position and dimensions
                cell.measure((fx, fy, width, height, px, py) => {
                    // Check if the drop position falls within the current cell's bounds
                    if (x > px && x < px + width && y > py && y < py + height) {
                        // Call onDrop with the cellId, item, and type if the drop is within this cell
                        onDrop(cellId, item, type);
                    }
                });
            });
        }
    }));

    // Function to register a cell's reference for future measurements
    const measureCell = (cellId, ref) => {
        if (ref) {
            cellRefs.current[cellId] = ref;
        }
    };

    // Handle tapping on a cell to remove assignments (employee or shift)
    const handleCellTap = (cellId, type) => {
        // Check if there is an assignment in the cell for the specified type (employee or shift)
        if ((type === 'employee' && employeeAssignments[cellId]) ||
            (type === 'shift' && shiftAssignments[cellId])) {
            // Call onRemove function to remove the assignment from the cell
            onRemove(cellId, type);
        }
    };

    return (
        <View style={styles.gridContainer}>
            {/* Create rows for the grid, based on the specified rowCount */}
            {[...Array(rowCount)].map((_, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                    {/* Create columns within each row based on dates array */}
                    {dates.map((date, colIndex) => {
                        // Unique ID for each cell in the grid
                        const cellId = `${rowIndex}-${colIndex}`;
                        // Assigned employee (if any) for the cell
                        const employee = employeeAssignments[cellId];
                        // Assigned shift time (if any) for the cell
                        const shiftTime = shiftAssignments[cellId];

                        console.log(employee);

                        return (
                            <TouchableOpacity
                                key={cellId}
                                style={styles.gridCell}
                                ref={(ref) => measureCell(cellId, ref)} // Register cell reference for measurements
                                onPress={() => {
                                    if (employee) {
                                        // Handle employee tap if assigned
                                        handleCellTap(cellId, 'employee');
                                    } else if (shiftTime) {
                                        // Handle shift tap if assigned
                                        handleCellTap(cellId, 'shift');
                                    }
                                }}
                            >
                                {/* Display both employee and shift time if they exist */}
                                <Text style={styles.employeeText}>{employee ? `${employee.f_name} ${employee.l_name}` : ''}</Text>
                                <Text style={styles.shiftText}>{shiftTime || ''}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    gridContainer: { 
        flexDirection: 'column',
        width: '100%',
        zIndex: 1
    },
    gridRow: { 
        flexDirection: 'row',
        width: '100%',
        zIndex: 1
    },
    gridCell: {
        flex: 1,
        height: 70,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        zIndex: 1
    },
    employeeText: {
        fontWeight: 'bold',
        color: '#333',
    },
    shiftText: {
        color: '#666',
        fontSize: 12,
    },
});

export default ScheduleGrid;