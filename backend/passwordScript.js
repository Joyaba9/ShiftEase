import getClient from './dbClient.js';

// Default password is MMYY + last 4 digits of SSN
async function CreateDefaultPassword(employeeId) {

    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    // Query to get the last 4 digits of SSN and birthdate (MMYY) of the employee
    const query = `SELECT
                    RIGHT(last4ssn, 4) AS last4ssn,
                    TO_CHAR(birthday, 'MMYY') AS birthdate
                    FROM employees
                    WHERE emp_id = $1`;

    // Execute the query
    try {
        const res = await client.query(query, [employeeId]);
        console.log('Query Executed');
        // If the employee is found, return the default password (MMYY + last 4 digits of SSN)
        if (res.rows.length > 0) {
            const { last4ssn, birthdate } = res.rows[0];
            // Default password is MMYY + last 4 digits of SSN
            const defaultPassword = `${birthdate}${last4ssn}`;
            console.log(`Default password for employee ID ${employeeId}: ${defaultPassword}`);
            // Return the default password
            return defaultPassword;
        } else {
            // If the employee is not found, throw an error
            throw new Error('Employee not found');
        }
    } catch (err) {
        // Log and throw any errors that occur during the query
        console.error('Error executing query:', err);
        throw err;
    } finally {
        // Close the database connection
        await client.end();
        console.log('Database connection closed');
    }
}

// Example usage.
CreateDefaultPassword(1).then(password => console.log('Password:', password)).catch(err => console.error('Error:', err));