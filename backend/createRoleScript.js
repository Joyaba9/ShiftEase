import getClient from './dbClient.js';

// Function to create a new role
export async function CreateRole(roleName) {
    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    // Query to insert a new role
    const query = `INSERT INTO roles (role_name)
                    VALUES ($1) RETURNING role_id`;

    // Execute the query
    try {
        const res = await client.query(query, [roleName]);
        console.log('Query Executed');
        // Check if the insert was successful
        if (res.rowCount > 0) {
            console.log(`Role ID ${res.rows[0].role_id} created successfully`);
        } else {
            // If the role is not created, throw an error
            throw new Error('Role not created');
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

/* Example usage
const roleName = 'Administrator';
CreateRole(roleName)
    .then(() => console.log('Role created successfully'))
    .catch(err => console.error('Error creating role:', err));
*/