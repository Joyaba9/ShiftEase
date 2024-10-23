import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback, Pressable} from 'react-native';
import { useSelector } from 'react-redux';
import { mockChats, mockMessages } from './MockMessagesData';
import { Hoverable } from 'react-native-web-hover';

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
    const [selectedContact, setSelectedContact] = useState([]); // To hold the selected contact

    const [selectedButton, setSelectedButton] = useState(null);
    const [showLeftBottomContainer2, setShowLeftBottomContainer2] = useState(false);

    const [showCenterColumn2, setShowCenterColumn2] = useState(false);
    const [inputHeight, setInputHeight] = useState(45);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [activeContact, setActiveContact] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    
    
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

        if (selectedContact.includes(contact)) {
            // Remove the contact if it's already selected
            setSelectedContact(prevSelected => prevSelected.filter(item => item !== contact));
        } else {
            // Add the contact if it's not already selected
            setSelectedContact(prevSelected => [...prevSelected, contact]);
        }

        setQuery(''); // Clear the search query
    };

    // Handle removing a contact when the "X" button is pressed
    const handleRemoveContact = (contact) => {
        setSelectedContact(prevSelected => prevSelected.filter(item => item !== contact));
    };

    // Handle sending a message
    const handleSendMessage = () => {
        if (message.trim() && selectedContact.length > 0) {
            const newMessage = {
                id: messages.length + 1,
                sender: "You",
                text: message,
                // Format timestamp to only show hours and minutes
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
            };
            setMessages(prevMessages => [...prevMessages, newMessage]); // Add new message to the list
            setMessage(''); // Clear the message input after sending
            setInputHeight(45); // Reset the input height
            setShowLeftBottomContainer2(true)

            setActiveContact(prevActive => [
                ...prevActive,
                ...selectedContact.filter(contact => !prevActive.includes(contact)),
            ]);

            setSelectedContact([]);

            // Set Inbox as the selected button when a message is sent
            setSelectedButton('inbox');
        }
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

                    {!showLeftBottomContainer2 ? (
                        /* List of Chats */
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
                    ) : (
                        <View style={styles.leftBottomContainer2}>
                            <FlatList
                                data={mockChats} // Use mock chat data
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => {
                                    return (
                                        <TouchableOpacity 
                                            style={[styles.chatPreviewContainer, isHovered && styles.hoveredChat]}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                        >
                                            <View style={styles.chatPreviewTopContainer}> 
                                                <Text style={styles.contactName}>{item.contact}</Text>
                                                <Text style={styles.timestamp}>{item.timestamp}</Text>
                                            </View>
                                            <Text style={styles.messagePreview}>{item.lastMessage}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    )}
                </View>
                
                {/* Conditionally display centerColumn1 or centerColumn2 */}
                {!showCenterColumn2 ? (
                    <View style={styles.centerColumn}>
                        <View>
                            <Image
                                resizeMode="contain"
                                source={require('../../assets/images/send_bubble.png')}
                                style={styles.sendBubbleImg}
                            />
                        </View>

                        <Text style={styles.noMessagesText}>No Chats Selected</Text> 
                    </View> 
                ) : (
                    // Display centerColumn2 
                    <View style={styles.centerColumn2}>
                        {activeContact.length > 0 ? (
                                <View style={styles.contactTopMessageContainer}>
                                    <Text style={styles.toText}>
                                        {activeContact.map((contact, index) => (
                                            <Text key={index} style={styles.activeContactText}>
                                                {contact}
                                                {index < activeContact.length - 1 && ", "}
                                            </Text>
                                        ))}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.topMessageContainer}>
                                    <Text style={styles.toText}>
                                        To:{" "}
                                            {selectedContact.map((contact, index) => (
                                            <View key={index} style={styles.selectedContactContainer}>
                                                <Text style={styles.selectedContactText}>{contact}</Text>
                                                <TouchableOpacity onPress={() => handleRemoveContact(contact)}>
                                                    <Text style={styles.removeContactText}>X</Text> {/* "X" button to remove contact */}
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </Text>
                                    <TextInput
                                        style={styles.searchInput}
                                        value={query}
                                        onChangeText={text => setQuery(text)}
                                        onFocus={() => setIsTextInputFocused(true)} // Show FlatList when focused
                                        onBlur={() => setTimeout(() => setIsTextInputFocused(false), 200)}
                                    />
                                </View>
                            )}
                        
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
                        <View style={styles.conversationContainer}>
                            <FlatList
                                data={messages} // Use mock message data
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={item.sender === "You" ? styles.sentMessage : styles.receivedMessage}>
                                        <Text style={styles.messageText}>{item.text}</Text>
                                        
                                        <Text style={styles.timestamp}>{item.timestamp}</Text>
                                    </View>
                                )}
                                inverted
                            />
                        </View>
                        <View style={styles.wholeMessageContainer}>
                            <View style={[styles.messageContainer, { height: inputHeight }]}>
                                <TextInput
                                    style={[styles.messageInput, { height: inputHeight }]}
                                    placeholder='Message'
                                    placeholderTextColor="grey"
                                    multiline // Allows multiline input
                                    value={message}
                                    onChangeText={setMessage}
                                    onContentSizeChange={(event) => {
                                        setInputHeight(Math.max(45, event.nativeEvent.contentSize.height)); // Adjust height dynamically
                                    }}
                                />
                            </View>
                            <TouchableOpacity onPress={handleSendMessage}>
                                <Image          
                                    resizeMode="contain"
                                    source={require('../../assets/images/send.png')}
                                    style={styles.sendButton}
                                />
                            </TouchableOpacity>   
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
        borderColor: '#E4E6EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
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
    //Left Bottom Container Styles
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
    messagesText: {
        fontSize: 20, 
        marginTop: 20,
        color: 'grey'
    },
    //Left Bottom Container 2 Styles
    leftBottomContainer2: {
        flex: 3,
        //justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: '#E4E6EB'
    },
    chatPreviewContainer: {
        width: 330,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E6EB'
    },
    hoveredChat: {
        backgroundColor: '#f0f0f0', // Background color on hover
    },
    chatPreviewTopContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    contactName: {
        fontSize: 18,
        fontWeight: 'semibold'
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
    },
    messagePreview: {
        fontSize: 14,
        color: '#555',
    },
    //Center Column Styles
    centerColumn: {
        flex: 2,
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBubbleImg: {
        width: 300,
        height: 300,
        resizeMode: 'cover',
    },
    noMessagesText: {
        fontSize: 30,
        marginTop: 40,
    },
    //Center Column 2 Styles
    centerColumn2: {
        flex: 2,
        height: height,
        alignItems: 'center',
    },
    toText: {
        fontSize: 20,
        marginRight: 10,
    },
    selectedContactContainer: {
        backgroundColor: '#AFD9FF',
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        padding: 8,
        borderRadius: 10
    },
    selectedContactText: {
        paddingRight: 10
    },
    removeContactText: {
        fontSize: 16,
        color: '#066ACE', 
    },
    topMessageContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: '#E4E6EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
    },
    contactTopMessageContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: '#E4E6EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
    },
    conversationContainer: {
        flex: 1,
        width: '100%', 
        borderWidth: 2,
        borderColor: 'red',
        padding: 10,
    },
    sentMessage: {
        width: 'auto',
        alignSelf: 'flex-end',
    },
    messageText: {
        fontSize: 18,
        color: 'white',
        backgroundColor: '#1588FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 3,
        borderRadius: 30,
    },
    wholeMessageContainer: {
        //flex: 1,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'purple',
    },
    messageContainer: {
        backgroundColor: '#E4E6EB',
        borderRadius: 25,
        paddingHorizontal: 10,
        minHeight: 45,
        width: '90%', 
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: 'green'
    },
    messageInput: {
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 5, 
        color: 'black',
        fontSize: 16,
        alignSelf: 'flex-end',
        textAlignVertical: 'top',
        minHeight: 45,
        height: 'auto',
    },
    sendButton: {
        width: 30,
        height: 30,
        marginLeft: 10,
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
