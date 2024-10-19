import express from 'express';
import { getBusinessById, getBusinessDetails, registerBusiness, saveBusinessLocation } from '../Scripts/businessScript.js';

const router = express.Router();

// Route to fetch business details by email
router.post('/getDetails', async (req, res) => {
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

// Route to save or update a business location
router.post('/saveLocation', async (req, res) => {
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

    try {
        // Call registerBusiness to create a new business entry in the database
        const result = await registerBusiness(businessName, businessEmail, password);

        // Return a success message on successful registration
        res.status(200).json(result);
    } catch (err) {
        // Log the error and return a 400 status with the error message if registration fails
        res.status(400).json({ message: err.message });
    }
});

export default router; // Export the router to be used in server.js
