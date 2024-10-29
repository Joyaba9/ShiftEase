import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NavBar from '../../components/NavBar';
import { Ionicons } from '@expo/vector-icons';

const ManageEmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [availability, setAvailability] = useState([]);
  const loggedInUser = useSelector((state) => state.business.businessInfo);
  const businessId = loggedInUser?.business?.business_id;

  useEffect(() => {
    fetchEmployees();
  }, [businessId]);

  const fetchEmployees = async () => {
    if (!businessId) {
      console.error('Business ID not found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5050/api/employee/fetchAll/${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data.map(employee => ({ ...employee, id: employee.emp_id })));
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEmployeeAvailability = async (emp_id) => {
    try {
        const response = await fetch(`http://localhost:5050/api/employee/availability/fetch/${emp_id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch availability');
        }
        const data = await response.json();
        return data; // Ensure data is returned here
      } catch (error) {
        console.error('Error fetching availability:', error);
        return []; // Return an empty array on error to handle gracefully
      }
    };

    const openEditForm = async (employee) => {
      setEditedEmployee(employee);
      setIsEditing(true);
  
      try {
          const empAvailability = await fetchEmployeeAvailability(employee.emp_id);
          console.log("Fetched availability data:", empAvailability);
  
          if (!Array.isArray(empAvailability) || empAvailability.length === 0) {
              console.log("No specific availability data found, initializing empty form.");
              setAvailability([
                  { day_of_week: 'Monday', start_time: '', end_time: '', start_date: '', end_date: '' },
                  { day_of_week: 'Tuesday', start_time: '', end_time: '', start_date: '', end_date: '' },
                  { day_of_week: 'Wednesday', start_time: '', end_time: '', start_date: '', end_date: '' },
                  { day_of_week: 'Thursday', start_time: '', end_time: '', start_date: '', end_date: '' },
                  { day_of_week: 'Friday', start_time: '', end_time: '', start_date: '', end_date: '' }
              ]);
          } else {
              const fullWeek = [
                  { day_of_week: 'Monday', start_time: '', end_time: '', start_date: '', end_date: '' },
                  { day_of_week: 'Tuesday', start_time: '', end_time: '', start_date: '', end_date: '' },
                  { day_of_week: 'Wednesday', start_time: '', end_time: '', start_date: '', end_date: '' },
                  { day_of_week: 'Thursday', start_time: '', end_time: '', start_date: '', end_date: '' },
                  { day_of_week: 'Friday', start_time: '', end_time: '', start_date: '', end_date: '' }
              ];
  
              empAvailability.forEach((dayData) => {
                const dayIndex = fullWeek.findIndex(day => day.day_of_week.toLowerCase() === dayData.day_of_week.toLowerCase());
                if (dayIndex > -1) {
                    fullWeek[dayIndex] = { 
                        ...fullWeek[dayIndex], 
                        ...dayData,
                        day_of_week: dayData.day_of_week.charAt(0).toUpperCase() + dayData.day_of_week.slice(1),
                        start_time: dayData.start_time, 
                        end_time: dayData.end_time      
                    };
                }
            });
              setAvailability(fullWeek);
              console.log("Final availability set in state:", fullWeek);
          }
      } catch (error) {
          console.error('Error fetching availability:', error);
      }
  };
  
    


  const handleEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5050/api/employee/update/${editedEmployee.emp_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: editedEmployee.role_id,
          f_name: editedEmployee.f_name,
          l_name: editedEmployee.l_name,
          email: editedEmployee.email,
          last4ssn: editedEmployee.last4ssn,
          birthday: editedEmployee.birthday,
          availability
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) => (emp.emp_id === editedEmployee.emp_id ? editedEmployee : emp))
      );
      Alert.alert('Success', 'Employee updated successfully.');
      setIsEditing(false);
      setEditedEmployee(null);
      await submitAvailabilityData(availability);
    } catch (error) {
      console.error('Error updating employee:', error);
      Alert.alert('Error', 'Failed to update employee.');
    }
  };

  const submitAvailabilityData = async (availabilityData) => {
    try {
      const response = await fetch(`http://localhost:5050/api/employee/availability/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emp_id: editedEmployee.emp_id,
          availability: availabilityData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit availability data');
      }
      Alert.alert('Success', 'Availability data added successfully.');
    } catch (error) {
      console.error('Error submitting availability:', error);
      Alert.alert('Error', 'Failed to submit availability.');
    }
  };

  const handleAvailabilityChange = (index, field, value) => {
    setAvailability((prev) => {
      const newAvailability = [...prev];
      newAvailability[index] = { ...newAvailability[index], [field]: value };
      return newAvailability;
    });
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const formattedTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`; // Include seconds
            times.push(formattedTime);
        }
    }
    return times;
};

  const timeOptions = generateTimeOptions();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NavBar homeRoute={'Business'} />
      <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradient}>
        <View style={styles.manageEmployeeContainer}>
          <View style={styles.topBar}>
            <Text style={styles.sectionTitle}>Manage Employees</Text>
            <Ionicons name="people-outline" size={30} color="black" />
          </View>

          <ScrollView style={styles.textBox}>
            {employees.length === 0 ? (
              <Text>No employees found.</Text>
            ) : (
              employees.map((employee, index) => (
                <View key={index} style={styles.employeeRow}>
                  <Text>{`${employee.f_name} ${employee.l_name}`}</Text>
                  <View style={styles.buttonsContainer}>
                    <Button title="Edit" onPress={() => openEditForm(employee)} />
                    <Button title="Delete" color="red" onPress={() => handleDeleteEmployee(employee.id)} />
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {isEditing && editedEmployee && (
            <ScrollView contentContainerStyle={styles.editFormContent} style={styles.editForm}>
              <Text style={styles.editTitle}>Edit Employee</Text>
              <TextInput
                style={styles.input}
                placeholder="Role ID"
                value={editedEmployee.role_id?.toString()}
                onChangeText={(value) => setEditedEmployee((prev) => ({ ...prev, role_id: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={editedEmployee.f_name}
                onChangeText={(value) => setEditedEmployee((prev) => ({ ...prev, f_name: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={editedEmployee.l_name}
                onChangeText={(value) => setEditedEmployee((prev) => ({ ...prev, l_name: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={editedEmployee.email}
                onChangeText={(value) => setEditedEmployee((prev) => ({ ...prev, email: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Last 4 SSN"
                value={editedEmployee.last4ssn}
                onChangeText={(value) => setEditedEmployee((prev) => ({ ...prev, last4ssn: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Birthday (YYYY-MM-DD)"
                value={editedEmployee.birthday}
                onChangeText={(value) => setEditedEmployee((prev) => ({ ...prev, birthday: value }))}
              />

              <Text style={styles.availabilityTitle}>Availability</Text>
              {availability.map((avail, index) => (
                <View key={index} style={styles.availabilityRow}>
                  <Text style={styles.dayText}>{avail.day_of_week}</Text>
                  <Picker
                    style={styles.availabilityInput}
                    selectedValue={avail.start_time}
                    onValueChange={(value) => handleAvailabilityChange(index, 'start_time', value)}
                  >
                    {timeOptions.map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                  <Picker
                    style={styles.availabilityInput}
                    selectedValue={avail.end_time}
                    onValueChange={(value) => handleAvailabilityChange(index, 'end_time', value)}
                  >
                    {timeOptions.map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="Start Date (YYYY-MM-DD)"
                    value={avail.start_date ? avail.start_date.split('T')[0] : ''}
                    onChangeText={(value) => handleAvailabilityChange(index, 'start_date', value)}
                  />
                  <TextInput
                    style={styles.dateInput}
                    placeholder="End Date (YYYY-MM-DD)"
                    value={avail.end_date ? avail.end_date.split('T')[0] : ''}
                    onChangeText={(value) => handleAvailabilityChange(index, 'end_date', value)}
                  />
                </View>
              ))}

              <Button title="Save Changes" onPress={handleEdit} />
              <Button title="Cancel" color="gray" onPress={() => setIsEditing(false)} />
            </ScrollView>
          )}
        </View>
      </LinearGradient>
      <LinearGradient colors={['#E7E7E7', '#9DCDCD']} style={styles.bottomBarContainer}>
        <Image
          resizeMode="contain"
          source={require('../../assets/images/logo1.png')}
          style={styles.desktopLogo}
        />
      </LinearGradient>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 20,
    minHeight: '100%',
    height: 200,
    minWidth: 950,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  gradient: {
    width: '95%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    marginBottom: 20,
  },
  manageEmployeeContainer: {
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    width: '90%',
    marginTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flexGrow: 1,
  },
  textBox: {
    maxHeight: 200,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  editForm: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 20,
  },
  editFormContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  availabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayText: {
    width: '25%',
    fontSize: 14,
    fontWeight: 'bold',
  },
  availabilityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    width: '35%',
  },
  dateInput: { 
  borderWidth: 1, 
  borderColor: '#ccc', 
  borderRadius: 5, 
  padding: 5, 
  width: '25%' 
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
  },
});

export default ManageEmployeePage;
