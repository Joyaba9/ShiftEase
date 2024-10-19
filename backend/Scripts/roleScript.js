import getClient from '../db//dbClient.js';

//#region Create Role

/**
 * Creates a new role within the database.
 *
 * @param {string} roleName - The name of the role to be created (e.g., "Manager", "Employee").
 * @returns {Promise<void>} - A promise indicating the role creation success or failure.
 */
export async function CreateRole(roleName) {
    const client = await getClient(); // Initialize the database client
    console.log('Database Client Obtained');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // SQL query to insert a new role into the roles table
    const query = `INSERT INTO roles (role_name) VALUES ($1) RETURNING role_id`;

    try {
        const res = await client.query(query, [roleName]); // Execute query to insert the role
        console.log('Query Executed');
        
        // Confirm successful insertion of the new role
        if (res.rowCount > 0) {
            console.log(`Role ID ${res.rows[0].role_id} created successfully`);
        } else {
            throw new Error('Role not created'); // Handle failure to create a role
        }
    } catch (err) {
        console.error('Error executing query:', err); // Log any errors
        throw err; // Rethrow error for higher-level handling
    } finally {
        await client.end(); // Ensure database connection is closed
        console.log('Database connection closed');
    }
}

//#endregion