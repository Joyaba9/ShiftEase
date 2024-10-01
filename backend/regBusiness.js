import express from 'express';
import bcrypt from 'bcrypt';
import getClient from './dbClient.js';

const router = express.Router();

// POST /regBusiness
router.post('/', async (req, res) => {
    const { businessName, businessEmail, password } = req.body;

    console.log('Received registration request');
    console.log('Request body:', req.body);

    // Check if passwords match

    if (!businessName || !businessEmail || !password) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Get the PostgreSQL client from Cloud SQL
        const client = await getClient();
        await client.connect();

        // Check if the business already exists by name
        const existingBusinessName = await client.query('SELECT * FROM business WHERE business_name = $1', [businessName]); // Check if the business already exists by name
        if (existingBusinessName.rows.length > 0) {
            console.log('Business name already exists');
            return res.status(400).json({ message: 'Business name already exists' });
        }

        // Check if the business already exists by email
        const existingBusinessEmail = await client.query('SELECT * FROM business WHERE business_email = $1', [businessEmail]); // Check if the business already exists by email
        if (existingBusinessEmail.rows.length > 0) {
            console.log('Business email already exists');
            return res.status(400).json({ message: 'Business email already exists' });
        }

        // Hash the password
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const passHash = await bcrypt.hash(password, saltRounds);
        console.log('Password hashed successfully');

        // Insert the new business into the database
        const query = `INSERT INTO business (business_name, business_email, pass_hash, created_at, updated_at) 
                       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`;
        const values = [businessName, businessEmail, passHash];

        // Execute the query
        const result = await client.query(query, values);
        console.log('Business inserted successfully');

        // Clean up: Close the client after query execution
        await client.end();

        // Return the newly created business
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error during registration process:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
