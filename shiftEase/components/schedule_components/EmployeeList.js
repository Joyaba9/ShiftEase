import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import AnimatedEmployeeItem from './AnimatedEmployeeItem';

const EmployeeList = ({ 
  employees,            // Array of employee objects to display
  handleDrop,           // Function to handle drag-and-drop actions for employees 
  selectedTitle,        // Currently selected filter option
  setDropdownVisible    // Function to toggle dropdown visibility
}) => (
  <View style={styles.employeeContainer}>
    {/* Header container for employee list title and filter dropdown */}
    <View style={styles.employeeTopContainer}>
      <Text style={styles.title}> {selectedTitle === "All" ? "All Team Members" : selectedTitle}</Text>
      
      {/* Button to toggle the visibility of the filter dropdown */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible((prev) => !prev)}
      >
        <Text style={styles.dropdownText}>{selectedTitle}</Text>
      </TouchableOpacity>
    </View>

    {/* Scrollable container for displaying the list of employees */}
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 10 }}>
      {employees.map((employee) => (
        // Render each employee as an animated item with drag-and-drop support
        <AnimatedEmployeeItem key={employee.emp_id} employee={employee} handleDrop={handleDrop} />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  employeeContainer: { 
    position: 'relative',
    width: '25%',
    maxHeight: 610,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    marginBottom: 20,
  },
  employeeTopContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  dropdownButton: {
    height: 30,
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 5,
  },
  dropdownText: {
    color: 'gray',
  },  
});

export default EmployeeList;