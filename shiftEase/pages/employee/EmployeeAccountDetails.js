import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { uploadEmployeePhoto, getEmployeePhoto } from '../../../backend/api/employeeApi';

const { width } = Dimensions.get('window');

const getEmployeeData = async (emp_id) => {
    try {
        const response = await fetch(`http://localhost:5050/api/employee/getEmployeeData?emp_id=${emp_id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Employee Data');
        }
        const data = await response.json();
        console.log('Data received from API:', data);

        // Check if the response contains the employee data
        if (data && data.EmployeeData) {
            console.log('Employee Data returned from API:', data.EmployeeData);
            return data.EmployeeData;
        } else {
            throw new Error('Employee Data not found in response');
        }
    } catch (error) {
        console.error('Error fetching Employee Data:', error.message);
        return null;
    }
};

const EmployeeAccountDetails = () => {
    const navigation = useNavigation();
    const isMobile = width < 768; 

    // Access the logged-in employee from the Redux store
    const loggedInEmployee = useSelector((state) => state.user.loggedInUser);
    const empId = loggedInEmployee.employee.emp_id;

    console.log("Logged in Employee for testing: ", loggedInEmployee);
    console.log("Employee id: ", loggedInEmployee.employee.emp_id);

    const [profilePhoto, setProfilePhoto] = useState(require('../../assets/images/default_profile.png'));

    // State variables to store employee details
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [employeeBusName, setEmployeeBusName] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');
    const [employeeAddress, setEmployeeAddress] = useState('');
    const [employeeCity, setEmployeeCity] = useState('');
    const [employeeState, setEmployeeState] = useState('');
    const [employeeZipcode, setEmployeeZipcode] = useState('');
    const [employeePhoneNum, setEmployeePhoneNum] = useState('');

    const [isEditing, setIsEditing] = useState(false);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        if (loggedInEmployee.employee.emp_id) {
            getEmployeeData(loggedInEmployee.employee.emp_id).then((employeeData) => {
                if (employeeData) {
                    // Set the state variables for editable items only if data exists
                    setEmployeeAddress(employeeData.street_address || '');
                    setEmployeeZipcode(employeeData.zipcode || '');
                    setEmployeeCity(employeeData.city || '');
                    setEmployeeState(employeeData.state || '');
                    setEmployeePhoneNum(employeeData.phone_number || '');
                    setEmployeeBusName(employeeData.business_name || '');
    
                    console.log('Pulled Employee Data:', employeeData);
                } else {
                    console.error('Employee data not found.');
                }
    
                // Always set non-editable items based on loggedInEmployee
                setEmployeeId(loggedInEmployee.employee.emp_id);
                setEmployeeName(`${loggedInEmployee.employee.f_name} ${loggedInEmployee.employee.l_name}`);
                setEmployeeEmail(loggedInEmployee.employee.email);
            }).catch((error) => {
                console.error('Error in fetching employee data:', error);
    
                // Even if there's an error, still set non-editable items
                setEmployeeId(loggedInEmployee.employee.emp_id);
                setEmployeeName(`${loggedInEmployee.employee.f_name} ${loggedInEmployee.employee.l_name}`);
                setEmployeeEmail(loggedInEmployee.employee.email);
            });
        }
    }, [loggedInEmployee.employee.emp_id]);
    


    // Function to toggle between "edit mode" and "view mode"
    const handleEditToggle = () => {
        setIsEditing(!isEditing); // Toggle the value of isEditing
    };

    // Function to save the employee location
    async function handleSaveProfile() {
        console.log("Submit pressed");
    
        // Create the employeeData object using the state variables
        const employeeData = {
            emp_id: loggedInEmployee.employee.emp_id,
            street_address: employeeAddress,
            city: employeeCity,
            state: employeeState,
            zipcode: employeeZipcode,
            phone_number: employeePhoneNum,
        };
    
        if (!employeeData.emp_id || !employeeData.street_address || !employeeData.city || !employeeData.state || !employeeData.zipcode || !employeeData.phone_number) {
            alert("Employee data is incomplete.");
            return;
        }
    
        console.log("Payload:", employeeData); // Log the payload being submitted
    
        try {
            // Make a POST request to the /saveEmployeeData route to save or update the employee location data
            const response = await fetch('http://localhost:5050/api/employee/saveEmployeeData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employeeData), // Sending the full employee data as the request body
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert("Employee data saved or updated successfully.");
                console.log("Saved/Updated Employee:", data.emp_id);
    
                // Optionally, you can reset the form or hide the modal
                // setEmployeeData({}); // Reset the form data if needed (unnecessary since it's based on state)
            } else {
                console.error("Failed to save employee data:", data.error);
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error while saving employee data:", error);
            alert("An error occurred while saving the employee data.");
        }
    }    

    // Function to format the phone number with dashes
    const formatPhoneNumber = (phoneNumber) => {
        // Remove all non-numeric characters
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');
        
        // Format according to (XXX) XXX-XXXX pattern
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

        if (match) {
            // Build formatted string from matched groups
            return [match[1], match[2], match[3]]
                .filter(part => part) // Filter out empty parts
                .join('-'); // Join with dashes
        }
        return phoneNumber;
    };

    const handlePhoneChange = (text) => {
        const formattedPhone = formatPhoneNumber(text);
        setEmployeePhoneNum(formattedPhone);
    };

    const handlePhotoUpload = async () => {
        try {
            if (!empId) {
                throw new Error('Employee ID is missing.');
            }
    
            let filePath, fileName;
    
            if (Platform.OS === 'web') {
                // For Web: Use file input to select a photo
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
    
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (!file) return;
    
                    filePath = URL.createObjectURL(file);
                    fileName = file.name;
    
                    console.log('Selected photo for upload:', fileName);
                    await uploadEmployeePhoto(empId, filePath, fileName); // Upload the photo
                };
    
                input.click(); // Open file picker
            } else {
                // For Mobile: Use Expo ImagePicker
                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permissionResult.granted) {
                    alert('Permission is required to access the photo library.');
                    return;
                }
    
                const pickerResult = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 1,
                });
    
                if (pickerResult.canceled) {
                    console.log('Image selection canceled.');
                    return;
                }
    
                filePath = pickerResult.assets[0].uri;
                fileName = filePath.split('/').pop();
    
                console.log('Selected photo for upload:', fileName);
                await uploadEmployeePhoto(empId, filePath, fileName); // Upload the photo
            }
        } catch (error) {
            console.error('Error during photo upload:', error);
            if (Platform.OS === 'web') {
                window.alert(error.message || 'Failed to upload photo.');
            } else {
                Alert.alert('Error', error.message || 'Failed to upload photo.');
            }
        }
    };

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const photoUrl = await getEmployeePhoto(empId);
                setProfilePhoto({ uri: photoUrl });
            } catch (error) {
                console.error('Error fetching profile photo:', error);
            }
        };
    
        fetchPhoto();
    }, [empId]);

    return (
        <View style={!isMobile ? styles.container : styles.mobileContainer}>

            {/* Left column with profile photo and account overview */}
            <View style={!isMobile ? styles.leftColumn : styles.mobileTopPortion}>
                <View style={styles.topContainer}>

                <TouchableOpacity onPress={handlePhotoUpload}>
                    <Image
                        resizeMode="cover"
                        source={
                            profilePhoto && profilePhoto.uri
                                ? { uri: profilePhoto.uri }
                                : require('../../assets/images/default_profile.png')
                        }
                        style={styles.profilePhoto}
                    />
                </TouchableOpacity>

                    {/* Display the employee name */}
                    <Text style={styles.userNameText}>
                        {employeeName ? employeeName : "Employee name loading..."}
                    </Text>
                </View>

                {!isMobile ?
                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.sideContainer} onPress={() => {}}>
                        <Ionicons name="list-outline" size={20} color="black" />
                        <Text style={styles.sideText}> Account Overview </Text>
                    </TouchableOpacity>
                </View> : ""
                }
            </View>

            {/* Right column with editable Employee details */}
            <View style={!isMobile ? styles.rightColumn : styles.mobileBottomPortion}>
                <Text style={styles.title}>Employee Information</Text>
                
                <View>
                    {/* Display employee ID (read-only) */}
                    <View style={styles.informationContainer}>
                        <Text>Employee ID:</Text>
                        <TextInput
                            style={styles.input}
                            value= {employeeId}
                            readOnly={!isEditing} // Cannot edit ID
                        />
                    </View>
                    {/* Display employee name (read-only) */}
                    <View style={styles.informationContainer}>
                        <Text>Business Name:</Text>
                        <TextInput
                            style={styles.input}
                            value={employeeBusName}
                            readOnly={!isEditing} // Cannot edit name
                        />
                    </View>
                    {/* Editable email address */}
                    <View style={styles.informationContainer}>
                        <Text>Email Address:</Text>
                        <TextInput
                            style={styles.input}
                            value={employeeEmail}
                            readOnly={!isEditing} // Not sure if this should be editable
                        />
                    </View>
                    {/* Editable street address */}
                    <View style={styles.informationContainer}>
                        <Text>Street Address:</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.editableInput]}
                            placeholder='Enter street address'
                            placeholderTextColor= 'grey'
                            value={employeeAddress}
                            onChangeText={setEmployeeAddress} // Update street address state on change
                            readOnly={!isEditing} // Only editable if in edit mode
                        />
                    </View>
                    {/* Editable city */}
                    <View style={styles.informationContainer}>
                        <Text>City:</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.editableInput]}
                            placeholder='Enter city'
                            placeholderTextColor= 'grey'
                            value={employeeCity}
                            onChangeText={setEmployeeCity} // Update city state on change
                            readOnly={!isEditing} // Only editable if in edit mode
                        />
                    </View>
                    {/* Editable employee state */}
                    <View style={styles.informationContainer}>
                        <Text>State:</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.editableInput]}
                            placeholder='Enter state (e.g. NY)'
                            placeholderTextColor= 'grey'
                            value={employeeState}
                            onChangeText={setEmployeeState} // Update city state on change
                            readOnly={!isEditing} // Only editable if in edit mode
                        />
                    </View>
                    {/* Editable employee zipcode */}
                    <View style={styles.informationContainer}>
                        <Text>Zipcode:</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.editableInput]}
                            placeholder='Enter zipcode'
                            placeholderTextColor= 'grey'
                            value={employeeZipcode}
                            onChangeText={setEmployeeZipcode} // Update zipcode state on change
                            readOnly={!isEditing} // Only editable if in edit mode
                        />
                    </View>
                    {/* Editable phone number */}
                    <View style={styles.informationContainer}>
                        <Text>Phone Number:</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.editableInput]}
                            placeholder='Enter employee phone number'
                            placeholderTextColor= 'grey'
                            value={employeePhoneNum}
                            onChangeText={handlePhoneChange} // Update phone number state on change
                            readOnly={!isEditing} // Only editable if in edit mode
                        />
                    </View>

                    {/* Edit and Save buttons */}
                    <View style={styles.buttonContainer}>
                        {/* Toggle between Edit and Cancel button depending on edit mode */}
                        <TouchableOpacity style={styles.button} onPress={handleEditToggle}>
                            <Text style={styles.buttonText}>
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </Text>
                        </TouchableOpacity>
                        {/* Save Profile button, only available in edit mode */}
                        <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
                            <Text style={styles.buttonText}>Save Profile</Text>
                        </TouchableOpacity>
                    </View>
                        {/* Render success message if showSuccessMessage is true */}
                        {showSuccessMessage && (
                            <Text style={styles.successMessage}>Profile saved successfully!</Text>
                        )}
                    
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    //Mobile Styles
    mobileContainer: {
        flexDirection: 'column',
    },
    mobileTopPortion: {
        width: width,
        backgroundColor: '#F1F1F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,

    },
    mobileBottomPortion: {
        width: width,
        padding: 20,
    },
    //Web Styles
    container: {
        flexDirection: 'row',
        height: '80%',
        minWidth: '60%',
        maxWidth: '70%',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 30,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    leftColumn: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#F1F1F1',
        maxWidth: 300,
        minWidth: 250,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    topContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    addIconContainer: {
        position: 'absolute',
        alignSelf: 'flex-start',
        left: 95,
        zIndex: 1,
    },
    profilePhoto: {
        width: 150,        
        height: 150,       
        borderRadius: 75, 
        overflow: 'hidden', 
    },
    userNameText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10
    },
    bottomContainer: {
        marginTop: 30,
        padding: 20,
        justifyContent: 'space-evenly',
    },
    sideContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        paddingLeft: 2,
        marginTop: 15,
        borderLeftWidth: 2,
        borderLeftColor: 'blue'
    },
    sideText: {
        fontSize: 15,
        color: 'blue',
        marginLeft: 10,
    },
    rightColumn: {
        flex: 2,
        height: '100%',
        padding: 20,
        maxWidth: '100%',
        minWidth: 450,
        borderTopRightRadius: 20, // Ensure the right side has radius
        borderBottomRightRadius: 20,
        backgroundColor: 'white',
    },
    informationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '70%',
        padding: 10,
        marginTop: 2,
        marginBottom: 5,
        marginLeft: 20,
        borderRadius: 5,
    },
    editableInput: {
        borderColor: '#000', 
        borderWidth: 1,
        backgroundColor: '#FFF', 
    },
    buttonContainer: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 20,

    },
    button: {
        borderRadius: 16,
        backgroundColor: '#9FCCF5',
        width: 150,
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 10,
        marginRight: 10,
        marginTop: 5,
        marginBottom: 15,
    },
    buttonText: {
        fontSize: 15,
    },
    successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: 10,
        marginBottom: 20,
        textAlign: 'center',
        borderRadius: 5,
        fontSize: 16,
    },
});
export default EmployeeAccountDetails;