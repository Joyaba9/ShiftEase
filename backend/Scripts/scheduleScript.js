import getClient from '../db/dbClient.js';

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