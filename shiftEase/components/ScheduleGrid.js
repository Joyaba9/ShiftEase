import React, { useImperativeHandle, useRef, useEffect, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ScheduleGrid = forwardRef(({ employeeAssignments, shiftAssignments, onDrop, onRemove }, ref) => {
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
            {[...Array(4)].map((_, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                    {[...Array(7)].map((_, colIndex) => {
                        const cellId = `${rowIndex}-${colIndex}`;
                        return (
                            <TouchableOpacity
                                key={cellId}
                                style={styles.gridCell}
                                ref={(ref) => measureCell(cellId, ref)}
                                onPress={() => {
                                    if (employeeAssignments[cellId]) {
                                        handleCellTap(cellId, 'employee');
                                    } else if (shiftAssignments[cellId]) {
                                        handleCellTap(cellId, 'shift');
                                    }
                                }}
                            >
                                <Text>
                                    {employeeAssignments[cellId] || shiftAssignments[cellId] || 'Drop Here'}
                                </Text>
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
        width: '100%'
    },
    gridRow: { 
        flexDirection: 'row',
        width: '100%' 
    },
    gridCell: {
        flex: 1,
        height: 80,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
});

export default ScheduleGrid;