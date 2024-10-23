import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback, Pressable} from 'react-native';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const MessagesPage = () => {

    // Get businessId from Redux store
    const loggedInUser = useSelector((state) => state.business.businessInfo);
    const businessId = loggedInUser?.business?.business_id;
    
    console.log(businessId)


    const [query, setQuery] = useState(''); // To hold the search query
    const [employees, setEmployees] = useState([]); // To hold the list of employees
    const [filteredEmployees, setFilteredEmployees] = useState([]); // To hold the filtered list of employees based on search query
    const [isTextInputFocused, setIsTextInputFocused] = useState(false);
    const [selectedContact, setSelectedContact] = useState(''); // To hold the selected contact

    const [selectedButton, setSelectedButton] = useState(null);
    const [showCenterColumn2, setShowCenterColumn2] = useState(false);
    
    const handleButtonPress = (button) => {
        setSelectedButton(button); // Set the selected button on press
    };

    const handleMessageIconPress = async () => {
        setShowCenterColumn2(true); // Show centerColumn2

      try {
        const response = await fetch(`http://localhost:5050/api/employee/fetchAll/${businessId}`);

        if (response.ok) {
            // Fetch employees when the message icon is pressed
            const fetchedEmployees = await response.json();
            setEmployees(fetchedEmployees);
            setFilteredEmployees(fetchedEmployees); // Initially, all employees are shown
        } else {
            console.error('Failed to fetch employees:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
  
    // Update the filtered list of employees when the search query changes
    useEffect(() => {
        setFilteredEmployees(
            employees.filter(employee => {
                const fullName = `${employee?.f_name ?? ''} ${employee?.l_name ?? ''}`.toLowerCase();
                return fullName.includes(query.toLowerCase());
            })
        );
    }, [query, employees]);
  
    const handleContactSelect = (contact) => {
        console.log('Contact selected:', contact);
        setSelectedContact(contact); // Set the selected contact
        setQuery(''); // Clear the search query
    };

    return (
        <View style={styles.container}>
            <View style={styles.wholeContainer}>
                {/* Left Column */}
                <View style={styles.leftColumn}>
                    <View style={styles.leftTopContainer}>
                        <View style={styles.leftTopInnerTopContainer}>
                            <Text style={styles.chatHeader}>Chats</Text>
                            <TouchableOpacity onPress={handleMessageIconPress}>
                                <Image
                                    resizeMode="contain"
                                    source={require('../../assets/images/create_message_icon.png')}
                                    style={styles.messageIcon}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                             <TouchableOpacity>
                                <Image
                                    resizeMode="contain"
                                    source={require('../../assets/images/search_icon.png')}
                                    style={styles.searchIcon}
                                />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search contacts..."
                                placeholderTextColor="grey"
                            />
                        </View>

                        <View style={styles.topButtonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, selectedButton === 'inbox' && styles.selectedButton]}
                                onPress={() => handleButtonPress('inbox')}
                            >
                                <Text style={[styles.buttonText, selectedButton === 'inbox' && styles.selectedButtonText]}>Inbox</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.biggerButton, selectedButton === 'managers' && styles.selectedButton]}
                                onPress={() => handleButtonPress('managers')}
                            >
                                <Text style={[styles.buttonText, selectedButton === 'managers' && styles.selectedButtonText]}>Managers</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.biggerButton, selectedButton === 'coworkers' && styles.selectedButton]}
                                onPress={() => handleButtonPress('coworkers')}
                            >
                                <Text style={[styles.buttonText, selectedButton === 'coworkers' && styles.selectedButtonText]}>Coworkers</Text>
                            </TouchableOpacity>
                        </View>    
                    </View>

                    {/* List of Chats */}
                    <View style={styles.leftBottomContainer}>
                        <View style={styles.messageBubbleContainer}>
                            <Image
                                resizeMode="contain"
                                source={require('../../assets/images/chat_bubble.png')}
                                style={styles.messageBubbleImg}
                            />
                        </View>

                        <Text style={styles.noMessagesText}>No Messages</Text>
                        <Text style={styles.messagesText}>New messages will appear here.</Text>
                    </View>
                </View>
                
                {/* Conditionally display centerColumn1 or centerColumn2 */}
                {!showCenterColumn2 ? (
                    <View style={styles.centerColumn}>
                        <View style={styles.sendBubbleContainer}>
                            <Image
                                resizeMode="contain"
                                source={require('../../assets/images/send_bubble.png')}
                                style={styles.sendBubbleImg}
                            />
                        </View>

                        <Text style={styles.noMessagesText}>No Chats Selected</Text> 
                    </View> 
                ) : (
                    <View style={styles.centerColumn2}>
                        <View style={styles.topMessageContainer}>
                            <Text style={styles.toText}>To: {selectedContact}</Text> 

                            <TextInput
                                style={styles.searchInput}
                                value={query}
                                onChangeText={text => setQuery(text)}
                                onFocus={() => setIsTextInputFocused(true)} // Show FlatList when focused
                                onBlur={() => setTimeout(() => setIsTextInputFocused(false), 200)}
                            />
                        </View>
                        
                        <View style={styles.wholeContactContainer}>
                            {isTextInputFocused && (
                                <FlatList
                                data={filteredEmployees}
                                keyExtractor={item => item?.emp_id?.toString()}
                                renderItem={({ item }) => {
                                    console.log("Rendering employee:", `${item.f_name} ${item.l_name}`);
                                    return (
                                        <Pressable
                                            onPress={() => {
                                            console.log("Employee clicked:", `${item.f_name} ${item.l_name}`);
                                            handleContactSelect(`${item.f_name} ${item.l_name}`);
                                            }}
                                            style={styles.contactContainer}
                                        >
                                            <Text style={styles.employeeName}>{`${item.f_name} ${item.l_name}`}</Text>
                                        </Pressable>
                                    );
                                }}
                                style={styles.flatListStyle}
                                />
                            )}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      paddingBottom: 20,
      height: height,
      minWidth: 800,
    },
    wholeContainer: {
        flexDirection: 'row',
        width: width,  
        height: height,
    },
    //Left Column Styles
    leftColumn: {
        flex: 1,
        flexDirection: 'column',
        height: height,
        borderWidth: 2,
        borderColor: '#E4E6EB'
    },
    leftTopContainer: {
        flex: 1,
    },
    leftTopInnerTopContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15
    },
    chatHeader: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    messageIcon: {
        width: 25,
        height: 25,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E4E6EB',
        borderRadius: 25,
        paddingHorizontal: 10,
        marginVertical: 10,
        width: '90%', 
        height: 45,
        alignSelf: 'center',
    },
    searchIcon: {
        width: 25,
        height: 25,
        marginRight: 10, 
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 5, 
        color: 'black',
        fontSize: 16,
    },
    topButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20
    },
    button: {
        width: 80,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    biggerButton: {
        width: 115,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        fontSize: 18,
    },
    selectedButton: {
        backgroundColor: '#AFD9FF', 
    },
    selectedButtonText: {
        color: '#066ACE', 
    },
    leftBottomContainer: {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBubbleContainer: {
        width: 300, // The container width
        height: 210, // The height you want to display
        overflow: 'hidden',
    },
    messageBubbleImg: {
        width: 300,
        height: 300,
        resizeMode: 'cover',
    },
    noMessagesText: {
        fontSize: 30,
        marginTop: 40,
    },
    messagesText: {
        fontSize: 20, 
        marginTop: 20,
        color: 'grey'
    },
    //Center Column Styles
    centerColumn: {
        flex: 2,
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
        // borderWidth: 2,
        // borderColor: 'blue'
    },
    centerColumn2: {
        flex: 2,
        height: height,
        alignItems: 'center',
        //justifyContent: 'center',
        // borderWidth: 2,
        // borderColor: 'blue'
    },
    toText: {
        fontSize: 20,
        marginRight: 10,
    },
    topMessageContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: '#E4E6EB'
    },
    sendBubbleContainer: {

    },
    sendBubbleImg: {
        width: 300,
        height: 300,
        resizeMode: 'cover',
    },
    //Flat List Styles
    wholeContactContainer: {
        width: '90%',
    },
    flatListStyle: {
        maxHeight: 200, // Limit the height of the list
        marginLeft: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        zIndex: 2
    },
    contactContainer: {
        //width: '100%',
        borderBottomWidth: 2,
        borderBottomColor: 'gray',
        paddingVertical: 10,
        zIndex: 1
    },
    employeeName: {
        fontSize: 18
    },
    
});

export default MessagesPage;
