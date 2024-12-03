// messages.js
import { getDatabase, ref, push, get, update, child } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

class Messaging {
  constructor() {
    this.db = getDatabase();
  }

  // Create a new conversation
  async createConversation(participantIds) {
    if (!participantIds || participantIds.length < 2) {
      throw new Error('At least two participants are required to create a conversation.');
    }

    const conversationId = uuidv4(); // Generate a unique conversation ID

    // Create the conversation object
    const conversation = {
      id: conversationId,
      participants: participantIds,
      lastUpdated: Date.now(),
    };

    const conversationRef = ref(this.db, `conversations/${conversationId}`); // Reference to the conversation in Firebase

    // Add the conversation to the database
    try {
      await update(conversationRef, conversation);
      console.log('Conversation created successfully:', conversation);
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Send a message in a specific conversation
  async sendMessage(conversationId, senderId, content) {
    if (!content || !conversationId || !senderId) {
      throw new Error('Missing required fields: conversationId, senderId, or content');
    }
    // Create the message object
    const message = {
      senderId,
      content,
      timestamp: Date.now(),
    };

    const messagesRef = ref(this.db, `messages/${conversationId}`); // Reference to the messages in Firebase
    const conversationRef = ref(this.db, `conversations/${conversationId}`);// Reference to the conversation in Firebase

    // Add the message to the database
    try {
      await push(messagesRef, message);
      // Update the conversation's lastUpdated timestamp
      await update(conversationRef, { lastUpdated: Date.now() });
      console.log('Message sent successfully:', message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Retrieve messages for a specific conversation
  async getMessages(conversationId) {
    const messagesRef = ref(this.db, `messages/${conversationId}`);

    try {
      const snapshot = await get(messagesRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      console.error('Error retrieving messages:', error);
      throw error;
    }
  }

  // Retrieve conversations for a specific user
  async getUserConversations(userId) {
    const conversationsRef = ref(this.db, 'conversations');

    try {
      const snapshot = await get(conversationsRef);

      if (snapshot.exists()) {
        const allConversations = snapshot.val();
        // Filter conversations where the user is a participant
        const userConversations = Object.values(allConversations).filter((conversation) =>
          conversation.participants.includes(userId)
        );

        return userConversations;
      }

      return [];
    } catch (error) {
      console.error('Error retrieving conversations:', error);
      throw error;
    }
  }
}

const messagingInstance = new Messaging(); // Create a new instance of the Messaging class
export default messagingInstance;
