// MessagesPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import { useSelector } from 'react-redux';
import { fetchEmployees } from '../../../backend/api/employeeApi';
import { user } from 'pg/lib/defaults';
import currentuser from '../../../backend/CurrentUser';

import NavBar from '../../components/NavBar';

const { width, height } = Dimensions.get('window');
const MessagesPage = () => {
  const loggedInUser = useSelector((state) => state.business.businessInfo);
  //const userId = loggedInUser?.firebaseUser?.uid;

  const loggedInUser2 = useSelector((state) => state.user.loggedInUser);

  const userId = loggedInUser2?.firebaseUser?.uid;

  console.log('loggedInUser:', userId);

  const businessInfoC = useSelector((state) => state.business.businessInfo);
  const loggedInUserC = useSelector((state) => state.user.loggedInUser);
  const conditional = businessInfoC?.business ? 'Business' : loggedInUserC?.employee ? 'Employee' : 'Account';

  const [businessId, setBusinessId] = useState(loggedInUser?.business?.business_id || null);
  const [chatState, setChatState] = useState({
    query: '',
    employees: [],
    filteredEmployees: [],
    selectedContact: [],
    messages: [],
  });
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showCenterColumn2, setShowCenterColumn2] = useState(false);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(45);

  const messagesListRef = useRef(null);

  const getBusinessIdFromEmployee = useCallback(async () => {
    if (!businessId && userId) {
      console.log('Attempting to fetch business ID for userId:', userId);
      try {
        const response = await fetch(`http://localhost:5050/api/messages/businessId/${userId}`);
        const data = await response.json();

        if (response.ok && data.businessId) {
          console.log('Successfully fetched business ID:', data.businessId);
          setBusinessId(data.businessId);
        } else {
          console.error('Failed to retrieve business_id for the logged-in employee. Response:', data);
        }
      } catch (error) {
        console.error('Error fetching business_id from employee:', error);
      }
    }
  }, [businessId, userId]);


 const getEmployees = useCallback(async () => {
    if (!businessId) {
      console.error('Business ID is undefined. Cannot fetch employees.');
      return;
    }
    try {
      console.log('Fetching employees for business ID:', businessId);
      const data = await fetchEmployees(businessId);
      setChatState((prevState) => ({
        ...prevState,
        employees: data,
        filteredEmployees: data,
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, [businessId]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5050/api/messages/conversations/${userId}`
      );
      const data = await response.json();
      const sortedConversations = data


      
      .map((conversation) => ({
        ...conversation,
        lastMessageTimestamp: conversation.lastMessageTimestamp || 0, // Default to 0 if missing
      }))
      .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp); // Sort by most recent

      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (businessId && userId) {
      fetchConversations();
      getEmployees();
    }
  }, [businessId, userId, fetchConversations, getEmployees]);

  // Trigger fetching of businessId if needed
  useEffect(() => {
    if (!businessId && userId) {
      getBusinessIdFromEmployee();
    }
  }, [businessId, userId, getBusinessIdFromEmployee]);

  // Filter employees based on the search query
  useEffect(() => {
    setChatState((prevState) => ({
      ...prevState,
      filteredEmployees: prevState.employees.filter((employee) => {
        const fullName = `${employee?.f_name ?? ''} ${employee?.l_name ?? ''}`.toLowerCase();
        return fullName.includes(prevState.query.toLowerCase());
      }),
    }));
  }, [chatState.query, chatState.employees]);

  // When the message icon is pressed, show the employee list and center column
  const handleMessageIconPress = () => {
    setShowNewChat(true); // Show the new chat UI
    setShowCenterColumn2(true); // Show centerColumn2
    getEmployees(); // Fetch employees on icon press
  };

  // Update the search query in the state
  const handleQueryChange = (query) => {
    setChatState((prevState) => ({ ...prevState, query }));
  };

  const handleContactSelect = async (contact) => {
    // First, check if a conversation exists with this contact
    const existingConversation = conversations.find((conv) => {
      // Check if the participants are exactly the two users
      if (conv.participants.length !== 2) return false;
      return conv.participants.includes(userId) && conv.participants.includes(contact.uid);
    });

    if (existingConversation) {
      // If conversation exists, load it
      await handleChatPress(existingConversation.id);
      setShowNewChat(false);
      setShowCenterColumn2(true);
    } else {
      // If conversation doesn't exist, set selected contact and proceed
      setChatState((prevState) => ({
        ...prevState,
        selectedContact: [contact],
        query: '',
        messages: [],
      }));
      setIsTextInputFocused(false);
      setShowNewChat(false);
      setShowCenterColumn2(true);
      setSelectedChat(null);
      setCurrentConversationId(null);
    }
  };

  const handleRemoveContact = (contact) => {
    setChatState((prevState) => ({
      ...prevState,
      selectedContact: prevState.selectedContact.filter(
        (item) => item.uid !== contact.uid
      ),
    }));
  };

  const handleChatPress = async (conversationId) => {
    setSelectedChat(conversationId);
    setCurrentConversationId(conversationId);
    setShowNewChat(false);
    setShowCenterColumn2(true);

    try {
      const response = await fetch(
        `http://localhost:5050/api/messages/conversations/${conversationId}/messages`
      );
      const data = await response.json();
      const sortedMessages = Object.values(data).sort(
        (a, b) => a.timestamp - b.timestamp
      );
      setChatState((prevState) => ({
        ...prevState,
        messages: sortedMessages,
        selectedContact: [],
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    let conversationId = currentConversationId;

    if (!conversationId && chatState.selectedContact.length > 0) {
      const participants = [userId, chatState.selectedContact[0].uid];
      try {
        const response = await fetch(
          'http://localhost:5050/api/messages/conversations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ participants }),
          }
        );
        const data = await response.json();
        conversationId = data.conversationId;
        setCurrentConversationId(conversationId);

        const newConversation = {
          id: conversationId,
          participants,
          lastUpdated: Date.now(),
          lastMessage: message, // Store the last message content
          lastMessageTimestamp: Date.now(), // Store the timestamp of the last message
        };
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedChat(conversationId); // Update selectedChat
        setShowNewChat(false);
      } catch (error) {
        console.error('Error creating conversation:', error);
        return;
      }
    }

    try {
      await fetch(
        `http://localhost:5050/api/messages/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderId: userId,
            content: message,
          }),
        }
      );

      const newMessage = {
        id: Date.now().toString(),
        senderId: userId,
        content: message,
        timestamp: Date.now(),
      };
      setChatState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, newMessage],
      }));
      setMessage('');

    

      // Update last message info in conversations
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: message,
                lastUpdated: Date.now(),
                lastMessageTimestamp: Date.now(),
              }
            : conv
        )
      );

      // messagesListRef.current.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <NavBar homeRoute={conditional} showLogout={false}/>

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
                placeholder="Search messages..."
                placeholderTextColor="grey"
                onChangeText={(text) => {
                  // Implement search functionality if needed
                }}
              />
            </View>
          </View>

          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const otherParticipantId = item.participants.find(
                (id) => id !== userId
              );
              const otherParticipant = chatState.employees.find(
                (emp) => emp.uid === otherParticipantId
              );
              const otherParticipantName = otherParticipant
                ? `${otherParticipant.f_name} ${otherParticipant.l_name}`
                : 'Unknown';

              // Format last message time
              const lastMessageTime = item.lastMessageTimestamp
                ? new Date(item.lastMessageTimestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                : '';

              return (
                <TouchableOpacity
                  style={[
                    styles.chatItem,
                    selectedChat === item.id && styles.selectedChat,
                  ]}
                  onPress={() => handleChatPress(item.id)}
                >
                  <View style={styles.chatPreviewTopContainer}>
                    <Text style={styles.chatItemText}>{otherParticipantName}</Text>
                    <Text style={styles.timestamp}>{lastMessageTime}</Text>
                  </View>
                  <Text style={styles.messagePreview}>{item.lastMessage || ''}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Center Column */}
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
          <View style={styles.centerColumn2}>
            {showNewChat ? (
              <View style={styles.newChatContainer}>
                <View style={styles.topMessageContainer}>
                  <Text style={styles.toText}>To:</Text>
                  {chatState.selectedContact.map((contact) => (
                    <View key={contact.uid} style={styles.selectedContactContainer}>
                      <Text style={styles.selectedContactText}>
                        {`${contact.f_name} ${contact.l_name}`}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemoveContact(contact)}>
                        <Text style={styles.removeContactText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Type a name..."
                    value={chatState.query}
                    onChangeText={handleQueryChange}
                    onFocus={() => setIsTextInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsTextInputFocused(false), 200)}
                  />
                </View>
                {isTextInputFocused && (
                  <FlatList
                    data={chatState.filteredEmployees}
                    keyExtractor={(item) => item.uid}
                    renderItem={({ item }) => (
                      <Pressable
                        style={styles.contactItem}
                        onPress={() => handleContactSelect(item)}
                      >
                        <Text style={styles.employeeName}>
                          {`${item.f_name} ${item.l_name}`}
                        </Text>
                      </Pressable>
                    )}
                    style={styles.flatListStyle}
                  />
                )}
              </View>
            ) : (
              <>
                {/* Messages */}
                <View style={styles.conversationContainer}>
                  <FlatList
                  ref={(ref) => (messagesListRef.current = ref)}
                    data={chatState.messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => {
                      const showDateHeader =
                        index === 0 ||
                        new Date(item.timestamp).toDateString() !==
                          new Date(chatState.messages[index - 1].timestamp).toDateString();

                      return (
                        <View>
                          {showDateHeader && (
                            <Text style={styles.dateHeader}>
                              {new Date(item.timestamp).toDateString()}
                            </Text>
                          )}
                          <View
                            style={[
                              styles.messageBubble,
                              item.senderId === userId
                                ? styles.sentMessage
                                : styles.receivedMessage,
                            ]}
                          >
                            <Text>{item.content}</Text>
                            <Text style={styles.messageTimestamp}>
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </Text>
                          </View>
                        </View>
                      );
                    }}
                 
                  />
                </View>

                {/* Input Section */}
                {(selectedChat || chatState.selectedContact.length > 0) && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.messageInput}
                      placeholder="Message"
                      value={message}
                      onChangeText={setMessage}
                    />
                    <TouchableOpacity onPress={handleSendMessage}>
                      <Image
                        source={require('../../assets/images/send.png')}
                        style={styles.sendButton}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 50 },
  wholeContainer: { flexDirection: 'row', height: '100%' },
  leftColumn: { width: '30%', padding: 10, borderRightWidth: 1, borderColor: '#ccc' },
  leftTopContainer: {},
  leftTopInnerTopContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  chatHeader: { fontSize: 25, fontWeight: 'bold' },
  messageIcon: { width: 25, height: 25 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4E6EB',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginVertical: 10,
    height: 45,
  },
  searchIcon: { width: 25, height: 25, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  chatItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  selectedChat: { backgroundColor: '#d1e7ff' },
  chatItemText: { fontSize: 18 },
  chatPreviewTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timestamp: { fontSize: 12, color: '#888' },
  messagePreview: { fontSize: 14, color: '#555' },
  centerColumn: { flex: 1, padding: 10, alignItems: 'center', justifyContent: 'center' },
  sendBubbleImg: { width: 300, height: 300 },
  noMessagesText: { fontSize: 30, marginTop: 20 },
  centerColumn2: { flex: 1, padding: 10 },
  newChatContainer: {},
  toText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  topMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#AFD9FF',
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  selectedContactText: { paddingRight: 5 },
  removeContactText: { color: '#066ACE', fontWeight: 'bold' },
  contactItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  employeeName: { fontSize: 18 },
  flatListStyle: {
    maxHeight: 200,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    zIndex: 2,
  },
  conversationContainer: { flex: 1 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  sentMessage: { alignSelf: 'flex-end', backgroundColor: '#d1f0ff' },
  receivedMessage: { alignSelf: 'flex-start', backgroundColor: '#f1f1f1' },
  messageTimestamp: { fontSize: 10, color: '#555', marginTop: 5 },
  dateHeader: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginVertical: 10,
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 60 },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 20,
  },
  sendButton: { width: 30, height: 30, marginLeft: 10 },
});

export default MessagesPage;
