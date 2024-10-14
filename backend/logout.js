import express from 'express';
import getClient from './dbClient.js';
import { getAuth, signOut } from "firebase/auth";

const router = express.Router();

// POST logout
router.post('/', async (req, res) => {
    console.log('Received logout request');
    console.log('Request body:', req.body);

    // log out should clear all account data and return to the login screen

    const client = getClient();
    if (client) {
        try {
            await client.end();
            console.log('Database client connection closed');
        } catch (err) {
            console.error('Error closing database client connection:', err);
        }
    }

    return res.status(200).json({ message: 'Logged out successfully' });
});

const auth = getAuth();
signOut(auth).then(() => {
  // Sign-out successful.
}).catch((error) => {
  // An error happened.
});

export default router;