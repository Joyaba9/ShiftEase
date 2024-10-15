import React, { useEffect, useState } from 'react';
import { ScrollView, Image, View, Text, StyleSheet, Button, Alert, TextInput} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../components/NavBar';

const ManageEmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [editedEmployee, setEditedEmployee] = useState(null); // For the employee being edited
  const [isEditing, setIsEditing] = useState(false); // For toggling edit mode
  
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      console.error('Business ID not found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5050/api/employees/${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5050/api/employees/${editedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedEmployee),
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) => (emp.id === editedEmployee.id ? editedEmployee : emp))
      );
      Alert.alert('Success', 'Employee updated successfully.');
      setIsEditing(false); // Close the edit form
      setEditedEmployee(null); // Clear the edited employee
    } catch (error) {
      console.error('Error updating employee:', error);
      Alert.alert('Error', 'Failed to update employee.');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:5050/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      setEmployees(employees.filter((emp) => emp.id !== employeeId));
      Alert.alert('Success', 'Employee deleted successfully.');
    } catch (error) {
      console.error('Error deleting employee:', error);
      Alert.alert('Error', 'Failed to delete employee.');
    }
  };

  const openEditForm = (employee) => {
    setEditedEmployee(employee);
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setEditedEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <NavBar />

        <LinearGradient 
          colors={['#E7E7E7', '#A7CAD8']} 
          style={styles.gradient}
        >
          <View style={styles.manageEmployeeContainer}>
            <View style={styles.topBar}>
              <Text style={styles.sectionTitle}>Manage Employees</Text>
              <Ionicons name="people-outline" size={30} color="black" />
            </View>

            {/* Employee List */}
            <View style={styles.textBox}>
              {employees.length === 0 ? (
                <Text>No employees found.</Text>
              ) : (
                employees.map((employee) => (
                  <View key={employee.id} style={styles.employeeRow}>
                    <Text>{`${employee.firstName} ${employee.lastName}`}</Text>
                    <View style={styles.buttonsContainer}>
                      <Button 
                        title="Edit" 
                        onPress={() => openEditForm(employee)} 
                      />
                      <Button 
                        title="Delete" 
                        color="red" 
                        onPress={() => handleDeleteEmployee(employee.id)} 
                      />
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Edit Form */}
            {isEditing && editedEmployee && (
              <View style={styles.editForm}>
                <Text style={styles.editTitle}>Edit Employee</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={editedEmployee.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={editedEmployee.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={editedEmployee.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last 4 SSN"
                  value={editedEmployee.ssn}
                  onChangeText={(value) => handleInputChange('ssn', value)}
                />
                <Button title="Save Changes" onPress={handleEdit} />
                <Button title="Cancel" color="gray" onPress={() => setIsEditing(false)} />
              </View>
            )}
          </View>
        </LinearGradient>

        <LinearGradient 
          colors={['#E7E7E7', '#9DCDCD']} 
          style={styles.bottomBarContainer}
        >
          <Image
            resizeMode="contain"
            source={require('../assets/images/logo1.png')}
            style={styles.desktopLogo}
          />
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
    minHeight: '100%',
  },
  dashboardText: {
    fontSize: 25,
    alignSelf: 'flex-start',
    marginTop: 40,
    paddingLeft: 60,
  },
  gradient: {
    width: '95%',
    height: 'auto',
    borderRadius: 10,
    marginBottom: 40,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  manageEmployeeContainer: {
    borderRadius: 10,
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flexGrow: 1, // This allows the title to take the space
  },
  textBox: {
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    backgroundColor: '#fff', // Background for better visibility
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  editForm: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addIconContainer: {
    position: 'absolute',
    bottom: -60,
    right: 10,
    zIndex: 1,
  },
  bottomBarContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  desktopLogo: {
    width: 300,
    height: 50,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default ManageEmployeePage;
