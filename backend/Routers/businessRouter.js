import express from 'express';
import { getBusinessById, getBusinessDetails, getBusinessLocation, registerBusiness, saveBusinessLocation } from '../Scripts/businessScript.js';

const router = express.Router();

// Route to fetch business details by email
router.post('/getBusinessDetails', async (req, res) => {
    const { business_email } = req.body;
    console.log("Post " + business_email);

    try {
        // Call getBusinessDetails to fetch details of the business from the database
        const businessDetails = await getBusinessDetails(business_email);
        console.log("business details in router: " + businessDetails);

        // Send business details in JSON format on success
        res.status(200).json({ businessDetails });
    } catch (err) {
        // Log error and send a 500 status if there's an issue fetching business details
        console.error('Error fetching businessDetails:', err);
        res.status(500).json({ error: 'Internal server error businessDetails' });
    }
});

// Route to get business location by business_id
router.post('/getBusinessLocation', async (req, res) => {
    const { business_id } = req.body;

    try {
        const businessLocation = await getBusinessLocation(business_id); // Fetch business location from database

        if (businessLocation) {
            res.status(200).json({ businessLocation });
        } else {
            res.status(404).json({ error: 'Business location not found' });
        }
    } catch (err) {
        console.error('Error fetching business location:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to save or update a business location
router.post('/saveBusinessLocation', async (req, res) => {
    const businessLocationData = req.body; // Extract location data from the request

    try {
        // Call saveBusinessLocation to save or update business location and get location ID
        const businessLocationId = await saveBusinessLocation(businessLocationData);
        console.log("Business location saved with ID:", businessLocationId);

        // Return the new or updated business location ID on success
        res.status(201).json({ businessLocationId });
    } catch (err) {
        // Log error and respond with 500 status if saving fails
        console.error('Error saving business location:', err);
        res.status(500).json({ error: 'Internal server error while saving business location' });
    }
});

// Route to fetch business ID by email
router.post('/getBusinessIDFromEmail', async (req, res) => {
    const { business_email } = req.body; // Extract business email from request body

    try {
        // Call getBusinessById to retrieve the unique business ID
        const business_id = await getBusinessById(business_email);

        // Return the business ID in JSON format on success
        res.status(200).json({ business_id });
    } catch (err) {
        // Log error and respond with a 500 status if there's an issue
        console.error('Error fetching business_id:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to register a new business with name, email, and password
router.post('/register', async (req, res) => {
    const { businessName, businessEmail, password } = req.body;

    // Check for missing fields to prevent undefined values in logic
    if (!businessName || !businessEmail || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Call registerBusiness function to handle business registration
        const result = await registerBusiness(businessName, businessEmail, password);

        // If registration is successful, send a success response
        if (result.success) {
            return res.status(201).json(result.data);
        } else {
            // If registration fails, send a response with error details
            return res.status(400).json({ message: result.message });
        }
    } catch (err) {
        // Log any errors that occur and return a 500 status for server error
        console.error('Error during registration process:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router; // Export the router to be used in server.js
