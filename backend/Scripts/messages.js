import { getDatabase, ref, push, onValue } from "firebase/database";
import CurrentUser from '../CurrentUser.js';

// current user is the authenticated user that is logged in


// Handles sending and retrieving messages
class Message {
  
  constructor() {
    this.db = getDatabase();
  }

  // Send a message for the current user to specified recipient
  sendMessage(toUID, messageContent) {
    const fromUID = CurrentUser.getUserUID();
    
    // Check if there is an authenticated user
    if (!fromUID) {
      console.error("No authenticated user. Cannot send a message."); // Log error if no authenticated user
      return;
    }
    // Create a message object
    const message = {
      fromUID,
      toUID,
      content: messageContent,
      timestamp: Date.now()
    };

    // Create a reference for the sender and recipient
    const senderRef = ref(this.db, `messages/${fromUID}/sent`);
    const recipientRef = ref(this.db, `messages/${toUID}/received`);

    // Push the message to both the sender's "sent" and recipient's "received" nodes
    push(senderRef, message);
    push(recipientRef, message);
  }

  // Retrieve messages sent to the current user
  getReceivedMessages(callback) {
    const userUID = CurrentUser.getUserUID();

// Check if there is an authenticated user
    if (!userUID) {
      console.error("No authenticated user. Cannot retrieve messages.");
      return;
    }
      // Create a reference for the received messages
    const receivedRef = ref(this.db, `messages/${userUID}/received`);
    
    // Retrieve the received messages and call the callback function with the messages
    onValue(receivedRef, (snapshot) => {
      const messages = snapshot.val();
      callback(messages);
    });
  }

  // Retrieve messages sent by the current user
  getSentMessages(callback) {
    const userUID = CurrentUser.getUserUID();

    // Check if there is an authenticated user
    if (!userUID) {
      console.error("No authenticated user. Cannot retrieve messages.");
      return;
    }

    // Create a reference for the sent messages
    const sentRef = ref(this.db, `messages/${userUID}/sent`);
    
    // Retrieve the sent messages and call the callback function with the messages
    onValue(sentRef, (snapshot) => {
      const messages = snapshot.val();
      callback(messages);
    });
  }
}

// Export an instance of the Message class
const messages = new Message();
export default messages;
