import { doc, setDoc } from 'firebase/firestore';
import getClient from '../db/dbClient.js';
import { auth, createUserWithEmailAndPassword, db } from '../firebase.js';

//#region Fetch Employees

/**
 * Retrieves all employees associated with a specific business ID.
 *
 * @param {string} businessId - The unique identifier of the business.
 * @returns {Promise<Array>} - An array of employee records belonging to the business.
 */
export async function fetchEmployees(businessId) {
    const client = await getClient(); // Initialize the database client
    console.log('Database Client Obtained');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // SQL query to fetch all employees associated with the business ID
    const query = `SELECT * FROM employees WHERE business_id = $1`;

    try {
        const res = await client.query(query, [businessId]); // Execute query
        console.log('Query Executed');
        
        return res.rows; // Return list of employees
    } catch (err) {
        console.error('Error executing query:', err); // Log any errors
        throw err; // Rethrow for higher-level error handling
    } finally {
        await client.end(); // Ensure database connection is closed
        console.log('Database connection closed');
    }
}

//#endregion

//#region Update Employee

/**
 * Updates the information of a specified employee based on provided new data.
 *
 * @param {string} employeeId - Unique identifier for the employee to update.
 * @param {Object} newEmployeeInfo - Object containing the new employee information, including role, name, email, SSN, and birthday.
 * @returns {Promise<void>} - A promise indicating success or failure.
 */
export async function UpdateEmployee(employeeId, newEmployeeInfo) {
    const client = await getClient(); // Initialize the database client
    console.log('Database Client Obtained');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // Destructure new employee information
    const { role_id, f_name, l_name, email, last4ssn, birthday } = newEmployeeInfo;

    // SQL query to update employee information
    const query = `UPDATE employees
                    SET role_id = $1,
                        f_name = $2,
                        l_name = $3,
                        email = $4,
                        last4ssn = $5,
                        birthday = $6,
                        updated_at = NOW()
                    WHERE emp_id = $7`;

    try {
        const res = await client.query(query, [role_id, f_name, l_name, email, last4ssn, birthday, employeeId]); // Execute query
        console.log('Query Executed');

        // Confirm success of update by checking affected rows
        if (res.rowCount > 0) {
            console.log(`Employee ID ${employeeId} updated successfully`);
        } else {
            throw new Error('Employee not found'); // Handle case if employee not found
        }
    } catch (err) {
        console.error('Error executing query:', err); // Log any errors
        throw err; // Rethrow for higher-level error handling
    } finally {
        await client.end(); // Ensure database connection is closed
        console.log('Database connection closed');
    }
}

//#endregion

//#region Add Employee

/**
 * Adds a new employee to both PostgreSQL and Firebase. If successful, stores employee data in Firestore.
 *
 * @param {string} role - Role of the employee (e.g., "Employee", "Manager").
 * @param {string} fName - First name of the employee.
 * @param {string} lName - Last name of the employee.
 * @param {string} email - Employee's email address.
 * @param {string} ssn - Social Security Number of the employee.
 * @param {string} dob - Date of birth in the format "YYYY-MM-DD".
 * @param {number} businessId - The unique identifier of the business.
 * @returns {Promise<Object>} - Object containing employee ID, email, role, and other relevant details.
 */
export async function AddEmployee(role, fName, lName, email, ssn, dob, businessId) {
    let roleID;
    let createdAt = new Date();
    let updatedAt = new Date();
    //businessId = 598984; // Temporary business ID for testings
    // TODO: Implement business ID retrieval from the user's session or other source

    // Determine role ID based on the provided role
    // TODO: GET THE INFORMATION FROM DATABASE
    if (role === 'Employee') {
        roleID = 2;
    } else if (role === 'Manager') {
        roleID = 1;
    } else {
        throw new Error('Invalid role specified'); // Throw error if role is not valid
    }

    const client = await getClient(); // Initialize the database client
    console.log('Database Client Obtained');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // Define the SQL query to insert employee data into PostgreSQL
    const insertQuery = `INSERT INTO employees (business_id, role_id, f_name, l_name, email, created_at, updated_at, last4ssn, birthday) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING emp_id`;

    try {
        // Generate password based on date of birth and last 4 digits of SSN
        const password = `${dob.slice(5, 7)}${dob.slice(2, 4)}${ssn.slice(-4)}`; // MMYY + last 4 SSN
        console.log(`Attempting to create Firebase user with email: ${email} and generated password`);

        // Firebase Authentication: Create a new user in Firebase with the generated password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`Firebase user created successfully with UID: ${userCredential.user.uid}`);

        // Insert employee into PostgreSQL after creating Firebase user
        console.log('Inserting employee into PostgreSQL database');
        const result = await client.query(insertQuery, [businessId, roleID, fName, lName, email, createdAt, updatedAt, ssn, dob]);
        const empId = result.rows[0].emp_id;
        console.log(`Employee added to PostgreSQL with ID: ${empId}`); 

        // Employee data to be stored in Firestore under business collection
        const employeeData = {
            empId,
            uid: userCredential.user.uid,  // Firebase UID
            fName,
            lName,
            email,
            roleID,
            businessId,
            createdAt,
            updatedAt,
        };

        // Store employee data in Firestore
        await setDoc(doc(db, `businesses/${businessId}/employees`, empId.toString()), employeeData);
        console.log('Employee data stored in Firestore');

        // Return relevant details of the new employee
        return {
            empId,
            email,
            fName,
            lName,
            roleID,
            businessId,
            password,
        };
    } catch (err) {
        console.error('An error occurred:', err); // Log error details

        if (err.code) {
            console.error(`Firebase error code: ${err.code}`); // Log specific Firebase errors
            console.error(`Firebase error message: ${err.message}`);
        } else {
            console.error(`Non-Firebase error: ${err.message}`); // Log PostgreSQL or other errors
        }
        throw err; // Rethrow for higher-level error handling
    } finally {
        await client.end(); // Ensure the database connection is closed
        console.log('Database connection closed');
    }
}

//#endregion

/**
 * "Deletes" an employee by setting them inactive and removing future requests,
 * only if the employee is associated with the specified business ID.
 *
 * @param {number} businessId - The ID of the business.
 * @param {number} employeeId - The ID of the employee to be "deleted".
 * @returns {Promise<Object>} - Result indicating the employee's status update and deleted requests.
 */
export async function SoftDeleteEmployee(businessId, employeeId) {
    const client = await getClient();
    await client.connect();

    try {
        // Check if the employee is associated with the specified business ID
        const employeeCheckQuery = `
            SELECT emp_id FROM employees
            WHERE emp_id = $1 AND business_id = $2 AND is_active = true;
        `;
        const employeeCheckRes = await client.query(employeeCheckQuery, [employeeId, businessId]);
        
        if (employeeCheckRes.rows.length === 0) {
            throw new Error('Employee not found or not associated with the specified business ID.');
        }

        // Begin transaction
        await client.query('BEGIN');

        // Set the employee as inactive
        const updateEmployeeQuery = `
            UPDATE employees
            SET is_active = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE emp_id = $1;
        `;
        await client.query(updateEmployeeQuery, [employeeId]);

        // Delete future requests for the employee
        const deleteFutureRequestsQuery = `
            DELETE FROM requests
            WHERE emp_id = $1
            AND start_date > CURRENT_DATE;
        `;
        const deleteResult = await client.query(deleteFutureRequestsQuery, [employeeId]);
        const deletedRequestCount = deleteResult.rowCount;

        // Commit transaction
        await client.query('COMMIT');

        return {
            success: true,
            message: 'Employee set as inactive and future requests deleted.',
            deletedRequests: deletedRequestCount
        };
    } catch (err) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error soft deleting employee:', err);
        throw err;
    } finally {
        await client.end();
    }
}