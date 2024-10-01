import getClient from './dbClient.js';

// Default password is MMYY + last 4 digits of SSN
async function CreateDefaultPassword(employeeId) {

    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    const query = `SELECT
                    RIGHT(last4ssn, 4) AS last4ssn,
                    TO_CHAR(birthday, 'MMYY') AS birthdate
                    FROM employees
                    WHERE emp_id = $1`;

    try {
        const res = await client.query(query, [employeeId]);
        console.log('Query Executed');
        if (res.rows.length > 0) {
            const { last4ssn, birthdate } = res.rows[0];
            const defaultPassword = `${birthdate}${last4ssn}`;
            console.log(`Default password for employee ID ${employeeId}: ${defaultPassword}`);
            return defaultPassword;
        } else {
            throw new Error('Employee not found');
        }
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

CreateDefaultPassword().then(password => console.log('Password:', password)).catch(err => console.error('Error:', err));