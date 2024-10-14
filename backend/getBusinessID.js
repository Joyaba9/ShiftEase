import getClient from './dbClient.js';

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

// Example usage (uncomment to test)
//getBusinessById("test@business.com").then(business_id => console.log('BusinessID:', business_id)).catch(err => console.error('Error:', err));