import bcrypt from 'bcrypt';
import getClient from '../db/dbClient.js';

//#region Get Business Details

// Function to retrieve business details based on the business email
export async function getBusinessDetails(business_email) {
    // Obtain a database client
    const client = await getClient();
    console.log("===================");
    console.log('Database Client Obtained by getBusinessDetails');

    // Connect to the database
    await client.connect();
    console.log('Connected to Database');

    // SQL query to select the business ID, name, and email for the given business email
    const query = `SELECT business_id, business_name, business_email FROM business WHERE LOWER(business_email) = LOWER($1)`;

    // Execute the query
    try {
        const res = await client.query(query, [business_email]);
        console.log('Query Executed');
        // If a business is found, return its details
        if (res.rows.length > 0) {
            return res.rows[0];
        } else {
            throw new Error(`Business not found for email: ${business_email}`);
        };
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
//Testing Purposes:
//getBusinessDetails("test@business.com").then(business_id => console.log('BusinessID:', business_id)).catch(err => console.error('Error:', err));

//#endregion

//#region Save Business Location

// Function to save or update a business location
export async function saveBusinessLocation(businessLocationData) {
    // Obtain a database client
    const client = await getClient();
    console.log("===================");
    console.log('Database Client Obtained by saveBusinessLocation');

    // Connect to the database
    await client.connect();
    console.log('Connected to Database');

    // First, check if a location with this business_location_id and street address exists
    const checkQuery = `SELECT business_locations_id FROM business_locations WHERE business_id = $1 AND street_address = $2`;

    try {
        // Execute the query to check for existing location
        const checkRes = await client.query(checkQuery, [businessLocationData.business_id, businessLocationData.street_address]);

        // Create a business hours object 
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
            // If the location exists, update the information

            // SQL query to update the existing business location
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

            // Parameters for the update query
            const updateParams = [
                businessLocationData.city,
                businessLocationData.state,
                businessLocationData.zipcode,
                businessLocationData.phone_number,
                JSON.stringify(businessHours), // Convert business hours to JSON format
                checkRes.rows[0].business_locations_id // ID of the existing location
            ];

            // Execute the update query
            const updateRes = await client.query(updateQuery, updateParams);
            console.log('Business Location Updated Successfully');

            // Return the ID of the updated business location
            return updateRes.rows[0].business_locations_id;

        } else {
            // If location doesn't exist, insert a new one

            // SQL query to insert a new business location
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

            // Parameters to insert into the query
            const insertParams = [
                businessLocationData.business_id,
                businessLocationData.street_address,
                businessLocationData.city,
                businessLocationData.state,
                businessLocationData.zipcode,
                businessLocationData.phone_number,
                JSON.stringify(businessHours) // Convert business hours to JSON format
            ];

            // Execute the insert query
            const insertRes = await client.query(insertQuery, insertParams);
            console.log('New Business Location Saved Successfully');

            // Return the ID of the newly inserted business location
            return insertRes.rows[0].business_locations_id;
        }
    } catch (err) {
        // Log and re-throw any errors that occur during the save or update
        console.error('Error saving or updating business location:', err);
        throw err;
    } finally {
        // Close the database connection
        await client.end();
        console.log('Database connection closed');
    }
}

//#endregion

//#region Get Business ID from Email

// Business ID for a specific business
export async function getBusinessById(business_email) {
    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    // Log the business_email being queried
    console.log('Querying for business_email:', business_email);

    // Query to get all business_id for the given business_email
    const query = `SELECT business_id FROM business WHERE LOWER(business_email) = LOWER($1)`;

    // Execute the query
    try {
        const res = await client.query(query, [business_email]);
        console.log('Query Executed');
        // Return the list of business_id
        if (res.rows.length > 0) {
            return res.rows[0].business_id;
        } else {
            throw new Error(`Business not found for email: ${business_email}`);
        };
    } catch (err) {
        // Log and throw any errors that occur during the query
        console.error('Error executing query:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

//#endregion

//#region Register Business

// Function to register a new business
export async function registerBusiness(businessName, businessEmail, password) {
    console.log('Received registration request');
    console.log('Business Name:', businessName, 'Business Email:', businessEmail);

    if (!businessName || !businessEmail || !password) {
        console.log('Missing required fields');
        throw new Error('Please enter all fields');
    }

    try {
        // Get the PostgreSQL client from Cloud SQL
        const client = await getClient();
        await client.connect();

        // Check if the business already exists by name
        const existingBusinessName = await client.query('SELECT * FROM business WHERE business_name = $1', [businessName]);
        if (existingBusinessName.rows.length > 0) {
            console.log('Business name already exists');
            throw new Error('Business name already exists');
        }

        // Check if the business already exists by email
        const existingBusinessEmail = await client.query('SELECT * FROM business WHERE business_email = $1', [businessEmail]);
        if (existingBusinessEmail.rows.length > 0) {
            console.log('Business email already exists');
            throw new Error('Business email already exists');
        }

        // Hash the password
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new business into the database
        await client.query('INSERT INTO business (business_name, business_email, password) VALUES ($1, $2, $3)', [businessName, businessEmail, hashedPassword]);

        console.log('Business registered successfully');
        return { message: 'Business registered successfully' };
    } catch (err) {
        console.error('Error registering business:', err);
        throw err;
    }
}

//#endregion