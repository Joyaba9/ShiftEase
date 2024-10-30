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
 * @param {string} role - RoleID of the employee
 * @param {string} fName - First name of the employee.
 * @param {string} lName - Last name of the employee.
 * @param {string} email - Employee's email address.
 * @param {string} ssn - Social Security Number of the employee.
 * @param {string} dob - Date of birth in the format "YYYY-MM-DD".
 * @param {number} businessId - The unique identifier of the business.
 * @returns {Promise<Object>} - Object containing employee ID, email, role, and other relevant details.
 */
export async function AddEmployee(roleID, fName, lName, email, ssn, dob, businessId) {
    let createdAt = new Date();
    let updatedAt = new Date();

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

//#region Soft Delete Employee

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

//#endregion

//#region Add Employee Availability

// Add Employee Availability API
export async function AddEmployeeAvailability(emp_id, availability) {
    const client = await getClient();
    await client.connect();

    try {
        // Begin transaction
        await client.query('BEGIN');

        // Insert availability records
        const insertQuery = `
            INSERT INTO availability (emp_id, day_of_week, start_time, end_time, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        // Execute the insertion for each day in the availability array
        let insertedCount = 0; // Track successful inserts
        for (const day of availability) {
            if (!day.start_time || !day.end_time) {
                console.warn(`Skipping entry for ${day.day_of_week} due to missing start or end time`);
                continue;
            }
        
            await client.query(insertQuery, [
                emp_id,
                day.day_of_week.toLowerCase(),
                day.start_time,
                day.end_time,
                day.start_date || null,
                day.end_date || null,
            ]);
        
            insertedCount++; // Increment on successful insert
        }
        console.log(`Inserted ${insertedCount} entries into the database`);

        // Commit the transaction
        await client.query('COMMIT');

        return { success: true, message: 'Availability data added successfully' };
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback on error
        console.error('Error adding availability:', error);
        throw error;
    } finally {
        await client.end(); // Close database connection
    }
}

//#endregion

//#region Fetch Employee Availability

export async function fetchEmployeeAvailability(emp_id) {
    const client = await getClient();
    await client.connect();

    try {
        const query = `
            SELECT day_of_week, start_time, end_time, start_date, end_date 
            FROM availability 
            WHERE emp_id = $1;
        `;
        console.log(`Executing query for emp_id: ${emp_id}`);
        const result = await client.query(query, [emp_id]);

        console.log(`Query result for emp_id ${emp_id}:`, result.rows);
        return result.rows; // Return fetched availability data
    } catch (error) {
        console.error('Error fetching availability data:', error);
        throw error;
    } finally {
        await client.end(); // Close the database connection
        console.log("Database client closed.");
    }
}

//#endregion

//#region Get Future/Past/All Requests By Employee

/**
 * Fetches all future requests for an employee, sorted by start date,
 * ensuring the employee belongs to the specified business.
 * 
 * @param {number} emp_id - The ID of the employee.
 * @param {number} business_id - The ID of the business.
 * @returns {Promise<Array>} - An array of future request records, including day type and times.
 */
export async function getFutureRequestsByEmployee(emp_id, business_id) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch future requests with the new columns
    const futureRequestsQuery = `
        SELECT request_id, request_type, start_date, end_date, day_type, start_time, end_time, status, reason
        FROM requests
        WHERE emp_id = $1
          AND start_date > CURRENT_DATE
        ORDER BY start_date ASC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        // Fetch future requests if the association is confirmed
        const result = await client.query(futureRequestsQuery, [emp_id]);
        return result.rows;
    } catch (err) {
        console.error('Error fetching future requests:', err);
        throw err;
    } finally {
        await client.end();
    }
}

/**
 * Fetches all past requests for an employee sorted by start date,
 * ensuring the employee belongs to the specified business.
 * 
 * @param {number} emp_id - The ID of the employee.
 * @param {number} business_id - The ID of the business.
 * @returns {Promise<Array>} - An array of past request records.
 */
export async function getPastRequestsByEmployee(emp_id, business_id) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch past requests
    const pastRequestsQuery = `
        SELECT request_id, request_type, start_date, end_date, day_type, start_time, end_time, status, reason
        FROM requests
        WHERE emp_id = $1
          AND end_date < CURRENT_DATE
        ORDER BY start_date DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        // Fetch past requests if the association is confirmed
        const result = await client.query(pastRequestsQuery, [emp_id]);
        return result.rows;
    } catch (err) {
        console.error('Error fetching past requests:', err);
        throw err;
    } finally {
        await client.end();
    }
}

/**
 * Fetches all requests for an employee, sorted by the latest start date first,
 * ensuring the employee belongs to the specified business.
 * 
 * @param {number} emp_id - The ID of the employee.
 * @param {number} business_id - The ID of the business.
 * @returns {Promise<Array>} - An array of all request records, including day type and times.
 */
export async function getAllRequestsByEmployee(emp_id, business_id) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch all requests sorted by the latest start date first
    const allRequestsQuery = `
        SELECT request_id, request_type, start_date, end_date, day_type, start_time, end_time, status, reason
        FROM requests
        WHERE emp_id = $1
        ORDER BY start_date DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        // Fetch all requests if the association is confirmed
        const result = await client.query(allRequestsQuery, [emp_id]);
        return result.rows;
    } catch (err) {
        console.error('Error fetching all requests:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion