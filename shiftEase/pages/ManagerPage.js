import React, { useState } from 'react';
import { ScrollView, Image, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../components/NavBar';
import { useNavigation } from '@react-navigation/native';
import SidebarButton from '../components/SidebarButton';
import ManagerPageMobile from './ManagerPageMobile';
import ManageEmployeePage from './ManageEmployeePage.js';

const { width } = Dimensions.get('window');

const ManagerPage = () => {
  const navigation = useNavigation();
  const isMobile = width < 768; 

  const goToManageEmployeePage = () => {
    navigation.navigate('ManageEmployee'); // Navigate to ManageEmployeePage
  };

  // Render the mobile layout if it's a mobile screen
  if (isMobile) {
    return <ManagerPageMobile />;
  }

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
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
                onPress={() => {}}
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

          <View style={styles.spacer} />
          
          {/* Right Column */}
          <View style={styles.rightPane}>
            {/* Announcements Section */}
            <LinearGradient 
              colors={['#E7E7E7', '#A7CAD8']} 
              style={styles.gradientAnnounce}
            >
              <View style={styles.announcements}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Announcements</Text>
                  <View style={styles.spacer} />
                  <Ionicons name="megaphone-outline" size={30} color="black" />
                </View>
                <View style={styles.textBox}>
                    {/* Add Announcements Logic? */}
                </View>
                <TouchableOpacity style={styles.addIconContainer}>
                  <Ionicons name="add-circle" size={50} color="black" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Reports Section */}
            <LinearGradient 
              colors={['#E7E7E7', '#A7CAD8']} 
              style={styles.gradient}
            >
                <View style={styles.reportsContainer}>
                  <View style={styles.topBar}>
                    <Text style={styles.sectionTitle}>Daily Reports</Text>
                    <View style={styles.spacer} />
                    <Ionicons name="document-text-outline" size={30} color="black" />
                  </View>
                  <View style={styles.textBox}>
                      {/* Add Reports Logic? */}
                  </View>
                </View>
            </LinearGradient>

            {/* Key Performance Section */}
            <LinearGradient 
              colors={['#E7E7E7', '#A7CAD8']} 
              style={styles.gradient}
            >
              <View style={styles.performanceContainer}>
                <View style={styles.topBar}>
                  <Text style={styles.sectionTitle}>Key Performance Overview</Text>
                  <View style={styles.spacer} />
                  <Ionicons name="bar-chart-outline" size={30} color="black" />
                </View>
                <View style={styles.textBox}>
                    {/* Add Performance Logic? */}
                </View>
                <TouchableOpacity style={styles.addIconContainer2}>
                  <Ionicons name="add-circle" size={50} color="black" />
                </TouchableOpacity>
              </View>  
            </LinearGradient>
          </View>
        </View>

        {/* Right Pane with Messaging Box */}
        <View style={styles.rightPane}>
          <Text style={styles.messagingHeader}>Team Messaging</Text>
          <View style={styles.messagingBox}></View>
        </View>
      </View>

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
              <Image style={styles.userImage} source={require('../assets/images/add_employee_icon 1.png')} resizeMode="contain" />
              <View style={styles.addEmpVDivider} />

              <View style={styles.addEmpInputContainer}>
                
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 'John'"
                      value={fName}
                      onChangeText={setFName}
                    />
                   </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 'Smith'"
                      value={lName}
                      onChangeText={setLName}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="yyyy-mm-dd"
                      value={dob}
                      onChangeText={setDOB}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="example@email.com"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Role</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setIsDropdownVisible(prev => !prev)}
                    >
                      <Text style={styles.dropdownText}>{role}</Text>
                    </TouchableOpacity>
    
                    {isDropdownVisible && (
                      <View style={styles.dropdownContainer}>
                      <FlatList
                       data={roles}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => handleSelectRole(item)}
                          >
                            <Text style={styles.dropdownItemText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      </View>
                    )}
                  </View>
              
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Four of SSN</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter SSN"
                      value={ssn}
                      onChangeText={setSSN}
                    />
                  </View>
                </View>

                <View style={styles.buttonRowContainer}>
                  <TouchableOpacity 
                    style={styles.bubbleButton} 
                    onPress={handleCancel}> 
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.bubbleButton} 
                    onPress={handleAddEmp}>
                    <Text style={styles.buttonText}>Add User</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          <Modal
            transparent={true}
            visible={isModalVisible}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>Are you sure you want to cancel?</Text>
                <Text style={styles.modalText}>All information inputed will be loss if you did not add an user.</Text>
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
        
        </View>
      </Modal>
    </View>
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
  dashboardContainer: {
    flexGrow: 1,
    width: '95%',
    maxWidth: 1200,
    flexDirection: 'row', // Two columns layout
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 50,
    paddingLeft: 40,
    paddingRight: 40,
  },
  dashboardText: {
    fontSize: 25,
    alignSelf: 'flex-start',
    marginTop: 40,
    paddingLeft: 60
  },
  spacer: {
    flexGrow: 2, // Grow dynamically to fill space
    flexShrink: 1, // Shrink if space is limited
  },
  icon: {
    width: 50,
    height: 50
  },
  icon2: {
    width: 40,
    height: 40
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  textBox: {
    flex: 1,
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
  desktopLogo: {
    width: 300,
    height: 50,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default ManagerPage;
