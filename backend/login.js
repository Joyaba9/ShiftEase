import getClient from './dbClient.js';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { auth, signInWithEmailAndPassword } from './firebase.js'; // Import auth from your Firebase module



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
 
            // Return both Firebase and PostgreSQL data
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
        //
        await client.end();
        console.log('Database connection closed');
    }
}

// Example usage. This will log the employee object if the employee is found, or log an error if the employee is not found.
//LoginEmployee("598984U1", 'password').then(employee => console.log('Employee:', employee)).catch(err => console.error('Error:', err));


// test with : 598984U32 and password is 09031111