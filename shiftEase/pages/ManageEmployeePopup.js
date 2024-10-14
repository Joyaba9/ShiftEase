import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const ManageEmployeePopup = ({ visible, onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [editedEmployees, setEditedEmployees] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchEmployees();
    }
  }, [visible]);

  const fetchEmployees = async () => {
    const businessId = localStorage.getItem('businessId'); // Retrieve business ID from storage
    if (!businessId) {
      console.error('Business ID not found');
      return; // Exit if no business ID is available
    }

    try {
      const response = await fetch(`http://localhost:5050/api/employees/${businessId}`); // Use the business ID in the endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
      setEditedEmployees(data); // Initialize editedEmployees with fetched data
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleEdit = async (employee) => {
    try {
      const response = await fetch(`http://localhost:5050/api/employees/${employee.id}`, { // Use employee ID for the endpoint
        method: 'PUT', // or 'PATCH'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee), // Send the updated employee data
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      // Update the local state to reflect the change
      const updatedEmployees = editedEmployees.map(emp =>
        emp.id === employee.id ? employee : emp
      );
      setEditedEmployees(updatedEmployees);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <FlatList
          data={editedEmployees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.employeeItem}>
              <TextInput
                style={styles.input}
                value={item.firstName}
                onChangeText={(text) => {
                  const updatedList = editedEmployees.map(emp =>
                    emp.id === item.id ? { ...emp, firstName: text } : emp
                  );
                  setEditedEmployees(updatedList);
                }}
              />
              <TextInput
                style={styles.input}
                value={item.lastName}
                onChangeText={(text) => {
                  const updatedList = editedEmployees.map(emp =>
                    emp.id === item.id ? { ...emp, lastName: text } : emp
                  );
                  setEditedEmployees(updatedList);
                }}
              />
              <TextInput
                style={styles.input}
                value={item.email}
                onChangeText={(text) => {
                  const updatedList = editedEmployees.map(emp =>
                    emp.id === item.id ? { ...emp, email: text } : emp
                  );
                  setEditedEmployees(updatedList);
                }}
              />
              <TextInput
                style={styles.input}
                value={item.ssn} 
                onChangeText={(text) => {
                  const updatedList = editedEmployees.map(emp =>
                    emp.id === item.id ? { ...emp, ssn: text } : emp
                  );
                  setEditedEmployees(updatedList);
                }}
              />
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  employeeItem: { marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 5 },
  editButton: { color: 'blue' },
});

export default ManageEmployeePopup;
