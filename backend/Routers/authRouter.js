import express from 'express';
//import { getAuth, signOut } from "firebase/auth";
import getClient from '../db/dbClient.js';
import { changeUserPassword, LoginBusiness, LoginEmployee } from '../Scripts/authScript.js';

const router = express.Router();

// Route to change an employee's Firebase password
router.post('/changePassword', async (req, res) => {
    const { employeeId, currentPassword, newPassword } = req.body;

    // Check for missing fields in the request body to prevent undefined values in logic
    if (!employeeId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Employee ID, current password, and new password are required' });
    }

    try {
        // Call the function to change the user's password and capture the result
        const result = await changeUserPassword(employeeId, currentPassword, newPassword);

        // If password change was successful, send a success response
        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            // If unsuccessful, send a response with error details
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        // Log any errors that occur and return a 500 status for server error
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to log in an employee using Firebase and PostgreSQL
router.post('/login', async (req, res) => {
    const { employeeString, password } = req.body;

    // Log the login request to help trace login actions in debugging
    console.log('Login request received:', employeeString, password);

    try {
        // Call LoginEmployee to authenticate and retrieve employee data
        const employee = await LoginEmployee(employeeString, password);
        
        // Send success response with employee data if login was successful
        res.status(200).json({ success: true, employee });
    } catch (err) {
        // If login fails, return an error response with details
        res.status(400).json({ success: false, message: err.message });
    }
});

// Route to log in a business using Firebase and PostgreSQL
router.post('/loginBusiness', async (req, res) => {
    const { businessEmail, password } = req.body;

    // Log the login request to help trace login actions in debugging
    console.log('Business login request received:', businessEmail, password);

    try {
        // Call LoginBusiness to authenticate and retrieve business data
        const business = await LoginBusiness(businessEmail, password);

        // Send success response with business data if login was successful
        res.status(200).json({ success: true, business });
    } catch (err) {
        // If login fails, return an error response with details
        res.status(400).json({ success: false, message: err.message });
    }
});

// Route to log out an employee and close the database connection
router.post('/logout', async (req, res) => {
    console.log('Received logout request');
    console.log('Request body:', req.body);

    // TODO: Implement logout functionality properly
    /*const auth = getAuth();
    signOut(auth).then(() => {
    // Sign-out successful.
    }).catch((error) => {
    // An error happened.
    });*/

    // The client object here controls the connection to the database
    const client = await getClient();
    if (client) {
        try {
            // Close the database connection and confirm closure
            await client.end();
            console.log('Database client connection closed');
        } catch (err) {
            // Log any errors if there is an issue closing the connection
            console.error('Error closing database client connection:', err);
        }
    }

    // Send a success message confirming logout
    return res.status(200).json({ message: 'Logged out successfully' });
});

export default router; // Export the router to be used in server.js