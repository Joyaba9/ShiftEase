import express from 'express';
import { getBusinessById, getBusinessDetails, registerBusiness, saveBusinessLocation } from './BusinessScript.js';

const router = express.Router();

//Define the route to fetch fetch business details by business email
router.post('/getDetails', async (req, res) => {
     // Extract the business_email from the request body
    const { business_email } = req.body;
    console.log("Post "+ business_email);

     // Try to retrieve the business details for the given business email
    try {
         // Call the getBusinessDetails function to get the business details from the database
        const businessDetails = await getBusinessDetails(business_email);
        console.log("business details in router: " + businessDetails);

        // If successful, return the business details in a JSON response with status 200 (OK)
        res.status(200).json({businessDetails});
    } catch (err) {
        console.error('Error fetching businessDetails:');
        res.status(500).json({ error: 'Internal server error businessDetails' });
    }
});

// Define the route to save business location
router.post('/saveLocation', async (req, res) => {
    // Extract the business location data from the request body
    const businessLocationData = req.body;

    // Try to save the business location
    try {
        // Call the saveBusinessLocation function to save the data and get the new location ID
        const businessLocationId = await saveBusinessLocation(businessLocationData);
        console.log("Business location saved with ID:", businessLocationId);

        // If successful, return the new business location ID in a JSON response with status 201 (Created)
        res.status(201).json({ businessLocationId });
    } catch (err) {
        console.error('Error saving business location:', err);
        res.status(500).json({ error: 'Internal server error while saving business location' });
    }
});

// Define the route to fetch fetch business ID by business email
router.post('/getBusinessIDFromEmail', async (req, res) => {
    // Extract the business_email from the request body
    const { business_email } = req.body;

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

// POST regBusiness
router.post('/register', async (req, res) => {
    const { businessName, businessEmail, password } = req.body;

    try {
        const result = await registerBusiness(businessName, businessEmail, password);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;