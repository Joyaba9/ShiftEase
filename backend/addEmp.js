import getClient from './dbClient.js';

export async function AddEmployee(role, fName, lName, email, ssn, dob) {
    let roleID;
    let createdAt;
    let updatedAt;

    //for testing purposes, remove once firebase auth is put
    const business_id = 598984;


    // Assign role_id based on the role
    if (role === 'Employee') {
        roleID = 2;
    } else if (role === 'Manager') {
        roleID = 1;
    } else {
        throw new Error('Invalid role specified');
    }

    const client = await getClient();
    console.log('Database Client Obtained');

    await client.connect();
    console.log('Connected to Database');

    const query = `INSERT INTO employees (business_id, role_id, f_name, l_name, email, created_at, updated_at, last4ssn, birthday) 
                   VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, $7)`;
    console.log('Preparing query:', query);

    // Execute the query
    try {
        const res = await client.query(query, [business_id, roleID, fName, lName, email, ssn, dob]);
        console.log('Query Executed');
        return res.rows;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}


