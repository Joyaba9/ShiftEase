import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View,  Modal, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const ChangeAvailabilityPage = () => {
    const navigation = useNavigation();
  const [availability, setAvailability] = useState([
    { day_of_week: 'Monday', start_time: '', end_time: '', start_date: '', end_date: '' },
    { day_of_week: 'Tuesday', start_time: '', end_time: '', start_date: '', end_date: '' },
    { day_of_week: 'Wednesday', start_time: '', end_time: '', start_date: '', end_date: '' },
    { day_of_week: 'Thursday', start_time: '', end_time: '', start_date: '', end_date: '' },
    { day_of_week: 'Friday', start_time: '', end_time: '', start_date: '', end_date: '' },
    { day_of_week: 'Saturday', start_time: '', end_time: '', start_date: '', end_date: '' },
    { day_of_week: 'Sunday', start_time: '', end_time: '', start_date: '', end_date: '' },
  ]);
  
  const [successMessage, setSuccessMessage] = useState('');
  const [originalAvailability, setOriginalAvailability] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Retrieve logged-in user from Redux store
  const loggedInUser = useSelector((state) => state.user.loggedInUser);
  const employee = loggedInUser ? loggedInUser.employee : null;
  const employeeId = employee?.emp_id;
  const businessId = employee?.business_id;

  useEffect(() => {
    if (businessId) {
        checkPreference(businessId, 8); // Check if preference_id 8 is enabled
    }
}, [businessId]);

const checkPreference = async (businessId, preferenceId) => {
    try {
        const url = `http://localhost:5050/api/preferences/get/${businessId}`;
        console.log('Fetching preferences from:', url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const preferences = await response.json();
        console.log('Fetched preferences:', preferences);

        // Check if the specific preference is enabled
        const preference = preferences.find(pref => pref.preference_id === preferenceId);
        const isPreferenceEnabled = preference && preference.enabled === true;

        if (!isPreferenceEnabled) {
            console.log('Preference not enabled, redirecting...');
            navigation.replace('PTORequest');
        }
    } catch (error) {
        console.error('Error checking preference:', error);
    }
};


  useEffect(() => {
    if (!loggedInUser) {
      console.log('No logged-in user, redirecting to login page...');
      navigation.replace('Login');
    }
  }, [loggedInUser, navigation]);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeAvailability(employeeId);
    }
  }, [employeeId]);

  const fetchEmployeeAvailability = async (emp_id) => {
    try {
      console.log('Fetching availability for employeeId:', emp_id);
      const response = await fetch(`http://localhost:5050/api/employee/availability/fetch/${emp_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      const data = await response.json();

      const fullWeek = [
        { day_of_week: 'Monday', start_time: '', end_time: '', start_date: '', end_date: '' },
        { day_of_week: 'Tuesday', start_time: '', end_time: '', start_date: '', end_date: '' },
        { day_of_week: 'Wednesday', start_time: '', end_time: '', start_date: '', end_date: '' },
        { day_of_week: 'Thursday', start_time: '', end_time: '', start_date: '', end_date: '' },
        { day_of_week: 'Friday', start_time: '', end_time: '', start_date: '', end_date: '' },
        { day_of_week: 'Saturday', start_time: '', end_time: '', start_date: '', end_date: '' },
        { day_of_week: 'Sunday', start_time: '', end_time: '', start_date: '', end_date: '' },
      ];

      data.forEach((dayData) => {
        const dayIndex = fullWeek.findIndex(
          (day) => day.day_of_week.toLowerCase() === dayData.day_of_week.toLowerCase()
        );
        if (dayIndex > -1) {
          fullWeek[dayIndex] = {
            ...fullWeek[dayIndex],
            ...dayData,
            day_of_week: dayData.day_of_week.charAt(0).toUpperCase() + dayData.day_of_week.slice(1),
          };
        }
      });

      setAvailability(fullWeek);
      setOriginalAvailability(fullWeek);
    } catch (error) {
      console.error('Error fetching availability:', error);
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
        const formattedTime = `${hour.toString().padStart(2, '0')}:${min
          .toString()
          .padStart(2, '0')}:00`;
        times.push(formattedTime);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleSaveChanges = async () => {
    try {
      if (!employeeId) {
        throw new Error('Employee ID is missing.');
      }
  
      // Filter out days without meaningful availability data
      const filteredAvailability = availability.filter((avail) => 
        avail.start_time && avail.end_time && avail.start_date && avail.end_date
      );
  
      console.log('Filtered availability:', filteredAvailability); // Debugging
  
      if (filteredAvailability.length === 0) {
        Alert.alert('Error', 'No availability data to save.');
        return;
      }
  
      const response = await fetch(`http://localhost:5050/api/employee/availability/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emp_id: employeeId,
          availability: filteredAvailability,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit availability data');
      }

      setSuccessMessage('Changes Saved Successfully');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      setOriginalAvailability(availability); // Update originalAvailability after saving
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', error.message || 'Failed to update availability.');
    }
  };

  const handleCancelChanges = () => {
    setAvailability([...originalAvailability]); // Revert to original state
    setModalVisible(false); // Close modal
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NavBar homeRoute={'Employee'} />
      <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradient}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Change Availability</Text>
        </View>
    
    {successMessage ? (
      <Text style={styles.successMessage}>{successMessage}</Text>
    ) : null}

        <ScrollView style={styles.textBox}>
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
        </ScrollView>


        <View style={styles.buttonContainer}>
          <Button title="Save Changes" onPress={handleSaveChanges} />
          <Button title="Cancel" color="gray" onPress={() => setModalVisible(true)} />
        </View>
      </LinearGradient>

      {/* Cancel Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to cancel your changes?</Text>
            <View style={styles.modalButtonContainer}>
              <Button title="Yes" onPress={handleCancelChanges} />
              <Button title="No" color="gray" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 20,
    alignItems: 'center',
  },
  gradient: {
    width: '95%',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  textBox: {
    maxHeight: 400,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  availabilityRow: {
    flexDirection: 'column',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  availabilityInput: {
    width: '100%',
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
    borderWidth: 1, 
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff', 
  },
  successMessage: {
    color: 'green',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default ChangeAvailabilityPage;