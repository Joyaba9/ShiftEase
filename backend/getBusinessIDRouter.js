import express from 'express';
import { getBusinessById } from './getBusinessID.js';

const router = express.Router();

// Define the route to fetch fetch business ID by business email
router.post('/', async (req, res) => {
    // Extract the business_email from the request body
    const { business_email } = req.body;
    console.log("Post "+ business_email); 

    // Try to retrieve the business_id for the given business_email
    try {
        // Call the getBusinessById function to get the business_id from the database
        const business_id = await getBusinessById(business_email);

        // If successful, return the business_id in a JSON response with status 200 (OK)
        res.status(200).json({business_id});
    } catch (err) {
        console.error('Error fetching business_id:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;