import getClient from './dbClient.js';
import { auth, db, createUserWithEmailAndPassword } from './firebase.js'; 
import { doc, setDoc } from 'firebase/firestore';

export async function AddEmployee(role, fName, lName, email, ssn, dob, businessId) {
    let roleID;
    let createdAt = new Date();
    let updatedAt = new Date();

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

    businessId = 598984; // Hardcoded business ID for now

    // Define the query for inserting employee data
    const insertQuery = `INSERT INTO employees (business_id, role_id, f_name, l_name, email, created_at, updated_at, last4ssn, birthday) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING emp_id`;

    try {
        // Firebase Authentication: Create user in Firebase using createUserWithEmailAndPassword
        const password = `${dob.slice(5, 7)}${dob.slice(2, 4)}${ssn.slice(-4)}`; // MMYY + last 4 SSN
        console.log(`Attempting to create Firebase user with email: ${email} and generated password`);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`Firebase user created successfully with UID: ${userCredential.user.uid}`);

        // Insert into the PostgreSQL database after creating the user in Firebase
        console.log('Inserting employee into PostgreSQL database');
        const result = await client.query(insertQuery, [businessId, roleID, fName, lName, email, createdAt, updatedAt, ssn, dob]);
        const empId = result.rows[0].emp_id;
        console.log(`Employee added to PostgreSQL with ID: ${empId}`);

          //  add the employee to Firestore under the respective business collection
          const employeeData = {
            empId,
            uid: userCredential.user.uid,  // Store Firebase UID
            fName,
            lName,
            email,
            roleID,
            businessId,
            createdAt,
            updatedAt,
        };

        // Create a document in Firestore under the business's collection
        await setDoc(doc(db, `businesses/${businessId}/employees`, empId.toString()), employeeData);
        console.log('Employee data stored in Firestore');

        // Return the new employee's ID and relevant data for future use
        return {
            empId,
            email,
            fName,
            lName,
            roleID,
            businessId,
            password,
        };
    } catch (err) {
        // Debugging error logs
        console.error('An error occurred:', err);

        if (err.code) {
            // Log specific Firebase errors
            console.error(`Firebase error code: ${err.code}`);
            console.error(`Firebase error message: ${err.message}`);
        } else {
            // Log PostgreSQL or other errors
            console.error(`Non-Firebase error: ${err.message}`);
        }
        throw err;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}
