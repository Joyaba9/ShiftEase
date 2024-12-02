import express, { json } from 'express';
import messages from '../Scripts/messages.js';
import CurrentUser from '../CurrentUser.js';

const router = express.Router();

console.log('messageRouter.js loaded');


// Middleware to check if a user is authenticated via CurrentUser
const authenticate = (req, res, next) => {
  const user = CurrentUser.getUserInfo(); // Get user info from CurrentUser class
  console.log('Authenticated user info:', user); // Log user info

  if (user && user.uid) {
    console.log('User authenticated:', user.uid); // Log user UID
    req.user = user; // Store user info in the request object
    next();
  } else {
    console.log('Unauthorized access attempt: No user info found'); // Log unauthorized access
    res.status(401).send('Unauthorized');
  }
};

// Route to send a message
router.post('/send', authenticate, (req, res) => {
  const { toUID, messageContent } = req.body;
  const fromUID = req.user.uid; // Get the UID of the authenticated user

  console.log('Sending message from UID:', fromUID, 'to UID:', toUID); // Log sender and recipient UIDs
  console.log('Message content:', messageContent); // Log message content

  try {
    messages.sendMessage(toUID, messageContent); //
    console.log('Message sent successfully from', fromUID, 'to', toUID); // Log success
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Error sending message:', err); // Log error if sending message fails
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Route to retrieve received messages
router.get('/received', authenticate, (req, res) => {
  const userUID = req.user.uid; // Get the UID of the authenticated user

  console.log('Fetching received messages for UID:', userUID); // Log UID for which messages are being fetched

  messages.getReceivedMessages((receivedMessages) => {
    if (receivedMessages) {
      console.log('Received messages found for UID:', userUID); // Log found messages
      res.status(200).json(receivedMessages);
    } else {
      console.log('No received messages found for UID:', userUID); // Log no messages found
      res.status(404).json({ message: 'No received messages found' });
    }
  });
});

// Route to retrieve sent messages
router.get('/sent', authenticate, (req, res) => {
  const userUID = req.user.uid; // Get the UID of the authenticated user

  console.log('Fetching sent messages for UID:', userUID); // Log UID for which messages are being fetched

  messages.getSentMessages((sentMessages) => {
    if (sentMessages) {
      console.log('Sent messages found for UID:', userUID); // Log found messages
      res.status(200).json(sentMessages);
    } else {
      console.log('No sent messages found for UID:', userUID); // Log no messages found
      res.status(404).json({ message: 'No sent messages found' });
    }
  });
});

export default router;
