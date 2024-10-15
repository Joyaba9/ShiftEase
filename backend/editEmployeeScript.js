import getClient from './dbClient.js';

// Function to update employee information
async function UpdateEmployee(employeeId, newEmployeeInfo) {
    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    // Destructure the new employee information
    const { role_id, f_name, l_name, email, last4ssn, birthday } = newEmployeeInfo;

    // Query to update the employee information
    const query = `UPDATE employees
                    SET role_id = $1,
                        f_name = $2,
                        l_name = $3,
                        email = $4,
                        last4ssn = $5,
                        birthday = $6,
                        updated_at = NOW()
                    WHERE emp_id = $7`;

    // Execute the query
    try {
        const res = await client.query(query, [role_id, f_name, l_name, email, last4ssn, birthday, employeeId]);
        console.log('Query Executed');
        // Check if the update was successful
        if (res.rowCount > 0) {
            console.log(`Employee ID ${employeeId} updated successfully`);
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

// Export the UpdateEmployee function
export { UpdateEmployee };
