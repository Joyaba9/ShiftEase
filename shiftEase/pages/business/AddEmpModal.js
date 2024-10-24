import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const AddEmpModal = ({ addEmpVisible, setAddEmpVisible, businessId }) => {
    const isMobile = width < 768; 

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [fName, setFName] = useState('');
    const [lName, setLName] = useState('');
    const [dob, setDOB] = useState('');
    const [email, setEmail] = useState('');
    const [ssn, setSSN] = useState('');
    const [role, setRole] = useState('Select Role');
    const roles = ["Manager", "Employee"];

    const handleAddEmp = async () => {
        if (!fName || !lName || !dob || !email || !ssn || role === "Select Role") {
          alert('Please make sure all fields are filled in.');
          return;
        }
    
        try {
          const response = await fetch('http://localhost:5050/api/employee/add', {
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
                    dob,
                    businessId
                })
            });
    
            if (response.status === 200) {
                alert('Added employee successfully');
                setFName(''); // Clear the first name field
                setLName('');
                setDOB('');
                setEmail('');
                setSSN('');
                setRole('Select Role'); // Reset role selection
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
        if (isMobile) {
            Alert.alert(
                "Are you sure?",
                "All information inputted will be lost.",
                [
                    { text: "No", onPress: () => console.log("Cancel Pressed") },
                    { text: "Yes", onPress: confirmCancel }
                ],
                { cancelable: false }
            );
        } else {
            // Show modal for web/desktop
            setIsModalVisible(true);
        }
    };
        
    const confirmCancel = () => {
        setIsModalVisible(false);
        setAddEmpVisible(false);
    };
        
    const cancelCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Modal
            animationType="slide"
            transparent={true}
            visible={addEmpVisible}
            onRequestClose={() => setAddEmpVisible(false)}
            >
            {isMobile ? (
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={20} // Adjust this value if needed
            >
                
                <View style={styles.mobileAddEmpContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Image 
                            style={styles.mobileUserImage} 
                            source={require('../../assets/images/add_employee_icon.png')} 
                            resizeMode="contain" 
                        />
                                
                        <Text style={styles.mobileAddEmpHeader}>Add Employee</Text>
                        <View style={styles.addEmpHDivider} />

                                
                        {/* Input fields */}
                            <View style={styles.mobileAddEmpRowContainer}>
                                <View style={styles.addEmpInputContainer}>
                                    {/* First Name and Last Name */}
                                     <View style={styles.mobileInputRow}>
                                        <View style={styles.mobileInputGroup}>
                                            <Text style={styles.label}>First Name</Text>
                                                <TextInput 
                                                    style={styles.mobileInput} 
                                                    placeholder="Ex: 'John'" 
                                                    placeholderTextColor= 'grey'
                                                    value={fName} 
                                                    onChangeText={setFName} 
                                                />
                                        </View>

                                        <View style={styles.mobileInputGroup}>
                                            <Text style={styles.label}>Last Name</Text>
                                            <TextInput 
                                                style={styles.mobileInput} 
                                                placeholder="Ex: 'Smith'" 
                                                placeholderTextColor= 'grey'
                                                value={lName} 
                                                onChangeText={setLName} 
                                            />
                                        </View>
                                    </View>

                                    {/* Date of Birth and Email */}
                                    <View style={styles.mobileInputRow}>
                                        <View style={styles.mobileInputGroup}>
                                            <Text style={styles.label}>Date of Birth</Text>
                                            <TextInput 
                                                style={styles.mobileInput} 
                                                placeholder="yyyy-mm-dd" 
                                                placeholderTextColor= 'grey'
                                                value={dob} 
                                                onChangeText={setDOB} 
                                            />
                                        </View>

                                        <View style={styles.mobileInputGroup}>
                                            <Text style={styles.label}>Email</Text>
                                            <TextInput 
                                                style={styles.mobileInput} 
                                                placeholder="example@email.com" 
                                                placeholderTextColor= 'grey'
                                                keyboardType="email-address" 
                                                value={email} 
                                                onChangeText={setEmail} 
                                            />
                                        </View>
                                    </View>

                                    {/* Role and SSN */}
                                    <View style={styles.mobileInputRow}>
                                        <View style={styles.mobileInputGroup}>
                                            <Text style={styles.label}>Role</Text>
                                            <TouchableOpacity 
                                                style={styles.mobileDropdownButton} 
                                                onPress={() => setIsDropdownVisible((prev) => !prev)}
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

                                        <View style={styles.mobileInputGroup}>
                                            <Text style={styles.label}>Last Four of SSN</Text>
                                            <TextInput 
                                                style={styles.mobileInput} 
                                                placeholder="Enter SSN" 
                                                placeholderTextColor= 'grey'
                                                value={ssn} 
                                                onChangeText={setSSN} 
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Buttons */}
                                <View style={styles.mobileButtonRowContainer}>
                                    <TouchableOpacity 
                                        style={styles.mobileBubbleButton} 
                                        onPress={handleCancel}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.mobileBubbleButton} 
                                        onPress={handleAddEmp}
                                    >
                                        <Text style={styles.buttonText}>Add User</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                           
                    </ScrollView>
                </View> 
            </KeyboardAvoidingView>
        ) : (
            <View style={styles.addEmpGray}>
                <View style={styles.addEmpContainer}> 
                    <Text style={styles.addEmpHeader}>Add Employee</Text> 

                    <View style={styles.addEmpHDivider} />
                    <View style={styles.addEmpRowContainer}>
                            <Image style={styles.userImage} source={require('../../assets/images/add_employee_icon.png')} resizeMode="contain" /> 
                            
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
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="Enter SSN" 
                                        value={ssn} 
                                        onChangeText={setSSN} 
                                    />
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
            )}
        </Modal>
        
       {/* Confirmation Modal */}
        <Modal
          transparent={true}
          visible={isModalVisible} // Show the confirmation modal
          onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={!isMobile ? styles.modalOverlay : styles.mobileModalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Are you sure you want to cancel?</Text>
                    <Text style={styles.modalText}>All information inputted will be lost.</Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={styles.modalButton} onPress={confirmCancel}>
                            <Text style={styles.optionText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={cancelCancel}>
                            <Text style={styles.optionText}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    </>
)};

const styles = StyleSheet.create ({
    //Mobile Modal Styles
    keyboardAvoidingView: {
        justifyContent: 'center',
        paddingTop: 50,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    mobileAddEmpContainer: {
        width: '95%',
        height: '95%',
        backgroundColor: "rgba(255, 255, 255, 1)",
        borderRadius: 20,
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        paddingBottom: 20
    },
    mobileUserImage: {
        width: 160,
        height: 160,
        alignSelf: 'center'
    },
    mobileAddEmpHeader: {
        fontSize: 30,
        alignSelf: 'center',
        fontWeight: '400',
    },
    mobileAddEmpRowContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    mobileInputRow: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    mobileInputGroup: {
        marginBottom: 20, // Provide some space between the input fields
        width: '100%',
    },
    mobileInput: {
        height: 40,
        borderColor: 'gray',
        color: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '100%',
    },
    mobileDropdownButton: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        justifyContent: 'center',
        borderRadius: 10,
        marginBottom: 10,
    },
    mobileButtonRowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        paddingBottom: 30,
        marginBottom: 20,
    },
    mobileBubbleButton: {
        borderRadius: 50,
        backgroundColor: "#9FCCF5",
        width: 100,
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
    mobileModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 1000,
    },
    //Web Modal Styles
  addEmpGray: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20
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
    backgroundColor: "#9FCCF5",
    width: 100,
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
  optionText: {
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

export default AddEmpModal;

