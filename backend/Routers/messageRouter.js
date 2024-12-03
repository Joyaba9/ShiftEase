import express from 'express';
import messagingInstance from '../Scripts/messages.js';
import getClient from '../db/dbClient.js'; // Import your getClient function

const router = express.Router();

// Create a new conversation
router.post('/conversations', async (req, res) => {
  const { participants } = req.body;

  try {
    const conversationId = await messagingInstance.createConversation(participants);
    res.status(201).json({ conversationId });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await messagingInstance.getUserConversations(userId);
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;
  const { senderId, content } = req.body;

  try {
    await messagingInstance.sendMessage(conversationId, senderId, content);
    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await messagingInstance.getMessages(conversationId);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business ID from Firebase UID
router.get('/businessId/:uid', async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: 'UID is required' });
  }

  let client;

  try {
    client = await getClient(); // Get a new database client
    console.log(`Fetching business ID for UID: ${uid}`);

    await client.connect(); // Connect to the database

    const query = `SELECT business_id FROM employees WHERE uid = $1`;
    const result = await client.query(query, [uid]);

    if (result.rows.length === 0) {
      console.error(`No employee found for UID: ${uid}`);
      return res.status(404).json({ error: 'Employee not found' });
    }

    const businessId = result.rows[0].business_id;
    console.log(`Found business ID: ${businessId}`);
    res.json({ businessId });
  } catch (error) {
    console.error('Error fetching business ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.end(); // Ensure the client is properly closed
      console.log('Database connection closed');
    }
  }
});

export default router;
