import { updatePassword } from 'firebase/auth';
import 'firebase/compat/firestore';
import getClient from './dbClient.js';
import { auth, signInWithEmailAndPassword } from './firebase.js'; // Import auth from your Firebase module

//#region Generate Default Password

// Function to generate the default password
function generateDefaultPassword(dob, ssn) {
    // Check if dob is a Date object, and convert it to string
    if (dob instanceof Date) {
        dob = dob.toISOString().slice(0, 10); // Convert Date to "YYYY-MM-DD"
    }

    // Handle other potential formats, just to be safe
    if (typeof dob !== 'string') {
        throw new Error("Invalid date format for DOB");
    }

    // Generate default password as MMYY + last 4 SSN
    return `${dob.slice(5, 7)}${dob.slice(2, 4)}${ssn.slice(-4)}`; // MMYY + last 4 SSN
}

//#endregion

//#region Get Email by Business and Employee ID

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

//#endregion

//#region Login Employee

// Login function
export async function LoginEmployee(employeeString, password) {

    // Split the employee string into business ID and user ID
    const [businessId, userId] = employeeString.split('U');

    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    // Query to get the employee with the given business ID and user ID
    const query = `SELECT * FROM employees
                    WHERE business_id = $1
                    AND emp_id = $2`;

    // Execute the query
    try {
        // Execute the query in PostgreSQL to find the employee
        const res = await client.query(query, [businessId, userId]);
        console.log('Query Executed');
        
        // If the employee is found, retrieve the email and authenticate with Firebase
        if (res.rows.length > 0) {
            const employee = res.rows[0];
            const email = employee.email; // Get the email from PostgreSQL

            console.log(`Employee found in PostgreSQL: ${JSON.stringify(employee)}`);
            console.log(`Attempting Firebase authentication for email: ${email}`);

             // Authenticate the employee using Firebase Auth
            const firebaseUser = await signInWithEmailAndPassword(auth, email, password);
            console.log(`Firebase authentication successful for user: ${firebaseUser.user.uid}`);

            // Generate the default password
            const defaultPassword = generateDefaultPassword(employee.birthday, employee.last4ssn);

            // Check if the provided password matches the default password
            if (password === defaultPassword) {
                // Prompt the user to create a new password
                console.log('Your password is the default password. Please create a new password.');
                // You can return a specific response or handle this case as needed
                return {
                    employee: employee, // PostgreSQL employee data
                    firebaseUser: firebaseUser.user, // Firebase Authenticated user data 
                    promptPasswordChange: true // Indicate that the user should change their password
                };
            }

            // Return both Firebase and PostgreSQL data if password is not the default one
            return {
                employee: employee, // PostgreSQL employee data
                firebaseUser: firebaseUser.user // Firebase Authenticated user data
            };
        } else {
            // If the employee is not found, throw an error
            throw new Error('Employee not found in PostgreSQL');
        }
    } catch (err) {
        // Log and throw any errors that occur during the query
        console.error('Error executing query:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

//#endregion

//#region Change User Firebase Password

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

//#endregion
