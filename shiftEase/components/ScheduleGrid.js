import React, { useImperativeHandle, useRef, useEffect, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';


const ScheduleGrid = forwardRef(({dates, employeeAssignments, shiftAssignments, rowCount, onDrop, onRemove }, ref) => {
    const cellRefs = useRef({});

    useImperativeHandle(ref, () => ({
        handleDrop: (x, y, item, type) => {
            Object.keys(cellRefs.current).forEach((cellId) => {
                const cell = cellRefs.current[cellId];
                cell.measure((fx, fy, width, height, px, py) => {
                    if (x > px && x < px + width && y > py && y < py + height) {
                        onDrop(cellId, item, type);
                    }
                });
            });
        }
    }));

    const measureCell = (cellId, ref) => {
        if (ref) {
            cellRefs.current[cellId] = ref;
        }
    };

    const handleCellTap = (cellId, type) => {
        // If there is an assignment in this cell, call onRemove with the type
        if ((type === 'employee' && employeeAssignments[cellId]) ||
            (type === 'shift' && shiftAssignments[cellId])) {
            onRemove(cellId, type);
        }
    };

    return (
        <View style={styles.gridContainer}>
            {[...Array(rowCount)].map((_, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                    {dates.map((date, colIndex) => {
                        const cellId = `${rowIndex}-${colIndex}`;
                        const employeeName = employeeAssignments[cellId];
                        const shiftTime = shiftAssignments[cellId];

                        return (
                            <TouchableOpacity
                                key={cellId}
                                style={styles.gridCell}
                                ref={(ref) => measureCell(cellId, ref)}
                                onPress={() => {
                                    if (employeeName) {
                                        handleCellTap(cellId, 'employee');
                                    } else if (shiftTime) {
                                        handleCellTap(cellId, 'shift');
                                    }
                                }}
                            >
                                {/* Display both employee and shift time if they exist */}
                                <Text style={styles.employeeText}>{employeeName || ''}</Text>
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