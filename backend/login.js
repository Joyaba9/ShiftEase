import getClient from './dbClient.js';

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
        const res = await client.query(query, [businessId, userId]);
        console.log('Query Executed');
        // If the employee is found, return the employee
        if (res.rows.length > 0) {
            const employee = res.rows[0];
            console.log(`Employee found: ${JSON.stringify(employee)}`);
            return employee;
        } else {
            // If the employee is not found, throw an error
            throw new Error('Employee not found');
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