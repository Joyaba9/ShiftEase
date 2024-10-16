import express from 'express';
import { getBusinessDetails, saveBusinessLocation } from './BusinessDetails.js';

const router = express.Router();

//Define the route to fetch fetch business details by business email
router.post('/getBusinessDetails', async (req, res) => {
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
router.post('/saveBusinessLocation', async (req, res) => {
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

export default router;