import React, {useState} from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, PanResponder } from 'react-native';
import { Animated } from 'react-native';


const ShiftControls = ({ 
  shiftTimes = [], // Array of existing shift times
  setShiftTimes,  // Function to update shift times
  newShiftStart,  // Start time for the new shift being added
  newShiftEnd,   // End time for the new shift being added
  setNewShiftStart,  // Function to update new shift start time
  setNewShiftEnd,   // Function to update new shift end time
  handleDrop        // Function to handle drop actions on shifts
}) => {

  // Function to add a new shift to the list
  const handleAddShift = () => {
    if (newShiftStart && newShiftEnd) {
      // Create a new shift object with a unique ID, start and end time, and draggable properties
        const newShift = {
            id: (shiftTimes.length + 1).toString(),    // Unique ID for the shift
            time: `${newShiftStart} - ${newShiftEnd}`, // Displayed time range for the shift
            assigned: false,                           // Initially not assigned
            pan: new Animated.ValueXY(),               // Initial pan position for dragging
        };
        // Add the new shift to the list of shift times
        setShiftTimes((prev) => [...prev, newShift]);

        // Reset the input fields after adding the shift
        setNewShiftStart('');
        setNewShiftEnd('');
    }
};

    return (
      <View style={styles.shiftContainer}>
        <Text style={styles.sectionTitle}>Add Shift Time</Text>

        {/* Row for entering start and end time of a new shift */}
        <View style={styles.inputRow}>
          <TextInput 
            style={styles.input} 
            placeholder="Start Time" 
            value={newShiftStart} 
            onChangeText={setNewShiftStart}  // Update start time
          />
          <TextInput 
            style={styles.input} 
            placeholder="End Time" 
            value={newShiftEnd} 
            onChangeText={setNewShiftEnd}  // Update end time
          />
          <TouchableOpacity style={styles.shiftBtn} onPress={handleAddShift}>
            <Text>Add Shift</Text>
          </TouchableOpacity>
          
        </View>
        
        {/* Section displaying list of shift times */}
        <Text style={styles.sectionTitle}>Shift Times</Text>
        <View style={styles.bottomShiftContainer}>
          {shiftTimes?.length > 0 ? (             // If there are shifts, display them
              shiftTimes.map((shift) => {
                  // Create pan responder for each shift to handle dragging
                  const panResponder = PanResponder.create({
                      // Enable pan responder on start
                      onStartShouldSetPanResponder: () => true,
                      onPanResponderMove: Animated.event(
                          [null, { dx: shift.pan.x, dy: shift.pan.y }],
                          { useNativeDriver: false }
                      ),
                      onPanResponderRelease: (e, gesture) => {
                          // Call handleDrop function with gesture data and shift info when released
                          handleDrop(gesture, shift, 'shift'); 
                          // Reset position after releasing
                          Animated.spring(shift.pan, {
                              toValue: { x: 0, y: 0 },
                              useNativeDriver: false,
                          }).start();
                      },
                  });

                  return (
                    
                      <Animated.View
                          key={shift.id}
                          {...panResponder.panHandlers}
                          style={[shift.pan.getLayout(), styles.draggableShifts, { backgroundColor: 'lightgreen' }]}
                      >
                          <Text style={styles.text}>{shift.time}</Text>
                      </Animated.View>
                  );
              })
          ) : (
              <Text style={styles.text}>No shifts available</Text>
          )}
        </View>
      </View>
    );
  };

const styles = StyleSheet.create({
  shiftContainer: { 
    width: '30%',
    alignSelf: 'flex-start',
    padding: 10, 
  },
  sectionTitle: { 
    fontSize: 20, 
    marginBottom: 10 
  },
  inputRow: { 
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  input: { 
    minWidth: '35%',
    borderWidth: 1, 
    padding: 5, 
    marginRight: 10, 
  },
  shiftBtn: {
    width: 80,
    height: 30,
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'lightblue'
  },
  bottomShiftContainer: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    marginBottom: 50
  },
  draggableShifts: {  
    width: '40%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 5
  },
});

export default ShiftControls;