import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BusinessHours from './BusinessHours';
import { getBusinessDetails, saveBusinessLocation } from '../../../backend/api/api';

const { width } = Dimensions.get('window');

const BusinessAccountDetails = () => {
    const navigation = useNavigation();
    const isMobile = width < 768; 

    // State variables to store business details
    const [businessId, setBusinessId] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [businessEmail, setBusinessEmail] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [businessPhoneNum, setBusinessPhoneNum] = useState('');

    // State variable to store business hours for each day of the week
    const [businessHours, setBusinessHours] = useState({
        Monday: { open: '', close: '' },
        Tuesday: { open: '', close: '' },
        Wednesday: { open: '', close: '' },
        Thursday: { open: '', close: '' },
        Friday: { open: '', close: '' },
        Saturday: { open: '', close: '' },
        Sunday: { open: '', close: '' },
    });

    const [isEditing, setIsEditing] = useState(false);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    console.log("BusinessDetails");

    // Function to fetch business details by business email (e.g., test@business.com)
    async function fetchBusinessId() {
        const businessObject = await getBusinessDetails("justRight@gmail.com");

        // Log and set the fetched business details into the state
        console.log("Business ID:", businessObject.business_id); 
        
        setBusinessId(businessObject.business_id);
        setBusinessName(businessObject.business_name);
        setBusinessEmail(businessObject.business_email);
    }   
    
    //Automatically fetch business details when the component is mounted
    useEffect(() => {
        fetchBusinessId();
    }, []);

    // Function to toggle between "edit mode" and "view mode"
    const handleEditToggle = () => {
        setIsEditing(!isEditing); // Toggle the value of isEditing
    };

    // Function to parse the business address into street, city, state, and zip code
    function splitAddress(businessAddress) {
        // Ensure the address is in a correct format, splitting by commas
        const [streetAddress, city, stateZip] = businessAddress.split(',');
    
        // Trim extra spaces from streetAddress and city
        const trimmedStreetAddress = streetAddress.trim();
        const trimmedCity = city.trim();
    
        // Split the state and zip code, assuming they are separated by spaces
        const [state, zipcode] = stateZip.trim().split(/\s+/);
        
        // Return the parsed values
        return {
            streetAddress: trimmedStreetAddress,
            city: trimmedCity,
            state: state,
            zipcode: zipcode
        };
    }

    // Function to save the business location
    async function handleSaveProfile() {
        // Basic validation: Check if required fields are provided
        if (!businessId || !businessName || !businessPhoneNum || !businessAddress) {
            alert("Please fill in all required fields.");
            return; 
        }

        // Validate phone number: Ensure it's a valid 10-digit number
        if (!/^\d{10}$/.test(businessPhoneNum.replace(/\D/g, ''))) {
            alert("Invalid phone number. Please enter a valid 10-digit phone number.");
            return; 
        }

        // Validate business hours: Ensure open/close times are not empty for each day
        const invalidHours = Object.keys(businessHours).some(day => 
            businessHours[day].open === '' || businessHours[day].close === ''
        );
        if (invalidHours) {
            alert("Please specify business hours for each day.");
            return;
        }

        try {
            // Parse the address into individual components
            const parsedAddress = splitAddress(businessAddress);

            // Create an object to send to the backend with all the required business data
            const businessLocationData = {
                business_id: businessId,
                street_address: parsedAddress.streetAddress,
                city: parsedAddress.city,
                state: parsedAddress.state,
                zipcode: parsedAddress.zipcode,
                phone_number: businessPhoneNum,
                Monday: businessHours.Monday,
                Tuesday: businessHours.Tuesday,
                Wednesday: businessHours.Wednesday,
                Thursday: businessHours.Thursday,
                Friday: businessHours.Friday,
                Saturday: businessHours.Saturday,
                Sunday: businessHours.Sunday,
            };

            // Call the save function and pass the businessLocationData to save it in the backend
            const businessLocationId = await saveBusinessLocation(businessLocationData); // Send the updated details to the backend
            
            setIsEditing(false); // Exit edit mode after saving

            // Show the success message indicating the profile was saved
            setShowSuccessMessage(true);
            console.log("Business location saved successfully with ID:", businessLocationId);

            // Hide the message after 3 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000); // 3000 ms = 3 seconds
            //alert("Business profile updated successfully");
        } catch (error) {
            console.error("Error saving business profile:", error);
            alert("Failed to save business profile");
        }
    };

    return (
        <View style={!isMobile ? styles.container : styles.mobileContainer}>

            {/* Left column with profile photo and account overview */}
            <View style={!isMobile ? styles.leftColumn : styles.mobileTopPortion}>
                <View style={styles.topContainer}>
                    <TouchableOpacity style={styles.addIconContainer}>
                        <Ionicons name="add-circle" size={35} color="#9FCCF5" />
                    </TouchableOpacity>

                    <Image
                        resizeMode="contain"
                        source={require('../../assets/images/default_profile.png')}
                        style={styles.profilePhoto}
                    />

                    {/* Display the business name */}
                    <Text style={styles.userNameText}>
                        {businessName || "Loading..."}
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

            {/* Right column with editable business details */}
            <View style={!isMobile ? styles.rightColumn : styles.mobileBottomPortion}>
                <Text style={styles.title}>Business Information</Text>
                
                <View>
                    {/* Display business ID (read-only) */}
                    <View style={styles.informationContainer}>
                        <Text>Business ID:</Text>
                        <TextInput
                            style={styles.input}
                            value= {businessId}
                            readOnly={!isEditing} // Cannot edit ID
                        />
                    </View>
                    {/* Display business name (read-only) */}
                    <View style={styles.informationContainer}>
                        <Text>Business Name:</Text>
                        <TextInput
                            style={styles.input}
                            value={businessName}
                            readOnly={!isEditing} // Cannot edit name
                        />
                    </View>
                    {/* Editable email address */}
                    <View style={styles.informationContainer}>
                        <Text>Email Address:</Text>
                        <TextInput
                            style={styles.input}
                            value={businessEmail}
                            onChangeText={setBusinessEmail} // Update email state on change if editable is an option
                            readOnly={isEditing} // Not sure if this should be editable
                        />
                    </View>
                    {/* Editable address */}
                    <View style={styles.informationContainer}>
                        <Text>Address:</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.editableInput]}
                            placeholder='Enter business address'
                            placeholderTextColor= 'grey'
                            value={businessAddress}
                            onChangeText={setBusinessAddress} // Update address state on change
                            readOnly={!isEditing} // Only editable if in edit mode
                        />
                    </View>
                    {/* Editable phone number */}
                    <View style={styles.informationContainer}>
                        <Text>Phone Number:</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.editableInput]}
                            placeholder='Enter business phone number'
                            placeholderTextColor= 'grey'
                            value={businessPhoneNum}
                            onChangeText={setBusinessPhoneNum} // Update phone number state on change
                            readOnly={!isEditing} // Only editable if in edit mode
                        />
                    </View>
                    {/* Business hours, passed as a prop to a BusinessHours component */}
                    <BusinessHours 
                        businessHours={businessHours} // Pass the business hours to the component
                        isEditing={isEditing} // Pass the edit mode to control if fields are editable
                        setBusinessHours={setBusinessHours} // Pass the setter to allow updates from child component
                    />

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
export default BusinessAccountDetails;