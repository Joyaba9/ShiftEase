import { updatePassword } from 'firebase/auth';
import getClient from './dbClient.js'; // Import your database client
import { auth, signInWithEmailAndPassword } from './firebase.js';

// Function to get the email from the database using business ID and employee ID
async function getEmailByBusinessAndEmployeeId(businessId, userId) {
    const client = await getClient();
    await client.connect();

    try {
        const query = `SELECT email FROM employees WHERE business_id = $1 AND emp_id = $2`;
        const res = await client.query(query, [businessId, userId]);
        if (res.rows.length > 0) {
            console.log('Email fetched from database:', res.rows[0].email);
            return res.rows[0].email;
        } else {
            throw new Error('Employee not found');
        }
    } catch (err) {
        console.error('Error fetching email from database:', err);
        throw err;
    } finally {
        await client.end();
    }
}

// Function to update the user's password
export async function changeUserPassword(employeeId, currentPassword, newPassword) {
    try {
        // Split the employee string into business ID and user ID
        const [businessId, userId] = employeeId.split('U');
        console.log('Business ID:', businessId, 'User ID:', userId);

        // Get the email from the database using business ID and user ID
        const email = await getEmailByBusinessAndEmployeeId(businessId, userId);
        console.log('Email fetched from database:', email);

        // Re-authenticate the user using their current password
        const userCredential = await signInWithEmailAndPassword(auth, email, currentPassword);
        const user = userCredential.user;
        console.log('User re-authenticated successfully.');

        // Now update the password to the new one
        await updatePassword(user, newPassword);
        console.log('Password updated successfully.');

        return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
        console.error('Error updating password:', error);
        return { success: false, message: error.message };
    }
}