import bcrypt from 'bcrypt';
import getClient from '../db/dbClient.js';

//#region Get Business Details

/**
 * Retrieves business details based on a provided email address.
 *
 * @param {string} business_email - The email address associated with the business.
 * @returns {Promise<Object>} - An object containing business ID, name, and email.
 */
export async function getBusinessDetails(business_email) {
    const client = await getClient(); // Initialize the database client
    console.log("===================");
    console.log('Database Client Obtained by getBusinessDetails');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // SQL query to fetch business details by email
    const query = `SELECT business_id, business_name, business_email FROM business WHERE LOWER(business_email) = LOWER($1)`;

    try {
        const res = await client.query(query, [business_email]); // Execute query
        console.log('Query Executed');
        
        // If business is found, return its details
        if (res.rows.length > 0) {
            return res.rows[0];
        } else {
            throw new Error(`Business not found for email: ${business_email}`);
        };
    } catch (err) {
        console.error('Error executing query:', err); // Log error details
        throw err; // Rethrow for higher-level handling
    } finally {
        await client.end(); // Close database connection
        console.log('Database connection closed');
    }
}

//#endregion

//#region Save Business Location

/**
 * Saves or updates business location details in the database.
 *
 * @param {Object} businessLocationData - Data object containing location details such as address, business hours, and contact information.
 * @returns {Promise<number>} - The unique ID of the saved or updated business location.
 */
export async function saveBusinessLocation(businessLocationData) {
    const client = await getClient(); // Initialize the database client
    console.log("===================");
    console.log('Database Client Obtained by saveBusinessLocation');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // SQL query to check if location with the specified business ID and address already exists
    const checkQuery = `SELECT business_locations_id FROM business_locations WHERE business_id = $1 AND street_address = $2`;

    try {
        // Execute query to check for existing location
        const checkRes = await client.query(checkQuery, [businessLocationData.business_id, businessLocationData.street_address]);

        // Organize business hours into JSON format
        const businessHours = {
            Monday: businessLocationData.Monday,
            Tuesday: businessLocationData.Tuesday,
            Wednesday: businessLocationData.Wednesday,
            Thursday: businessLocationData.Thursday,
            Friday: businessLocationData.Friday,
            Saturday: businessLocationData.Saturday,
            Sunday: businessLocationData.Sunday,
        };

        if (checkRes.rows.length > 0) {
            // If location exists, perform an update
            const updateQuery = `
                UPDATE business_locations
                SET
                    city = $1,
                    state = $2,
                    zipcode = $3,
                    phone_number = $4,
                    business_hours = $5,
                    updated_at = NOW()
                WHERE business_locations_id = $6
                RETURNING business_locations_id;
            `;

            const updateParams = [
                businessLocationData.city,
                businessLocationData.state,
                businessLocationData.zipcode,
                businessLocationData.phone_number,
                JSON.stringify(businessHours), // Convert business hours to JSON
                checkRes.rows[0].business_locations_id // Use existing location ID
            ];

            const updateRes = await client.query(updateQuery, updateParams);
            console.log('Business Location Updated Successfully');

            return updateRes.rows[0].business_locations_id; // Return updated location ID

        } else {
            // Insert new location if it does not exist
            const insertQuery = `
                INSERT INTO business_locations (
                    business_id,
                    street_address,
                    city,
                    state,
                    zipcode,
                    phone_number,
                    business_hours,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                RETURNING business_locations_id;
            `;

            const insertParams = [
                businessLocationData.business_id,
                businessLocationData.street_address,
                businessLocationData.city,
                businessLocationData.state,
                businessLocationData.zipcode,
                businessLocationData.phone_number,
                JSON.stringify(businessHours)
            ];

            const insertRes = await client.query(insertQuery, insertParams);
            console.log('New Business Location Saved Successfully');

            return insertRes.rows[0].business_locations_id; // Return new location ID
        }
    } catch (err) {
        console.error('Error saving or updating business location:', err); // Log any errors
        throw err; // Rethrow for higher-level error handling
    } finally {
        await client.end(); // Ensure the database connection is closed
        console.log('Database connection closed');
    }
}

//#endregion

//#region Get Business ID from Email

/**
 * Retrieves the business ID for a specified email address.
 *
 * @param {string} business_email - The email associated with the business.
 * @returns {Promise<number>} - The unique business ID if found.
 */
export async function getBusinessById(business_email) {
    const client = await getClient(); // Initialize the database client
    console.log('Database Client Obtained');

    await client.connect(); // Establish connection with the database
    console.log('Connected to Database');

    // Log the email address used for querying
    console.log('Querying for business_email:', business_email);

    // SQL query to fetch business ID by email
    const query = `SELECT business_id FROM business WHERE LOWER(business_email) = LOWER($1)`;

    try {
        const res = await client.query(query, [business_email]); // Execute query
        console.log('Query Executed');
        
        // Check if business ID exists and return
        if (res.rows.length > 0) {
            return res.rows[0].business_id;
        } else {
            throw new Error(`Business not found for email: ${business_email}`);
        }
    } catch (err) {
        console.error('Error executing query:', err); // Log error details
        throw err; // Rethrow for higher-level handling
    } finally {
        await client.end(); // Close database connection
        console.log('Database connection closed');
    }
}

//#endregion

//#region Register Business

/**
 * Registers a new business by checking for existing records and inserting new data.
 *
 * @param {string} businessName - The name of the business to register.
 * @param {string} businessEmail - The email of the business to register.
 * @param {string} password - The password for the business account.
 * @returns {Promise<Object>} - An object indicating success or failure of the registration.
 */
export async function registerBusiness(businessName, businessEmail, password) {
    let client;

    try {
        // Get the PostgreSQL client from Cloud SQL
        client = await getClient();
        await client.connect(); // Establish connection to the database

        // Check if the business already exists by name
        const existingBusinessName = await client.query(
            'SELECT * FROM business WHERE business_name = $1', 
            [businessName]
        );
        if (existingBusinessName.rows.length > 0) {
            return { success: false, message: 'Business name already exists' };
        }

        // Check if the business already exists by email
        const existingBusinessEmail = await client.query(
            'SELECT * FROM business WHERE business_email = $1', 
            [businessEmail]
        );
        if (existingBusinessEmail.rows.length > 0) {
            return { success: false, message: 'Business email already exists' };
        }

        // Hash the password for security
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const passHash = await bcrypt.hash(password, saltRounds);
        console.log('Password hashed successfully');

        // Insert the new business into the database
        const query = `
            INSERT INTO business (business_name, business_email, pass_hash, created_at, updated_at) 
            VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`;
        const values = [businessName, businessEmail, passHash];
        
        const result = await client.query(query, values);
        console.log('Business inserted successfully');

        // Return the newly created business data
        return { success: true, data: result.rows[0] };
    } catch (err) {
        // Log any errors during the registration process
        console.error('Error during registration process:', err);
        throw err; // Rethrow error for higher-level handling
    } finally {
        // Ensure the client connection is closed even if an error occurs
        if (client) {
            try {
                await client.end();
                console.log('Database client connection closed');
            } catch (closeError) {
                console.error('Error closing database client connection:', closeError);
            }
        }
    }
}

//#endregion