import express from 'express';
import { getAuth, signOut } from "firebase/auth";
import { changeUserPassword, LoginEmployee } from '../Scripts/authScript.js';

const router = express.Router();

// Route to change the Firebase password
router.post('/changePassword', async (req, res) => {
    const { employeeId, currentPassword, newPassword } = req.body;

    if (!employeeId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Employee ID, current password, and new password are required' });
    }

    try {
        const result = await changeUserPassword(employeeId, currentPassword, newPassword);
        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { employeeString, password } = req.body;

    console.log('Login request received:', employeeString, password);

    try {
        const employee = await LoginEmployee(employeeString, password);
        res.status(200).json({ success: true, employee });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// logout route
router.post('/logout', async (req, res) => {
    console.log('Received logout request');
    console.log('Request body:', req.body);

    // log out should clear all account data and return to the login screen

    const auth = getAuth();
    signOut(auth).then(() => {
    // Sign-out successful.
    }).catch((error) => {
    // An error happened.
    });

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

export default router;