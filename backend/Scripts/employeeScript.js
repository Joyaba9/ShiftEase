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
    const query = `SELECT * FROM employees 
                   WHERE business_id = $1
                   AND is_active = TRUE`;

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

export async function fetchEmployeesWithRoles(businessId) {
    const client = await getClient(); // Initialize the database client
    console.log('Database Client Obtained');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // SQL query to fetch employees along with their role names
    const query = `
        SELECT e.*, r.role_name 
        FROM employees e
        JOIN roles r ON e.role_id = r.role_id
        WHERE e.business_id = $1
        AND e.is_active = TRUE
    `;

    try {
        const res = await client.query(query, [businessId]); // Execute query
        console.log('Query Executed');
        
        return res.rows; // Return list of employees with role names
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
export async function AddEmployee(roleID, fName, lName, email, ssn, dob, businessId, fullTime) {
    let createdAt = new Date();
    let updatedAt = new Date();

    const client = await getClient(); // Initialize the database client
    console.log('Database Client Obtained');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // Define the SQL query to insert employee data into PostgreSQL
    const insertQuery = `
        INSERT INTO employees (business_id, role_id, f_name, l_name, email, created_at, updated_at, last4ssn, birthday, full_time) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING emp_id`;

    try {
        // Generate password based on date of birth and last 4 digits of SSN
        const password = `${dob.slice(5, 7)}${dob.slice(2, 4)}${ssn.slice(-4)}`; // MMYY + last 4 SSN
        console.log(`Attempting to create Firebase user with email: ${email} and generated password`);

        // Firebase Authentication: Create a new user in Firebase with the generated password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`Firebase user created successfully with UID: ${userCredential.user.uid}`);

        // Insert employee into PostgreSQL after creating Firebase user
        console.log('Inserting employee into PostgreSQL database');
        const result = await client.query(insertQuery, [
            businessId, 
            roleID, 
            fName, 
            lName, 
            email, 
            createdAt, 
            updatedAt, 
            ssn, 
            dob, 
            fullTime
        ]);
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
            fullTime, // Include employment type
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
            fullTime, // Include employment type in the return object
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
 * "Deletes" an employee by setting them inactive, removing future requests, and deleting availability records
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

        // Delete availability for the employee
        const deleteAvailabilityQuery = `
            DELETE FROM availability
            WHERE emp_id = $1;
        `;
        const deleteAResult = await client.query(deleteAvailabilityQuery, [employeeId]);
        const deletedARequestCount = deleteAResult.rowCount;

        // Commit transaction
        await client.query('COMMIT');

        return {
            success: true,
            message: 'Employee set as inactive and future requests deleted.',
            deletedRequests: deletedRequestCount,
            deletedAvailability: deletedARequestCount
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
export async function getFutureRequestsByEmployee(emp_id, business_id, isManager) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch future requests with the new columns
    const futureRequestsQuery = `
        SELECT 
            r.request_id,
            e.f_name,
            e.l_name,  
            r.created_at,
            r.start_date, 
            r.end_date, 
            r.status 
        FROM requests r
        JOIN employees e ON r.emp_id = e.emp_id
        WHERE r.emp_id = $1
          AND start_date > CURRENT_DATE
        ORDER BY created_at DESC;
    `;

    const futureRequestsManagerQuery = `
        SELECT 
            r.request_id,
            e.f_name,
            e.l_name,  
            r.created_at,
            r.start_date, 
            r.end_date, 
            r.status 
        FROM requests r
        JOIN employees e ON r.emp_id = e.emp_id
        WHERE business_id = $1
          AND start_date > CURRENT_DATE
        ORDER BY created_at DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        if (isManager === 'true'){
            const result = await client.query(futureRequestsManagerQuery, [business_id]);
            return result.rows;
        } else {
            // Fetch future requests if the association is confirmed
            const result = await client.query(futureRequestsQuery, [emp_id]);
            return result.rows;
        }
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
 * @param {boolean} isManager - The status of if manager is set
 * @returns {Promise<Array>} - An array of past request records.
 */
export async function getPastRequestsByEmployee(emp_id, business_id, isManager) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch past requests
    const pastRequestsQuery = `
        SELECT 
            r.request_id,
            e.f_name,
            e.l_name,  
            r.created_at,
            r.start_date, 
            r.end_date, 
            r.status 
        FROM requests r
        JOIN employees e ON r.emp_id = e.emp_id
        WHERE r.emp_id = $1
          AND end_date < CURRENT_DATE
        ORDER BY created_at DESC;
    `;

    const pastRequestsManagerQuery = `
        SELECT 
            r.request_id,
            e.f_name,
            e.l_name,
            r.created_at,  
            r.start_date, 
            r.end_date, 
            r.status 
        FROM requests r
        JOIN employees e ON r.emp_id = e.emp_id
        WHERE business_id = $1
          AND end_date < CURRENT_DATE
        ORDER BY created_at DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        if (isManager === 'true'){
            const result = await client.query(pastRequestsManagerQuery, [business_id]);
            return result.rows;
        } else {
            // Fetch past requests if the association is confirmed
            const result = await client.query(pastRequestsQuery, [emp_id]);
            return result.rows;
        }
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

/**
 * Fetches all requests for an employee, sorted by the latest start date first,
 * ensuring the employee belongs to the specified business.
 * 
 * @param {number} emp_id - The ID of the employee.
 * @param {number} business_id - The ID of the business.
 * @param {string} status - The status that is being searched for
 * @param {boolean} isManager - Manager status
 * @returns {Promise<Array>} - An array of all request records, including day type and times.
 */
export async function getAllRequestStatusByEmployee(emp_id, business_id, status, isManager) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch all requests sorted by the latest start date first
    const allRequestsByStatusQuery = `
        SELECT 
            r.request_id,
            e.f_name,
            e.l_name,  
            r.created_at,
            r.start_date, 
            r.end_date, 
            r.status   
        FROM requests r
        JOIN employees e ON r.emp_id = e.emp_id
        WHERE r.emp_id = $1 AND status = $2
        ORDER BY created_at DESC;
    `;

    const allRequestsByStatusManagerQuery = `
        SELECT 
            r.request_id,
            e.f_name,
            e.l_name,
            r.created_at,
            r.status,
            r.start_date,
            r.end_date
        FROM requests r
        JOIN employees e ON r.emp_id = e.emp_id
        WHERE business_id = $1 AND status = $2
        ORDER BY created_at DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        console.log('Type of isManager: ', typeof isManager);
        console.log('isManager in status script: ', isManager);

        if (isManager === 'true') {
            const result = await client.query(allRequestsByStatusManagerQuery, [business_id, status]);
            return result.rows;
        } else {
             // Fetch all requests if the association is confirmed
            const result = await client.query(allRequestsByStatusQuery, [emp_id, status]);
            return result.rows;
        } 
    } catch (err) {
        console.error('Error fetching all requests:', err);
        throw err;
    } finally {
        await client.end();
    }
}

/**
 * Fetches details of a specific request based on the request ID, including employee information.
 * 
 * @param {number} request_id - The ID of the request to fetch.
 * @returns {Promise<Object|null>} - An object containing all request details, or null if not found.
 */
export async function getRequestById(request_id) {
    const client = await getClient();
    await client.connect();

    // Query to fetch request details along with employee first name and last name
    const getRequestByIdQuery = `
        SELECT 
            r.request_id,
            e.f_name AS first_name,
            e.l_name AS last_name,
            r.created_at,
            r.reason AS request_comments,
            r.manager_comments,
            r.start_date,
            r.end_date,
            r.start_time,
            r.end_time,
            r.status AS request_status,
            r.request_type AS time_off_type
        FROM requests r
        JOIN employees e ON r.emp_id = e.emp_id
        WHERE r.request_id = $1;
    `;

    try {
        // Fetch the request details
        const result = await client.query(getRequestByIdQuery, [request_id]);

        // Return the request details or null if not found
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
        console.error('Error fetching request by ID:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion


/**
 * Fetches details of a specific availability request based on the request ID, including employee information.
 * 
 * @param {number} request_id - The ID of the availability request to fetch.
 * @returns {Promise<Object|null>} - An object containing all availability request details, or null if not found.
 */
export async function getAvailabilityRequestById(request_id) {
    const client = await getClient();
    await client.connect();

    // Query to fetch availability request details along with employee first name, last name, and manager comments
    const getAvailabilityRequestByIdQuery = `
        SELECT 
            ar.request_id,
            e.f_name AS first_name,
            e.l_name AS last_name,
            ar.created_at,
            ar.start_date,
            ar.end_date,
            ar.availability,
            ar.reason, 
            ar.status AS request_status,
            ar.manager_comments
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.request_id = $1;
    `;

    try {
        // Fetch the availability request details
        const result = await client.query(getAvailabilityRequestByIdQuery, [request_id]);

        // Return the availability request details or null if not found
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
        console.error('Error fetching availability request by ID:', err);
        throw err;
    } finally {
        await client.end();
    }
}


//#endregion


//#region Add Request For Employee

/**
 * Adds a new request for an employee with a default status of 'Pending'.
 * 
 * Had to use an object, max parameters is 7.
 * @param {Object} requestData - The request data, including emp_id, business_id, request_type, day_type, start_date, end_date, start_time, end_time, and reason.
 * @returns {Promise<Object>} - The created request record.
 */
export async function addRequestForEmployee(requestData) {
    const client = await getClient();
    await client.connect();

    const { emp_id, business_id, request_type, day_type, start_date, end_date, start_time, end_time, reason } = requestData;
    const startDate = new Date(start_date);
    const endDate = end_date ? new Date(end_date) : null;
    const currentDate = new Date();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id, full_time, created_at FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to insert the new request with a default status of 'Pending'
    const addRequestQuery = `
        INSERT INTO requests (emp_id, request_type, day_type, start_date, end_date, start_time, end_time, status, reason, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8, CURRENT_TIMESTAMP)
        RETURNING request_id, request_type, day_type, start_date, end_date, start_time, end_time, status, reason;
    `;

    // Check 'How long in advance for a request submission' in business preferences
    const advanceSubmissionQuery = `
        SELECT number FROM business_preferences 
        WHERE business_id = $1 
        AND preference_id = (SELECT preference_id FROM preferences WHERE preference_description = 'How long in advance for a request submission: ')
    `;

    // Check 'PTO Eligibility Period' in business preferences
    const ptoEligibilityQuery = `
        SELECT number FROM business_preferences 
        WHERE business_id = $1 
        AND preference_id = (SELECT preference_id FROM preferences WHERE preference_description = 'PTO Eligibility Period:')
    `;

    try {
        // Check if the employee is associated with the business
        const employeeRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (employeeRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }
        const { full_time, created_at: employmentStartDate } = employeeRes.rows[0];

        // Advance Submission Check
        const advanceSubmissionRes = await client.query(advanceSubmissionQuery, [business_id]);
        if (advanceSubmissionRes.rows.length > 0) {
            const weeksInAdvance = advanceSubmissionRes.rows[0].number;
            const requiredSubmissionDate = new Date();
            requiredSubmissionDate.setDate(currentDate.getDate() + weeksInAdvance * 7);
            if (startDate < requiredSubmissionDate) {
                throw new Error(`Requests must be submitted at least ${weeksInAdvance} weeks in advance.`);
            }
        }

        // PTO Eligibility Check for part-time employees
        if (!full_time) {
            const ptoEligibilityRes = await client.query(ptoEligibilityQuery, [business_id]);
            if (ptoEligibilityRes.rows.length > 0) {
                const eligibilityMonths = ptoEligibilityRes.rows[0].number;
                const eligibilityDate = new Date(employmentStartDate);
                eligibilityDate.setMonth(eligibilityDate.getMonth() + eligibilityMonths);

                if (currentDate < eligibilityDate) {
                    throw new Error(`Non-full-time employees must work at the business for at least ${eligibilityMonths} months before submitting a PTO request.`);
                }
            }
        }

        // Insert the new request if all checks pass
        const result = await client.query(addRequestQuery, [emp_id, request_type, day_type, start_date, end_date, start_time, end_time, reason]);
        return result.rows[0]; // Return the created request record
    } catch (err) {
        console.error('Error adding request:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

//#region Update Request Status

/**
 * Updates the status of a request for an employee and optionally adds manager comments.
 * 
 * @param {number} request_id - The ID of the request to update.
 * @param {number} business_id - The ID of the business associated with the request.
 * @param {string} status - The new status of the request ('Approved' or 'Rejected').
 * @param {string} [manager_comments] - Optional manager comments to include with the update.
 * @returns {Promise<Object>} - The updated request record.
 */
export async function updateRequestStatus(request_id, business_id, status, manager_comments = null) {
    const client = await getClient();
    await client.connect();

    // Only allow 'Approved' or 'Rejected' status
    const validStatuses = ['Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Status must be either "Approved" or "Rejected".');
    }

    // Query to confirm the request exists and belongs to the business
    const checkRequestQuery = `
        SELECT emp_id, request_type, day_type, start_date, end_date, start_time, end_time, reason, status
        FROM requests
        WHERE request_id = $1 AND emp_id IN (SELECT emp_id FROM employees WHERE business_id = $2);
    `;

    // Query to update the request status and optionally add manager comments
    const updateStatusQuery = `
        UPDATE requests
        SET status = $1, updated_at = CURRENT_TIMESTAMP, 
            manager_comments = COALESCE($3, manager_comments)
        WHERE request_id = $2
        RETURNING request_id, emp_id, request_type, day_type, start_date, end_date, start_time, end_time, status, reason, manager_comments;
    `;

    try {
        // Check if the request belongs to an employee in the business
        const checkRes = await client.query(checkRequestQuery, [request_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Request not found or does not belong to the specified business.');
        }

        // Update the status and manager comments of the request
        const result = await client.query(updateStatusQuery, [status, request_id, manager_comments]);
        return result.rows[0]; // Return the updated request record
    } catch (err) {
        console.error('Error updating request status:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

/**
 * Fetches whether the employee is a manager based on their role.
 * 
 * @param {number} emp_id - The ID of the employee.
 * @returns {Promise<boolean>} - A boolean indicating if the employee is a manager.
 */
export async function checkIfEmployeeIsManager(emp_id) {
    const client = await getClient();
    await client.connect();

    // Query to fetch the role_id of the employee
    const checkRoleQuery = `
        SELECT role_id FROM employees 
        WHERE emp_id = $1;
    `;

    // Query to check if the role has the isManager flag set to true
    const checkRoleIsManagerQuery = `
        SELECT is_manager FROM roles 
        WHERE role_id = $1;
    `;

    try {
        // Fetch the employee's role_id
        const checkRes = await client.query(checkRoleQuery, [emp_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee not found');
        }

        const role_id = checkRes.rows[0].role_id;

        // Fetch if the role is marked as a manager
        const roleRes = await client.query(checkRoleIsManagerQuery, [role_id]);
        if (roleRes.rows.length === 0) {
            throw new Error('Role not found');
        }

        const isManager = roleRes.rows[0].is_manager;
        return isManager; // Return true or false based on the isManager flag

    } catch (err) {
        console.error('Error checking if employee is a manager:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#region Save Employee Data

/**
 * Saves or updates business location details in the database.
 *
 * @param {Object} employeeData - Data object containing employee details such as address and contact information.
 * @returns {Promise<number>} - The unique ID of the saved or updated employee info.
 */
export async function saveEmployeeData(employeeData) {
    const client = await getClient(); // Initialize the database client
    console.log("===================");
    console.log('Database Client Obtained by saveEmployeeData');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // SQL query to check if location with the specified emp ID exist
    const checkQuery = `SELECT emp_id FROM employee_info WHERE emp_id = $1`;

    try {
        // Execute query to check for existing location
        const checkRes = await client.query(checkQuery, [employeeData.emp_id]);

        console.log(checkRes.rows.length);
        console.log(checkRes.rows[0]);
        if (checkRes.rows.length > 0) {
            const updateQuery = `
                UPDATE employee_info
                SET
                    street_address = $1,
                    city = $2,
                    state = $3,
                    zipcode = $4,
                    phone_number = $5,
                    updated_at = NOW()
                WHERE emp_id = $6;
            `;

            const updateParams = [
                employeeData.street_address,
                employeeData.city,
                employeeData.state,
                employeeData.zipcode,
                employeeData.phone_number,
                employeeData.emp_id,
            ];

            const updateRes = await client.query(updateQuery, updateParams);
            console.log('Employee Updated Successfully');

        } else {
            // Insert new location if it does not exist
            const insertQuery = `
                INSERT INTO employee_info (
                    emp_id,
                    street_address,
                    city,
                    state,
                    zipcode,
                    phone_number,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            `;

            const insertParams = [
                employeeData.emp_id,
                employeeData.street_address,
                employeeData.city,
                employeeData.state,
                employeeData.zipcode,
                employeeData.phone_number,
            ];

            const insertRes = await client.query(insertQuery, insertParams);
            console.log('New Employee Info Saved Successfully');
        }
    } catch (err) {
        console.error('Error saving or updating employee data:', err); // Log any errors
        throw err; // Rethrow for higher-level error handling
    } finally {
        await client.end(); // Ensure the database connection is closed
        console.log('Database connection closed');
    }
}

//#endregion


/**
 * Saves or updates business location details in the database.
 *
 * @param {number} emp_id - The unique identifier of the employee.
 * 
 */
export async function getEmployeeData(emp_id) {
    const client = await getClient();
    await client.connect();

    // Fetching business location including business hours (JSON)
    const query = `
        SELECT
            ei.emp_id,
            ei.street_address,
            ei.city,
            ei.state,
            ei.zipcode,
            ei.phone_number,
            b.business_name
        FROM
            employee_info AS ei
        JOIN
            employees AS e ON ei.emp_id = e.emp_id
        JOIN
            businesses AS b ON e.business_id = b.business_id
        WHERE
            ei.emp_id = $1;
    `;
    
    try {
        const res = await client.query(query, [emp_id]);
        if (res.rows.length > 0) {
            return res.rows[0];
        } else {
            return null; // No data found
        }
    } catch (err) {
        console.error('Error fetching business location:', err);
        throw err;
    } finally {
        await client.end();
    }
}

/**
 * Adds a new availability change request for an employee.
 * 
 * @param {Object} requestData - The request data, including emp_id, business_id, start_date, end_date, availability details, and reason.
 * @returns {Promise<Object>} - The created availability request record.
 */
export async function addAvailabilityRequestForEmployee(requestData) {
    const client = await getClient();
    await client.connect();

    const { emp_id, business_id, start_date, end_date, availability, reason } = requestData;
    const startDate = new Date(start_date);
    const endDate = end_date ? new Date(end_date) : null;

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id, full_time, created_at 
        FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to insert the new availability request with a default status of 'Pending'
    const addAvailabilityQuery = `
        INSERT INTO availability_requests (emp_id, business_id, start_date, end_date, availability, reason, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'Pending', CURRENT_TIMESTAMP)
        RETURNING request_id, start_date, end_date, availability, reason, status;
    `;

    try {
        // Verify employee association
        const employeeCheck = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (employeeCheck.rows.length === 0) {
            throw new Error('Employee is not associated with the business or is inactive.');
        }

        // Insert availability request
        const result = await client.query(addAvailabilityQuery, [
            emp_id,
            business_id,
            startDate,
            endDate || startDate,
            JSON.stringify(availability),
            reason,
        ]);

        return result.rows[0]; // Return the new request data
    } catch (error) {
        console.error('Error inserting availability request:', error);
        throw new Error('Failed to add availability request.');
    } finally {
        await client.end();
    }
}


/**
 * Fetches all future availability requests for an employee, sorted by start date,
 * ensuring the employee belongs to the specified business.
 * 
 * @param {number} emp_id - The ID of the employee.
 * @param {number} business_id - The ID of the business.
 * @returns {Promise<Array>} - An array of future availability request records.
 */
export async function getFutureAvailabilityRequests(emp_id, business_id, isManager) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch future availability requests
    const futureAvailabilityRequestsQuery = `
        SELECT 
            ar.request_id,
            e.f_name,
            e.l_name,  
            ar.created_at,
            ar.start_date, 
            ar.end_date, 
            ar.status,
            ar.availability
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.emp_id = $1
          AND ar.start_date > CURRENT_DATE
        ORDER BY ar.created_at DESC;
    `;

    // Manager-level query for future availability requests
    const futureAvailabilityRequestsManagerQuery = `
        SELECT 
            ar.request_id,
            e.f_name,
            e.l_name,  
            ar.created_at,
            ar.start_date, 
            ar.end_date, 
            ar.status,
            ar.availability
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.business_id = $1
          AND ar.start_date > CURRENT_DATE
        ORDER BY ar.created_at DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        let result;

        if (isManager === 'true') {
            // Fetch future availability requests for the manager
            result = await client.query(futureAvailabilityRequestsManagerQuery, [business_id]);
        } else {
            // Fetch future availability requests for the employee
            result = await client.query(futureAvailabilityRequestsQuery, [emp_id]);
        }

        return result.rows;
    } catch (err) {
        console.error('Error fetching future availability requests:', err);
        throw err;
    } finally {
        await client.end();
    }
}



/**
 * Updates the status of an availability request for an employee and optionally adds manager comments.
 * 
 * @param {number} request_id - The ID of the availability request to update.
 * @param {number} business_id - The ID of the business associated with the request.
 * @param {string} status - The new status of the request ('Approved' or 'Rejected').
 * @param {string} [manager_comments] - Optional manager comments to include with the update.
 * @returns {Promise<Object>} - The updated availability request record.
 */
export async function updateAvailabilityRequestStatus(request_id, business_id, status, manager_comments = null) {
    const client = await getClient();
    await client.connect();

    const validStatuses = ['Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Status must be either "Approved" or "Rejected".');
    }

    const checkRequestQuery = `
        SELECT emp_id FROM availability_requests
        WHERE request_id = $1 AND emp_id IN (SELECT emp_id FROM employees WHERE business_id = $2);
    `;
    const updateStatusQuery = `
        UPDATE availability_requests
        SET status = $1, updated_at = CURRENT_TIMESTAMP, 
            manager_comments = COALESCE($3, manager_comments)
        WHERE request_id = $2
        RETURNING request_id, status, manager_comments;
    `;

    try {
        console.log('Payload received:', { request_id, business_id, status, manager_comments });
        console.log('Checking availability request...');
        const checkRes = await client.query(checkRequestQuery, [request_id, business_id]);
        console.log('Check result:', checkRes.rows);

        if (checkRes.rows.length === 0) {
            throw new Error('Availability request not found or does not belong to the specified business.');
        }

        console.log('Updating request status...');
        const result = await client.query(updateStatusQuery, [status, request_id, manager_comments]);
        console.log('Update result:', result.rows);

        return {
            success: true,
            updatedRequest: result.rows[0],
        };
    } catch (err) {
        console.error('Error updating availability request status:', err);
        throw err;
    } finally {
        await client.end();
    }
}




/**
 * Fetches all approved availability requests for an employee or manager.
 * 
 * @param {number} emp_id - The ID of the employee.
 * @param {number} business_id - The ID of the business.
 * @param {string} isManager - Indicates if the user is a manager ('true' or 'false').
 * @returns {Promise<Array>} - An array of approved availability request records.
 */
export async function getApprovedAvailabilityRequests(emp_id, business_id, isManager) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch approved availability requests for an employee
    const approvedAvailabilityRequestsQuery = `
        SELECT 
            ar.request_id,
            e.f_name,
            e.l_name,
            ar.created_at,
            ar.start_date, 
            ar.end_date, 
            ar.status,
            ar.availability,
            ar.manager_comments
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.emp_id = $1
          AND ar.status = 'Approved'
        ORDER BY ar.created_at DESC;
    `;

    // Manager-level query to fetch approved availability requests
    const approvedAvailabilityRequestsManagerQuery = `
        SELECT 
            ar.request_id,
            e.f_name,
            e.l_name,
            ar.created_at,
            ar.start_date, 
            ar.end_date, 
            ar.status,
            ar.availability,
            ar.manager_comments
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.business_id = $1
          AND ar.status = 'Approved'
        ORDER BY ar.created_at DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        let result;

        if (isManager === 'true') {
            // Fetch approved availability requests for the manager
            result = await client.query(approvedAvailabilityRequestsManagerQuery, [business_id]);
        } else {
            // Fetch approved availability requests for the employee
            result = await client.query(approvedAvailabilityRequestsQuery, [emp_id]);
        }

        return result.rows;
    } catch (err) {
        console.error('Error fetching approved availability requests:', err);
        throw err;
    } finally {
        await client.end();
    }
}

/**
 * Fetches all rejected availability requests for an employee or manager.
 * 
 * @param {number} empId - The ID of the employee.
 * @param {number} businessId - The ID of the business.
 * @param {boolean} isManager - Whether the user is a manager.
 * @returns {Promise<Array>} - An array of rejected availability request records.
 */
export async function getRejectedAvailabilityRequests(empId, businessId, isManager) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch rejected availability requests for an employee
    const rejectedAvailabilityRequestsQuery = `
        SELECT 
            ar.request_id,
            e.f_name,
            e.l_name,
            ar.created_at,
            ar.start_date, 
            ar.end_date, 
            ar.status,
            ar.manager_comments
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.emp_id = $1
          AND ar.business_id = $2
          AND ar.status = 'Rejected'
        ORDER BY ar.created_at DESC;
    `;

    // Manager-level query to fetch rejected availability requests
    const rejectedAvailabilityRequestsManagerQuery = `
        SELECT 
            ar.request_id,
            e.f_name,
            e.l_name,
            ar.created_at,
            ar.start_date, 
            ar.end_date, 
            ar.status,
            ar.manager_comments
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.business_id = $1
          AND ar.status = 'Rejected'
        ORDER BY ar.created_at DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [empId, businessId]);
        if (checkRes.rows.length === 0 && !isManager) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        let result;

        if (isManager === 'true') {
            // Fetch rejected availability requests for the manager
            result = await client.query(rejectedAvailabilityRequestsManagerQuery, [businessId]);
        } else {
            // Fetch rejected availability requests for the employee
            result = await client.query(rejectedAvailabilityRequestsQuery, [empId, businessId]);
        }

        return result.rows;
    } catch (err) {
        console.error('Error fetching rejected availability requests:', err);
        throw err;
    } finally {
        await client.end();
    }
}

/**
 * Fetches past availability requests for a specific employee or business.
 *
 * @param {number} empId - The employee ID (optional for managers).
 * @param {number} businessId - The business ID.
 * @param {boolean} isManager 
 * @returns {Promise<Array>} - An array of past availability requests (approved or rejected).
 */
export async function getPastAvailabilityRequests(emp_id, business_id, isManager) {
    const client = await getClient();
    await client.connect();

    // Query to confirm employee's association with the business
    const checkEmployeeQuery = `
        SELECT emp_id FROM employees 
        WHERE emp_id = $1 AND business_id = $2 AND is_active = TRUE;
    `;

    // Query to fetch past availability requests for an employee
    const pastAvailabilityRequestsQuery = `
        SELECT 
            ar.request_id,
            e.f_name,
            e.l_name,
            ar.created_at,
            ar.start_date, 
            ar.end_date, 
            ar.status,
            ar.manager_comments,
            NOW() AS current_time
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.emp_id = $1
          AND ar.business_id = $2
          AND ar.status IN ('Approved', 'Rejected')
          AND ar.end_date < NOW()
        ORDER BY ar.created_at DESC;
    `;

    // Manager-level query to fetch past availability requests
    const pastAvailabilityRequestsManagerQuery = `
        SELECT 
            ar.request_id,
            e.f_name,
            e.l_name,
            ar.created_at,
            ar.start_date, 
            ar.end_date, 
            ar.status,
            ar.manager_comments,
            NOW() AS current_time
        FROM availability_requests ar
        JOIN employees e ON ar.emp_id = e.emp_id
        WHERE ar.business_id = $1
          AND ar.status IN ('Approved', 'Rejected')
          AND ar.end_date < NOW()
        ORDER BY ar.created_at DESC;
    `;

    try {
        // Check if the employee is associated with the business
        const checkRes = await client.query(checkEmployeeQuery, [emp_id, business_id]);
        if (checkRes.rows.length === 0) {
            throw new Error('Employee is not associated with the specified business or is inactive');
        }

        let result;

        if (isManager === 'true') {
            // Fetch past availability requests for the manager
            result = await client.query(pastAvailabilityRequestsManagerQuery, [business_id]);
        } else {
            // Fetch past availability requests for the employee
            result = await client.query(pastAvailabilityRequestsQuery, [emp_id, business_id]);
        }

        return result.rows;
    } catch (err) {
        console.error('Error fetching past availability requests:', err);
        throw err;
    } finally {
        await client.end();
    }
}

