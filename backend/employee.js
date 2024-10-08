import getClient from './dbClient.js';

// Fetch all employees for a specific business
export async function fetchEmployees(businessId) {
    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    // Query to get all employees for the given business ID
    const query = `SELECT * FROM employees WHERE business_id = $1`;

    // Execute the query
    try {
        const res = await client.query(query, [businessId]);
        console.log('Query Executed');
        // Return the list of employees
        return res.rows;
    } catch (err) {
        // Log and throw any errors that occur during the query
        console.error('Error executing query:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

// Example usage (uncomment to test)
// fetchEmployees("598984").then(employees => console.log('Employees:', employees)).catch(err => console.error('Error:', err));
