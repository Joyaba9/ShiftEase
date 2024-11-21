import getClient from '../db/dbClient.js';

/**
 * Fetches all availability for a specific employee, including days and time slots.
 *
 * @param {number} empId - The employee ID.
 * @returns {Promise<Array>} - List of availability entries for the employee.
 */
export async function getEmployeeAvailability(empId) {
    const query = `
        SELECT
            a.day_of_week,
            a.start_time,
            a.end_time,
            a.start_date,
            a.end_date
        FROM
            availability a
        WHERE
            a.emp_id = $1
        ORDER BY a.day_of_week;
    `;

    const client = await getClient();
    await client.connect();

    try {
        // Execute the query to fetch the employee's full availability
        const result = await client.query(query, [empId]);
        return result.rows;
    } catch (err) {
        console.error('Error fetching employee availability:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#region Get Available Employees

/**
 * Fetches employees' availability for a specific day and date,
 * excluding those with approved time-off requests.
 *
 * @param {number} businessId - The business ID.
 * @param {string} day - The day of the week (e.g., 'Monday', 'Tuesday').
 * @param {string} date - The target date to check availability (e.g., 'YYYY-MM-DD').
 * @returns {Promise<Array>} - List of available employees.
 */
export async function getAvailableEmployees(businessId, day, date) {

    // Query to fetch available employees for the given day and date, excluding those with approved time-off requests
    const query = `
        SELECT
            e.emp_id,
            e.f_name,
            e.l_name,
            e.role_id,
            r.role_name,
            a.day_of_week,
            a.start_time,
            a.end_time
        FROM
            employees e
        JOIN
            availability a ON e.emp_id = a.emp_id
        LEFT JOIN
            requests req ON e.emp_id = req.emp_id
            AND req.status = 'Approved'
            AND $3 BETWEEN req.start_date AND req.end_date
        LEFT JOIN
            roles r ON e.role_id = r.role_id
        WHERE
            e.business_id = $1
            AND a.day_of_week = $2
            AND $3 BETWEEN a.start_date AND a.end_date
            AND req.request_id IS NULL;
    `;

    const client = await getClient();
    await client.connect();

    try {
        // Execute the query to fetch available employees
        const result = await client.query(query, [businessId, day, date]);
        return result.rows;
    } catch (err) {
        console.error('Error executing availability query:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

//#region Create Weekly Schedule

/**
 * Creates a weekly schedule for a business starting from the given week start date.
 *
 * @param {number} businessId - The ID of the business.
 * @param {string} weekStartDate - The start date of the week (YYYY-MM-DD format).
 * @returns {Promise<Object>} - The created schedule details.
 */
export async function createWeeklySchedule(businessId, weekStartDate) {
    const client = await getClient();
    await client.connect();
    console.log("Week Start Date: ", weekStartDate);

    // Convert week start date to a Date object
    const startDate = new Date(`${weekStartDate}T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 6);  // End of the week (Saturday)

    console.log("Creating weekly schedule with:", {
        businessId,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10)
    });

    // Begin transaction
    await client.query('BEGIN');
    try {
        const scheduleTitle = `Weekly Schedule ${startDate.toISOString().slice(0, 10)}`;
        const scheduleDescription = `Weekly schedule from ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`;

        // Insert new schedule into the schedules table
        const scheduleInsertQuery = `
            INSERT INTO schedules (business_id, title, description, date, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING schedule_id;
        `;
        
        console.log("Executing query:", scheduleInsertQuery);
        console.log("With values:", [
            businessId,
            scheduleTitle,
            scheduleDescription,
            startDate.toISOString().slice(0, 10),  // Explicitly using start date here
            '00:00:00',
            '23:59:59'
        ]);

        // Insert the schedule and get the schedule ID
        const scheduleResult = await client.query(scheduleInsertQuery, [
            businessId,
            scheduleTitle,
            scheduleDescription,
            startDate.toISOString().slice(0, 10),
            '00:00:00',
            '23:59:59'
        ]);
        const scheduleId = scheduleResult.rows[0].schedule_id;

        // Commit transaction
        await client.query('COMMIT');

        return { 
            scheduleId, 
            title: scheduleTitle, 
            description: scheduleDescription, 
            weekStartDate: startDate.toISOString().slice(0, 10),
            weekEndDate: endDate.toISOString().slice(0, 10) 
        };

    } catch (err) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error creating weekly schedule:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

//#region Create Shift

/**
 * Creates a shift for a specific employee.
 *
 * @param {number} employeeId - The ID of the employee.
 * @param {number} scheduleId - The ID of the schedule to which the shift belongs.
 * @param {string} date - The date of the shift (YYYY-MM-DD format).
 * @param {string} startTime - The start time of the shift (HH:MM:SS format).
 * @param {string} endTime - The end time of the shift (HH:MM:SS format).
 * @returns {Promise<Object>} - The created shift details.
 */
export async function createShift(employeeId, scheduleId, date, startTime, endTime, rowIndex) {
    const client = await getClient();
    await client.connect();

    // Debug: Log parameters to verify date is correct
    console.log("Creating shift with parameters:", {
        employeeId,
        scheduleId,
        date,
        startTime,
        endTime,
        rowIndex
    });

    // Begin transaction
    await client.query('BEGIN');
    try {
        // Insert new shift into the shifts table
        const shiftInsertQuery = `
            INSERT INTO shifts (schedule_id, emp_id, title, description, start_time, end_time, shift_status, is_open, date, row_index)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING shift_id;
        `;
        const shiftTitle = `Shift for Employee ${employeeId} on ${date}`;
        const shiftDescription = `Shift on ${date} from ${startTime} to ${endTime} for Employee ${employeeId}`;

        console.log("Executing query:", shiftInsertQuery);
        console.log("With values:", [
            scheduleId,
            employeeId,
            shiftTitle,
            shiftDescription,
            startTime,
            endTime,
            'assigned',
            false,
            date,
            rowIndex
        ]);

        // Execute shift insertion
        const shiftResult = await client.query(shiftInsertQuery, [
            scheduleId,
            employeeId,
            shiftTitle,
            shiftDescription,
            startTime,
            endTime,
            'assigned',  // Default status
            false,        // Default: not open
            date,
            rowIndex
        ]);

        // Commit transaction
        await client.query('COMMIT');
        console.log("Shift created with ID:", shiftResult.rows[0].shift_id);

        return {
            shiftId: shiftResult.rows[0].shift_id,
            scheduleId,
            employeeId,
            startTime,
            endTime,
            title: shiftTitle,
            description: shiftDescription,
            status: 'assigned',
            date,
            rowIndex
        };

    } catch (err) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error creating shift:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

/**
 * Updates an existing shift's details.
 *
 * @param {number} shiftId - The ID of the shift to update.
 * @param {Object} newShiftInfo - The new details for the shift.
 * @param {string} newShiftInfo.startTime - The new start time of the shift.
 * @param {string} newShiftInfo.endTime - The new end time of the shift.
 * @returns {Promise<void>}
 */
export async function updateShift(shiftId, newShiftInfo) {
    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    const { startTime, endTime } = newShiftInfo;

    // First, retrieve the shift details to get the date and emp_id for generating the new description
    const getShiftQuery = `
        SELECT date, emp_id
        FROM shifts
        WHERE shift_id = $1
    `;

    try {
        const shiftResult = await client.query(getShiftQuery, [shiftId]);
        
        if (shiftResult.rowCount === 0) {
            throw new Error('Shift not found');
        }

        const { date, emp_id } = shiftResult.rows[0];

        // Generate the new description
        const description = `Shift on ${date} from ${startTime} to ${endTime} for Employee ${emp_id}`;

        // SQL query to update shift information including the description
        const updateQuery = `
            UPDATE shifts
            SET start_time = $1,
                end_time = $2,
                description = $3,
                updated_at = NOW()
            WHERE shift_id = $4
        `;

        const res = await client.query(updateQuery, [startTime, endTime, description, shiftId]);
        console.log('Update Query Executed');

        if (res.rowCount > 0) {
            console.log(`Shift ID ${shiftId} updated successfully with new description: ${description}`);
        } else {
            throw new Error('Shift update failed');
        }
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

/**
 * Removes a shift by its shift_id.
 * @param {number} shiftId - The ID of the shift to be removed.
 * @returns {Promise<Object>} - Confirmation of the deleted shift.
 */
export async function removeShift(shiftId) {
    const client = await getClient();
    await client.connect();

    // Begin transaction
    await client.query('BEGIN');
    try {
        // Delete the shift by shift_id
        const deleteQuery = `DELETE FROM shifts WHERE shift_id = $1 RETURNING *;`;
        const result = await client.query(deleteQuery, [shiftId]);

        if (result.rowCount === 0) {
            throw new Error('Shift not found');
        }

        // Commit transaction
        await client.query('COMMIT');
        return { success: true, message: 'Shift removed successfully', deletedShift: result.rows[0] };

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error removing shift:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#region Get Shifts by Schedule ID

/**
 * Fetches all shifts related to a specific schedule ID.
 *
 * @param {number} scheduleId - The ID of the schedule.
 * @returns {Promise<Array>} - List of shifts related to the schedule.
 */
export async function getShiftsByScheduleId(scheduleId) {
    const client = await getClient();
    await client.connect();

    try {
        // Query to get shifts for the specified schedule ID
        const shiftQuery = `
            SELECT
                s.shift_id,
                s.emp_id,
                e.f_name,
                e.l_name,
                s.start_time,
                s.end_time,
                s.shift_status,
                s.is_open,
                s.date AS shift_date,
                s.row_index
            FROM
                shifts s
            JOIN
                employees e ON s.emp_id = e.emp_id
            JOIN
                schedules sc ON s.schedule_id = sc.schedule_id
            WHERE
                s.schedule_id = $1;
        `;

        // Execute query
        const result = await client.query(shiftQuery, [scheduleId]);

        // Return the list of shifts
        return result.rows.map(row => ({
            shiftId: row.shift_id,
            employeeId: row.emp_id,
            employeeName: `${row.f_name} ${row.l_name}`,
            date: row.shift_date,  // Date in 'YYYY-MM-DD' format
            startTime: row.start_time,
            endTime: row.end_time,
            status: row.shift_status,
            isOpen: row.is_open,
            rowIndex: row.row_index
        }));

    } catch (err) {
        console.error('Error fetching shifts:', err);
        throw err;
    } finally {
        await client.end();
    }
}

export async function getScheduleByBusinessIdAndDate(businessId, weekStartDate) {
    const client = await getClient();
    await client.connect();

    try {
        const query =` 
            SELECT schedule_id, title, description, date
            FROM schedules
            WHERE business_id = $1 AND date = $2;`
        ;
        const result = await client.query(query, [businessId, weekStartDate]);

        if (result.rows.length > 0) {
            return result.rows[0];  // Return the schedule if it exists
        } else {
            return null;  // No schedule found
        }

    } catch (err) {
        console.error('Error fetching schedule:', err);
        throw err;
    } finally {
        await client.end();
    }
}

//#endregion

//#region Create Shift Offer

/**
 * Creates a shift offer for a specified shift and employee.
 *
 * @param {number} shift_id - The unique identifier of the shift.
 * @param {number} emp_id - The ID of the employee who is making the shift offer
 * @returns {Promise<object>} - An object containing details of the created shift offer and shift history status.
 */
export async function createShiftOffer(shift_id, emp_id) {
    const client = await getClient();
    await client.connect();

    try {
        // Check if the shift_id is associated with the emp_id in the shifts table, if none, throw an error
        const associationCheckQuery = `
            SELECT 1 FROM shifts WHERE shift_id = $1 AND emp_id = $2
        `;
        const associationCheckResult = await client.query(associationCheckQuery, [shift_id, emp_id]);

        if (associationCheckResult.rowCount === 0) {
            throw new Error(`Shift ID ${shift_id} is not associated with Employee ID ${emp_id}`);
        }

        // Check if a shift offer for this shift_id and emp_id already exists, if it does, throw an error
        const offerExistsQuery = `
            SELECT 1 FROM shift_offers WHERE shift_id = $1 AND offered_emp_id = $2
        `;
        const offerExistsResult = await client.query(offerExistsQuery, [shift_id, emp_id]);

        if (offerExistsResult.rowCount > 0) {
            throw new Error(`A shift offer for Shift ID ${shift_id} and Employee ID ${emp_id} already exists`);
        }

        // Check if shift_id exists in shift_history
        const historyCheckQuery = `
            SELECT 1 FROM shift_history WHERE shift_id = $1
        `;
        const historyCheckResult = await client.query(historyCheckQuery, [shift_id]);

        // If the shift is not in shift_history, fetch shift details and create an entry
        if (historyCheckResult.rowCount === 0) {
            const shiftQuery = `
                SELECT emp_id AS current_emp_id, start_time AS current_start_time, end_time AS current_end_time
                FROM shifts
                WHERE shift_id = $1
            `;
            const shiftResult = await client.query(shiftQuery, [shift_id]);

            if (shiftResult.rowCount === 0) {
                throw new Error(`Shift with ID ${shift_id} not found`);
            }

            const { current_emp_id, current_start_time, current_end_time } = shiftResult.rows[0];

            // Insert a new entry into shift_history
            const historyInsertQuery = `
                INSERT INTO shift_history (
                    shift_id, previous_emp_id, current_emp_id, old_start_time, current_start_time,
                    old_end_time, current_end_time, status, change_date
                )
                VALUES ($1, NULL, $2, $3, $3, $4, $4, 'confirmed', CURRENT_TIMESTAMP)
                RETURNING shift_history_id
            `;
            await client.query(historyInsertQuery, [shift_id, current_emp_id, current_start_time, current_end_time]);
            console.log('Shift history created successfully for shift_id:', shift_id);
        }

        // Update the shift to open on the shifts table
        const updateQuery = `UPDATE shifts SET is_open = true WHERE shift_id = $1`;
        await client.query(updateQuery, [shift_id]);

        // PostgreSQL query to insert a new shift offer
        const offerInsertQuery = `
            INSERT INTO shift_offers (shift_id, offered_emp_id, offer_status, offered_at)
            VALUES ($1, $2, 'offered', CURRENT_TIMESTAMP)
            RETURNING shift_offer_id, shift_id, offered_emp_id, offer_status, offered_at;
        `;

        const offerResult = await client.query(offerInsertQuery, [shift_id, emp_id]);
        console.log('Shift offer created successfully:', offerResult.rows[0]);

        // Return the created shift
        return {
            shiftOffer: offerResult.rows[0],
            message: historyCheckResult.rowCount === 0 ? 'Shift history created' : 'Shift history already exists'
        };
    } catch (err) {
        console.error('Error creating shift offer:', err); // Log error for debugging
        throw err; // Rethrow error for higher-level handling
    } finally {
        await client.end(); // Ensure database connection is closed
        console.log('Database connection closed');
    }
}

//#endregion

//#region Accept Shift Offer

/**
 * Accepts a shift offer for a specified shift and employee.
 *
 * @param {number} shift_id - The unique identifier of the shift.
 * @param {number} emp_id - The ID of the employee accepting the shift.
 * @returns {Promise<object>} - An object containing details of the updated shift offer and shift history status.
 */
export async function acceptShiftOffer(shift_id, emp_id) {
    const client = await getClient();
    await client.connect();

    try {
        // Retrieve the offered_emp_id and business_id for the shift offer
        const offerQuery = `
            SELECT so.offered_emp_id, e1.business_id AS offered_business_id, e1.role_id AS offered_role_id
            FROM shift_offers so
            JOIN employees e1 ON so.offered_emp_id = e1.emp_id
            WHERE so.shift_id = $1 AND so.offer_status = 'offered';
        `;
        const offerResult = await client.query(offerQuery, [shift_id]);

        if (offerResult.rowCount === 0) {
            throw new Error(`No open shift offer found for Shift ID ${shift_id}`);
        }

        const { offered_emp_id, offered_business_id, offered_role_id } = offerResult.rows[0];

        // Ensure that the accepting emp_id is different from the offered_emp_id
        if (offered_emp_id === emp_id) {
            throw new Error('The offered and accepting employees must be different.');
        }

        // Check that the accepting employee belongs to the same business as the offering employee
        const acceptingEmployeeQuery = `
            SELECT business_id, role_id FROM employees WHERE emp_id = $1;
        `;
        const acceptingEmployeeResult = await client.query(acceptingEmployeeQuery, [emp_id]);

        if (acceptingEmployeeResult.rowCount === 0) {
            throw new Error(`Employee ID ${emp_id} not found`);
        }

        const { business_id: acceptingBusinessId, role_id: accepted_role_id } = acceptingEmployeeResult.rows[0];

        if (offered_business_id !== acceptingBusinessId) {
            throw new Error('Both employees must be associated with the same business.');
        }

        // Check business preferences to see if role restriction is enabled, if it is, will ensure shifts are only accepted by employees with the same role
        const preferenceQuery = `
            SELECT 1 FROM business_preferences bp
            JOIN preferences p ON bp.preference_id = p.preference_id
            WHERE bp.business_id = $1 AND p.preference_description = 'Restrict shift offers to same role?'
        `;
        const preferenceResult = await client.query(preferenceQuery, [offered_business_id]);

        const restrictToSameRole = preferenceResult.rowCount > 0; // True if preference exists, false otherwise

        if (restrictToSameRole && offered_role_id !== accepted_role_id) {
            throw new Error('Shift offers are restricted to employees with the same role.');
        }

        // Update the shift offer to accepted
        const offerUpdateQuery = `
            UPDATE shift_offers
            SET offer_status = 'accepted', accepted_emp_id = $1, accepted_at = CURRENT_TIMESTAMP
            WHERE shift_id = $2 AND offered_emp_id = $3
            RETURNING shift_offer_id, shift_id, offer_status, accepted_emp_id, accepted_at;
        `;
        const offerUpdateResult = await client.query(offerUpdateQuery, [emp_id, shift_id, offered_emp_id]);

        // Update the shift to closed on the shifts table
        const updateIsOpenQuery = `UPDATE shifts SET is_open = false WHERE shift_id = $1`;
        await client.query(updateIsOpenQuery, [shift_id]);

        // Update the emp_id on shifts table
        const updateEmployeeShiftsQuery = `UPDATE shifts SET emp_id = $1 WHERE shift_id = $2`;
        await client.query(updateEmployeeShiftsQuery, [emp_id, shift_id]);

        // Check if a shift history entry already exists for this shift_id
        const historyCheckQuery = `
            SELECT shift_history_id, current_emp_id, change_type
            FROM shift_history WHERE shift_id = $1 ORDER BY change_date DESC LIMIT 1
        `;
        const historyCheckResult = await client.query(historyCheckQuery, [shift_id]);

        /*
        * If a shift history entry exists, update it with the new emp_id and add to change_type "Employee Change"
        * If no shift history entry exists, create a new entry
        */
        if (historyCheckResult.rowCount > 0) {
            const { shift_history_id, current_emp_id: previousEmpId, change_type } = historyCheckResult.rows[0];

            const newChangeType = change_type ? `${change_type}, Employee Change` : 'Employee Change';

            const historyUpdateQuery = `
                UPDATE shift_history
                SET previous_emp_id = $1, current_emp_id = $2, change_type = $3, change_date = CURRENT_TIMESTAMP
                WHERE shift_history_id = $4
                RETURNING shift_history_id, shift_id, previous_emp_id, current_emp_id, change_type, change_date;
            `;
            const historyUpdateResult = await client.query(historyUpdateQuery, [previousEmpId, emp_id, newChangeType, shift_history_id]);

            console.log('Shift history updated for shift_id:', shift_id);
            return {
                shiftOffer: offerUpdateResult.rows[0],
                shiftHistory: historyUpdateResult.rows[0]
            };
        } else {
            const historyInsertQuery = `
                INSERT INTO shift_history (
                    shift_id, previous_emp_id, current_emp_id, change_type, change_date, status
                )
                VALUES ($1, NULL, $2, 'Employee Change', CURRENT_TIMESTAMP, 'confirmed')
                RETURNING shift_history_id, shift_id, previous_emp_id, current_emp_id, change_type, change_date, status;
            `;
            const historyInsertResult = await client.query(historyInsertQuery, [shift_id, emp_id]);

            console.log('New shift history created for shift_id:', shift_id);
            return {
                shiftOffer: offerUpdateResult.rows[0],
                shiftHistory: historyInsertResult.rows[0]
            };
        }
    } catch (err) {
        console.error('Error accepting shift offer:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

//#endregion

//#region Cancel Shift Offer

/**
 * Cancels a shift offer for a specific shift and employee.
 * Updates the offer status to 'cancelled', resets accepted_at, and sets accepted_emp_id to offered_emp_id.
 *
 * @param {number} shift_id - The unique identifier of the shift.
 * @param {number} emp_id - The ID of the employee who was offered the shift.
 * @returns {Promise<object>} - An object containing details of the cancelled shift offer.
 */
export async function cancelShiftOffer(shift_id, emp_id) {
    const client = await getClient();
    await client.connect();

    try {
        // Check if the shift offer exists and its current status
        const checkQuery = `
            SELECT offer_status, offered_emp_id, accepted_emp_id 
            FROM shift_offers 
            WHERE shift_id = $1 AND offered_emp_id = $2;
        `;
        const checkResult = await client.query(checkQuery, [shift_id, emp_id]);

        if (checkResult.rowCount === 0) {
            throw new Error(`No active shift offer found for Shift ID ${shift_id} and Employee ID ${emp_id}`);
        }

        const { offer_status, offered_emp_id, accepted_emp_id } = checkResult.rows[0];

        // Prevent cancellation if the shift offer is already accepted
        if (offer_status === 'accepted') {
            throw new Error(
                `Cannot cancel the shift offer for Shift ID ${shift_id} and Employee ID ${emp_id} as it has already been accepted by Employee ID ${accepted_emp_id}`
            );
        }

        // Prevent duplicate cancellations
        if (offer_status === 'cancelled') {
            throw new Error(`Shift offer for Shift ID ${shift_id} and Employee ID ${emp_id} is already cancelled`);
        }

        // Update the offer status to 'cancelled', reset accepted_at, and set accepted_emp_id to offered_emp_id
        const cancelQuery = `
            UPDATE shift_offers
            SET offer_status = 'cancelled', accepted_at = NULL, accepted_emp_id = $1
            WHERE shift_id = $2 AND offered_emp_id = $3
            RETURNING shift_offer_id, shift_id, offered_emp_id, accepted_emp_id, offer_status, accepted_at;
        `;
        const cancelResult = await client.query(cancelQuery, [offered_emp_id, shift_id, emp_id]);

        console.log(`Shift offer for Shift ID ${shift_id} and Employee ID ${emp_id} has been cancelled successfully.`);
        return cancelResult.rows[0];
    } catch (err) {
        console.error('Error cancelling shift offer:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

//#endregion

/**
 * Searches for shift offers created by a specific employee.
 *
 * @param {number} emp_id - The ID of the employee who offered the shifts.
 * @returns {Promise<Array>} - A list of shift offers created by the employee.
 */
export async function searchEmployeeShiftOffers(emp_id) {
    const client = await getClient();
    await client.connect();

    try {
        // Query to fetch shift offers created by the employee
        const query = `
            SELECT
                so.shift_offer_id,
                so.shift_id,
                so.offer_status,
                so.offered_at,
                sh.date AS shift_date,
                sh.start_time,
                sh.end_time,
                e.f_name,
                e.l_name,
                so.accepted_emp_id
            FROM
                shift_offers so
            JOIN
                shifts sh ON so.shift_id = sh.shift_id
            JOIN
                employees e ON sh.emp_id = e.emp_id
            WHERE
                so.offered_emp_id = $1
            ORDER BY
                so.offered_at DESC;
        `;

        const result = await client.query(query, [emp_id]);

        // Map result rows to desired format
        return result.rows.map(row => ({
            shiftOfferId: row.shift_offer_id,
            shiftId: row.shift_id,
            status: row.offer_status,
            offeredAt: row.offered_at,
            date: row.shift_date,
            startTime: row.start_time,
            endTime: row.end_time,
            employeeName: `${row.f_name} ${row.l_name}`,
            acceptedEmpId: row.accepted_emp_id,
        }));
    } catch (err) {
        console.error('Error searching employee shift offers:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

//#region Search Open Shift Offers

/**
 * Searches for open shift offers for a specific employee in a business.
 * Filters results based on the 'Restrict shift offers to same role?' business preference.
 * If the preference is false, will show all shifts open in the business.
 * Otherwise will only show the shifts open of the same role as the employee.
 *
 * @param {number} emp_id - The ID of the employee searching for shift offers.
 * @param {number} business_id - The ID of the business the employee works at.
 * @returns {Promise<Array>} - A list of open shift offers and the shift information matching the criteria.
 */
export async function searchOpenShiftOffers(emp_id, business_id) {
    const client = await getClient();
    await client.connect();

    try {
        // Validate emp_id and business_id match
        const employeeQuery = `
            SELECT business_id, role_id
            FROM employees
            WHERE emp_id = $1;
        `;
        const employeeResult = await client.query(employeeQuery, [emp_id]);

        if (employeeResult.rowCount === 0) {
            throw new Error(`Employee with ID ${emp_id} not found`);
        }

        const { business_id: employeeBusinessId, role_id } = employeeResult.rows[0];

        if (employeeBusinessId !== business_id) {
            throw new Error(`Employee with ID ${emp_id} does not belong to Business ID ${business_id}`);
        }

        // Check the business preferences for 'Restrict shift offers to same role?', if the preference exists it is true
        const preferenceQuery = `
            SELECT 1
            FROM business_preferences bp
            JOIN preferences p ON bp.preference_id = p.preference_id
            WHERE bp.business_id = $1 AND p.preference_description = 'Restrict shift offers to same role?';
        `;
        const preferenceResult = await client.query(preferenceQuery, [business_id]);

        const restrictToSameRole = preferenceResult.rowCount > 0;

        // Query open shift offers and shift data
        const shiftOffersQuery = restrictToSameRole
            ? `
                SELECT sh.*, so.offered_emp_id, so.offer_status, so.offered_at
                FROM shifts sh
                JOIN shift_offers so ON sh.shift_id = so.shift_id
                JOIN employees e ON so.offered_emp_id = e.emp_id
                WHERE so.offer_status = 'offered'
                  AND e.business_id = $1
                  AND e.role_id = $2;
              `
            : `
                SELECT sh.*, so.offered_emp_id, so.offer_status, so.offered_at
                FROM shifts sh
                JOIN shift_offers so ON sh.shift_id = so.shift_id
                JOIN employees e ON so.offered_emp_id = e.emp_id
                WHERE so.offer_status = 'offered'
                  AND e.business_id = $1;
              `;

        const shiftOffersParams = restrictToSameRole ? [business_id, role_id] : [business_id];
        const shiftOffersResult = await client.query(shiftOffersQuery, shiftOffersParams);

        console.log(`Found ${shiftOffersResult.rowCount} open shift offers for Employee ID ${emp_id}`);
        return shiftOffersResult.rows;
    } catch (err) {
        console.error('Error searching open shift offers:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

//#endregion