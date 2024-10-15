import React, { useState } from 'react';
import { ScrollView, Image, View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SidebarButton from '../components/SidebarButton';
import ManagerPageMobile from './ManagerPageMobile';
import ManageEmployeePage from './ManageEmployeePage.js';
import NavBar from '../components/NavBar';

const { width } = Dimensions.get('window');

const ManagerPage = () => {
  const navigation = useNavigation();
  const isMobile = width < 768;

  const [addEmpVisible, setAddEmpVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [dob, setDOB] = useState('');
  const [email, setEmail] = useState('');
  const [ssn, setSSN] = useState('');
  const [role, setRole] = useState('Select Role');
  const roles = ["Manager", "Employee"];

  const goToManageEmployeePage = () => {
    navigation.navigate('ManageEmployee'); // Navigate to ManageEmployeePage
  };

  const handleAddEmp = async () => {
    if (!fName || !lName || !dob || !email || !ssn || role === "Select Role") {
      alert('Please make sure all fields are filled in.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5050/api/addEmp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role,
          fName,
          lName,
          email,
          ssn,
          dob
        })
      });

      if (response.status === 200) {
        alert('Added employee successfully');
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Error during adding emp:', err);
      alert('Add employee error');
    }
  };

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setIsDropdownVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(true);
  };

  const confirmCancel = () => {
    setIsModalVisible(false);
    setAddEmpVisible(false);
  };

  const cancelCancel = () => {
    setIsModalVisible(false);
  };

  // Render the mobile layout if it's a mobile screen
  if (isMobile) {
    return <ManagerPageMobile />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <NavBar />
        <Text style={styles.dashboardText}>Business Dashboard</Text>
  
        <View style={styles.dashboardContainer}>
          {/* Left Column */}
          <View style={styles.leftPane}>
            <SidebarButton
              icon={require('../assets/images/manage_business.png')}
              label="Manage Business"
              onPress={() => {}}
              customContainerStyle={{ right: -10 }}
            />
            <SidebarButton
              icon={require('../assets/images/add_employee_icon.png')}
              label="Add Employee"
              onPress={() => setAddEmpVisible(true)} // Open the Add Employee Modal
              customContainerStyle={{ right: -10 }}
            />
            <SidebarButton
              icon={require('../assets/images/employees_talking.png')}
              label="Manage Employee"
              onPress={goToManageEmployeePage} // Navigate to ManageEmployeePage
              customContainerStyle={{ right: 10 }}
            />
            <SidebarButton
              icon={require('../assets/images/email_icon.png')}
              label="Messages"
              onPress={() => {}}
              customContainerStyle={{ right: 20 }}
              customIconStyle={{ width: 100, height: 100 }}
            />
            <SidebarButton
              icon={require('../assets/images/edit_roles_icon_trans.png')}
              label="Edit Roles"
              onPress={() => {}}
              customContainerStyle={{ right: 10 }}
            />
          </View>
  
          {/* Right Column */}
          <View style={styles.rightPane}>
            {/* Announcements Section */}
            <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradientAnnounce}>
              <View style={styles.announcements}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Announcements</Text>
                  <View style={styles.spacer} />
                  <Ionicons name="megaphone-outline" size={30} color="black" />
                </View>
                <View style={styles.textBox}></View>
                <TouchableOpacity style={styles.addIconContainer}>
                  <Ionicons name="add-circle" size={50} color="black" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
  
            {/* Reports Section */}
            <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradient}>
              <View style={styles.reportsContainer}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Daily Reports</Text>
                  <View style={styles.spacer} />
                  <Ionicons name="document-text-outline" size={30} color="black" />
                </View>
                <View style={styles.textBox}></View>
              </View>
            </LinearGradient>
  
            {/* Key Performance Section */}
            <LinearGradient colors={['#E7E7E7', '#A7CAD8']} style={styles.gradient}>
              <View style={styles.performanceContainer}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Key Performance Overview</Text>
                  <View style={styles.spacer} />
                  <Ionicons name="bar-chart-outline" size={30} color="black" />
                </View>
                <View style={styles.textBox}></View>
              </View>
            </LinearGradient>
          </View>
        </View>
  
        {/* Bottom Bar with Logo */}
        <LinearGradient colors={['#E7E7E7', '#9DCDCD']} style={styles.bottomBarContainer}>
          <Image resizeMode="contain" source={require('../assets/images/logo1.png')} style={styles.desktopLogo} />
        </LinearGradient>
  
        {/* Modal for adding employee */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={addEmpVisible}
          onRequestClose={() => setAddEmpVisible(false)}
        >
          <View style={styles.addEmpGray}>
            <View style={styles.addEmpContainer}>
              <Text style={styles.addEmpHeader}>Add Employee</Text>
              <View style={styles.addEmpHDivider} />
  
              <View style={styles.addEmpRowContainer}>
                <Image style={styles.userImage} source={require('../assets/images/add_employee_icon.png')} resizeMode="contain" />
                <View style={styles.addEmpVDivider} />
  
                <View style={styles.addEmpInputContainer}>
                  <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>First Name</Text>
                      <TextInput style={styles.input} placeholder="Ex: 'John'" value={fName} onChangeText={setFName} />
                    </View>
  
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Last Name</Text>
                      <TextInput style={styles.input} placeholder="Ex: 'Smith'" value={lName} onChangeText={setLName} />
                    </View>
                  </View>
  
                  <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Date of Birth</Text>
                      <TextInput style={styles.input} placeholder="yyyy-mm-dd" value={dob} onChangeText={setDOB} />
                    </View>
  
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <TextInput style={styles.input} placeholder="example@email.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
                    </View>
                  </View>
  
                  <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Role</Text>
                      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsDropdownVisible((prev) => !prev)}>
                        <Text style={styles.dropdownText}>{role}</Text>
                      </TouchableOpacity>
  
                      {isDropdownVisible && (
                        <View style={styles.dropdownContainer}>
                          <FlatList
                            data={roles}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectRole(item)}>
                                <Text style={styles.dropdownItemText}>{item}</Text>
                              </TouchableOpacity>
                            )}
                          />
                        </View>
                      )}
                    </View>
  
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Last Four of SSN</Text>
                      <TextInput style={styles.input} placeholder="Enter SSN" value={ssn} onChangeText={setSSN} />
                    </View>
                  </View>
  
                  <View style={styles.buttonRowContainer}>
                    <TouchableOpacity style={styles.bubbleButton} onPress={handleCancel}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
  
                    <TouchableOpacity style={styles.bubbleButton} onPress={handleAddEmp}>
                      <Text style={styles.buttonText}>Add User</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
  
        {/* Confirmation Modal */}
        <Modal
          transparent={true}
          visible={isModalVisible} // Show the confirmation modal
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Are you sure you want to cancel?</Text>
              <Text style={styles.modalText}>All information inputted will be lost.</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalButton} onPress={confirmCancel}>
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={cancelCancel}>
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },

  logo: {
    width: 120,
    height: 40,
  },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  navText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },

  leftPane: {
    flex: 1,
    justifyContent: 'space-around',
  },

  rightPane: {
    flex: 2,
    padding: 20,
    backgroundColor: '#e0e8f0',
    borderRadius: 10,
  },

  button: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },

  buttonText: {
    fontSize: 18,
    color: '#333',
  },

  messagingHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  messagingBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },

  addEmpGray: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  addEmpView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addEmpText: {
    marginBottom: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addEmpContainer: {
    width: '100%',
    maxWidth: 1400,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 20
  },
  addEmpHeader: {
    fontSize: 40,
    paddingHorizontal: 20,
    paddingTop: 15,
    fontWeight: '400',
  },
  addEmpHDivider: {
    borderBottomColor: 'lightgray',
    borderBottomWidth: 2,
    marginVertical: 20,
    width: '98%',
    alignSelf: 'center',
  },
  addEmpRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  userImage: {
    width: 300,
    height: 300,
  },
  addEmpVDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'gray',
    marginHorizontal: 20,
  },
  addEmpInputContainer: {
    flex: 1,
    padding: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    color: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdownButton: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 5,
  },
  dropdownText: {
    color: 'gray',
  },
  dropdownContainer: {
    position: 'absolute', 
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    zIndex: 9999,
    top: 25, 
    left: 0,
    right: 0,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  bubbleButton: {
    borderRadius: 50,
    backgroundColor: "#fff",
    width: 80,
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3.5,
    marginHorizontal: 10
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  buttonRowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 30,
    top: 25
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
  },
});

export default ManagerPage;