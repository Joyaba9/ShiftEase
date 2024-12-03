import { updatePassword } from 'firebase/auth';
import 'firebase/compat/firestore';
import getClient from '../db/dbClient.js';
import { auth, signInWithEmailAndPassword } from '../firebase.js';
import CurrentUser from '../CurrentUser.js';

//#region Generate Default Password

/**
 * Generates a default password using the date of birth and Social Security Number (SSN).
 *
 * @param {string | Date} dob - The date of birth, either as a string or Date object.
 * @param {string} ssn - The Social Security Number of the user.
 * @returns {string} - A password in the format of MMYY followed by the last 4 digits of the SSN.
 */
function generateDefaultPassword(dob, ssn) {
    // Check if dob is a Date object and convert to string format if needed
    if (dob instanceof Date) {
        dob = dob.toISOString().slice(0, 10); // Converts to "YYYY-MM-DD"
    }

    // Verify dob is a string, otherwise throw an error
    if (typeof dob !== 'string') {
        throw new Error("Invalid date format for DOB");
    }

    // Generate the password by combining MMYY and last 4 digits of SSN
    return `${dob.slice(5, 7)}${dob.slice(2, 4)}${ssn.slice(-4)}`; // MMYY + last 4 SSN
}

//#endregion

//#region Get Email by Business and Employee ID

/**
 * Retrieves the employee's email using the business ID and employee ID.
 *
 * @param {string} businessId - The unique identifier of the business.
 * @param {string} userId - The unique identifier of the employee.
 * @returns {Promise<string>} - The email address of the employee if found.
 */
async function getEmailByBusinessAndEmployeeId(businessId, userId) {
    const client = await getClient(); // Initialize the database client
    await client.connect(); // Establish connection with the database

    try {
        // SQL query to fetch email for the provided business and user IDs
        const query = `SELECT email FROM employees WHERE business_id = $1 AND emp_id = $2`;
        const res = await client.query(query, [businessId, userId]); // Execute query
        if (res.rows.length > 0) {
            console.log('Email fetched from database:', res.rows[0].email); // Log success
            return res.rows[0].email; // Return fetched email
        } else {
            throw new Error('Employee not found'); // Handle case of missing employee
        }
    } catch (err) {
        console.error('Error fetching email from database:', err); // Log error
        throw err; // Rethrow error for higher-level handling
    } finally {
        await client.end(); // Close database connection
    }
}

//#endregion

//#region Login Employee

/**
 * Authenticates an employee by checking their credentials against PostgreSQL and Firebase.
 * If the employee's password matches the default password, prompts for a new password.
 *
 * @param {string} employeeString - Combination of business ID and user ID in "businessIdUuserId" format.
 * @param {string} password - The password for the employee.
 * @returns {Promise<Object>} - An object containing PostgreSQL employee data, Firebase authenticated user data, 
 * and a flag for password change if the default password is used.
 */
export async function LoginEmployee(employeeString, password) {
    // Split employeeString into business ID and user ID
    const [businessId, userId] = employeeString.split('U');

    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    // SQL query to retrieve employee data
        const query = `
                SELECT 
                    e.*,
                    r.is_manager
                FROM employees e
                JOIN roles r ON e.role_id = r.role_id
                WHERE e.business_id = $1
                AND e.emp_id = $2
            `;

    // Try to execute the query and authenticate with Firebase
    try {
        const res = await client.query(query, [businessId, userId]);
        console.log('Query Executed');
        
        // Check if employee exists in database
        if (res.rows.length > 0) {
            const employee = res.rows[0];
            const email = employee.email; // Fetch email

            console.log(`Employee found in PostgreSQL: ${JSON.stringify(employee)}`);
            console.log(`Attempting Firebase authentication for email: ${email}`);

            // Perform Firebase authentication
            const firebaseUser = await signInWithEmailAndPassword(auth, email, password);
            console.log(`Firebase authentication successful for user: ${firebaseUser.user.uid}`);

             // Store user data in CurrentUser
             CurrentUser.setUserInfo({
                uid: firebaseUser.user.uid,
                email: firebaseUser.user.email,
                employeeData: employee
            });

            console.log('Current user after login:', CurrentUser.getUserInfo()); // Add this log


            // Generate default password for comparison
            const defaultPassword = generateDefaultPassword(employee.birthday, employee.last4ssn);

            // If provided password matches the default, prompt for password change
            if (password === defaultPassword) {
                console.log('Your password is the default password. Please create a new password.');
                return {
                    employee: employee,
                    firebaseUser: firebaseUser.user,
                    promptPasswordChange: true
                };
            }

            // Return employee data if password is not the default
            return {
                employee: employee,
                firebaseUser: firebaseUser.user
            };
        } else {
            throw new Error('Employee not found in PostgreSQL');
        }
    } catch (err) {
        console.error('Error executing query:', err); // Log any errors
        throw err; // Rethrow for higher-level error handling
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

//#endregion

//#region Login Business

/**
 * Authenticates a business by checking credentials against PostgreSQL and Firebase.
 * 
 * @param {string} businessEmail - The email of the business.
 * @param {string} password - The password for the business.
 * @returns {Promise<Object>} - An object containing PostgreSQL business data and Firebase authenticated user data.
 */
export async function LoginBusiness(businessId, password) {
    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    // SQL query to retrieve business data
    const query = `SELECT * FROM businesses WHERE business_id = $1`;

    try {
        const res = await client.query(query, [businessId]);
        console.log('Query Executed');
        
        // Check if business exists in database
        if (res.rows.length > 0) {
            const business = res.rows[0];

            console.log(`Business found in PostgreSQL: ${JSON.stringify(business)}`);
            console.log(`Attempting Firebase authentication for business email: ${business.business_email}`);

            // Perform Firebase authentication
            const firebaseUser = await signInWithEmailAndPassword(auth, business.business_email, password);
            console.log(`Firebase authentication successful for user: ${firebaseUser.user.uid}`);

            // Return business data if authentication is successful
            return {
                business: business,
                firebaseUser: firebaseUser.user
            };
        } else {
            throw new Error('Business not found in PostgreSQL');
        }
    } catch (err) {
        console.error('Error executing query:', err); // Log any errors
        throw err; // Rethrow for higher-level error handling
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

//#endregion

//#region Change User Firebase Password

/**
 * Updates the Firebase password for an authenticated employee.
 *
 * @param {string} employeeId - Identifier of the employee, formatted as "businessIdUuserId".
 * @param {string} currentPassword - Employee's current password for re-authentication.
 * @param {string} newPassword - New password to be set for the employee.
 * @returns {Promise<Object>} - Success message or error details if operation fails.
 */
export async function changeUserPassword(employeeId, currentPassword, newPassword) {
    try {
        // Parse business and user IDs from employeeId string
        const [businessId, userId] = employeeId.split('U');
        console.log('Business ID:', businessId, 'User ID:', userId);

        // Retrieve employee email using business and user IDs
        const email = await getEmailByBusinessAndEmployeeId(businessId, userId);
        console.log('Email fetched from database:', email);

        // Re-authenticate user with current password
        const userCredential = await signInWithEmailAndPassword(auth, email, currentPassword);
        const user = userCredential.user;
        console.log('User re-authenticated successfully.');

        // Update password in Firebase
        await updatePassword(user, newPassword);
        console.log('Password updated successfully.');

        return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
        console.error('Error updating password:', error); // Log error details
        return { success: false, message: error.message };
    }
}

//#endregion