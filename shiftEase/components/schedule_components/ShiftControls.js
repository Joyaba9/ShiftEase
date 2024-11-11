import React, {useState} from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, PanResponder, Picker } from 'react-native';
import { Animated } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';


const ShiftControls = ({ 
  shiftTimes = [], // Array of existing shift times
  setShiftTimes,  // Function to update shift times
  newShiftStart,  // Start time for the new shift being added
  newShiftEnd,   // End time for the new shift being added
  setNewShiftStart,  // Function to update new shift start time
  setNewShiftEnd,   // Function to update new shift end time
  handleDrop        // Function to handle drop actions on shifts
}) => {
  const [isCustomStart, setIsCustomStart] = useState(false);
  const [isCustomEnd, setIsCustomEnd] = useState(false);

  // Predefined times for dropdown
  const times = [
    '12:00 AM', '12:30 AM', '1:00 AM','1:30 AM', '2:00 AM',
    '2:30 AM', '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM',
    '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM',
    '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM',
    '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM',
    '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
    '10:30 PM', '11:00 PM', '11:30 PM'
  ];

  // State to control the open state of each DropDownPicker
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

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
        setIsCustomStart(false);
        setIsCustomEnd(false);
    }
};

    return (
      <View style={styles.shiftContainer}>
        <Text style={styles.sectionTitle}>Add Shift Time</Text>

        {/* Row for entering start and end time of a new shift */}
        <View style={[styles.inputRow, { zIndex: 2000 }]}>
          {/* Start Time Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={{marginBottom: 5}}>Start Time</Text>
            <DropDownPicker
              open={openStartPicker}
              setOpen={setOpenStartPicker}
              value={isCustomStart ? 'Custom' : newShiftStart}
              items={[
                ...times.map(time => ({ label: time, value: time })),
                { label: 'Custom', value: 'Custom' }
              ]}
              onSelectItem={(item) => {
                if (item.value === 'Custom') {
                  setIsCustomStart(true);
                  setNewShiftStart(''); 
                } else {
                  setIsCustomStart(false);
                  setNewShiftStart(item.value);
                }
              }}
              placeholder="Select Start Time"
              style={{ 
                width: '100%',
                backgroundColor: 'white', 
              }}
              dropDownContainerStyle={{ 
                backgroundColor: '#ffffff',
                maxHeight: 150,
                shadowColor: '#000', // Add a shadow to make it more visible on top of content
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                position: 'absolute',
              }} 
              textStyle={{
                color: 'black', // Text color for better readability
              }}
            />
            {isCustomStart && (
              <TextInput
                style={styles.customInput}
                placeholder="Enter custom time"
                value={newShiftStart}
                onChangeText={setNewShiftStart}
              />
            )}
          </View>

          {/* End Time Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={{marginBottom: 5}}>End Time</Text>
            <DropDownPicker
              open={openEndPicker}
              setOpen={setOpenEndPicker}
              value={isCustomEnd ? 'Custom' : newShiftEnd}
              items={[
                ...times.map(time => ({ label: time, value: time })),
                { label: 'Custom', value: 'Custom' }
              ]}
              onSelectItem={(item) => {
                if (item.value === 'Custom') {
                  setIsCustomEnd(true);
                  setNewShiftEnd('');
                } else {
                  setIsCustomEnd(false);
                  setNewShiftEnd(item.value);
                }
              }}
              placeholder="Select End Time"
              style={{ 
                width: '100%',
                backgroundColor: 'white',
              }}
              dropDownContainerStyle={{ 
                backgroundColor: '#ffffff',
                maxHeight: 150,
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                position: 'absolute',
              }} 
              textStyle={{
                color: 'black', 
              }}
            />
            {isCustomEnd && (
              <TextInput
                style={styles.customInput}
                placeholder="Enter custom time"
                value={newShiftEnd}
                onChangeText={setNewShiftEnd}
              />
            )}
          </View>
          <TouchableOpacity style={styles.shiftBtn} onPress={handleAddShift}>
            <Text style={{alignSelf: 'center', fontSize: 15}}>Add Shift</Text>
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
  dropdownContainer: {
    marginRight: 8,
  },
  input: { 
    width: '35%',
    borderWidth: 1, 
    padding: 5, 
    marginRight: 10, 
  },
  customInput: {
    width: '100%',
    borderWidth: 1, 
    padding: 5, 
    borderRadius: 8,
    marginTop: 5
  },
  shiftBtn: {
    width: 100,
    height: 35,
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