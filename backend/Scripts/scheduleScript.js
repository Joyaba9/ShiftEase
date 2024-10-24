import getClient from '../db/dbClient.js';

/**
 * Fetches employees' availability for a specific day and date,
 * xcluding those with approved time-off requests.
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
            a.day_of_week,
            a.start_time,
            a.end_time
        FROM
            employees e
        JOIN
            availability a ON e.emp_id = a.emp_id
        LEFT JOIN
            requests r ON e.emp_id = r.emp_id
            AND r.status = 'Approved'
            AND $3 BETWEEN r.start_date AND r.end_date
        WHERE
            e.business_id = $1
            AND a.day_of_week = $2
            AND $3 BETWEEN a.start_date AND a.end_date
            AND r.request_id IS NULL;
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

    // Convert week start date to a Date object
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);  // End of the week (Saturday)

    // Begin transaction
    await client.query('BEGIN');
    try {
        // Insert new schedule into the schedules table
        const scheduleInsertQuery = `
            INSERT INTO schedules (business_id, title, description, date, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING schedule_id;
        `;
        const scheduleTitle = `Weekly Schedule ${weekStartDate}`;
        const scheduleDescription = `Weekly schedule from ${weekStartDate} to ${endDate.toISOString().slice(0, 10)}`;

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

        return { scheduleId, title: scheduleTitle, description: scheduleDescription, weekStartDate, weekEndDate: endDate.toISOString().slice(0, 10) };

    } catch (err) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error creating weekly schedule:', err);
        throw err;
    } finally {
        await client.end();
    }
}

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
export async function createShift(employeeId, scheduleId, date, startTime, endTime) {
    const client = await getClient();
    await client.connect();

    // Begin transaction
    await client.query('BEGIN');
    try {
        // Insert new shift into the shifts table
        const shiftInsertQuery = `
            INSERT INTO shifts (schedule_id, emp_id, title, description, start_time, end_time, shift_status, is_open)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING shift_id;
        `;
        const shiftTitle = `Shift for Employee ${employeeId} on ${date}`;
        const shiftDescription = `Shift on ${date} from ${startTime} to ${endTime} for Employee ${employeeId}`;

        // Execute shift insertion
        const shiftResult = await client.query(shiftInsertQuery, [
            scheduleId,
            employeeId,
            shiftTitle,
            shiftDescription,
            startTime,
            endTime,
            'assigned',  // Default status
            false        // Default: not open
        ]);

        // Commit transaction
        await client.query('COMMIT');

        return {
            shiftId: shiftResult.rows[0].shift_id,
            scheduleId,
            employeeId,
            date,
            startTime,
            endTime,
            title: shiftTitle,
            description: shiftDescription,
            status: 'assigned'
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
                TO_CHAR(sc.date, 'YYYY-MM-DD') AS schedule_date
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
            date: row.schedule_date,  // Date in 'YYYY-MM-DD' format
            startTime: row.start_time,
            endTime: row.end_time,
            status: row.shift_status,
            isOpen: row.is_open
        }));

    } catch (err) {
        console.error('Error fetching shifts:', err);
        throw err;
    } finally {
        await client.end();
    }
}