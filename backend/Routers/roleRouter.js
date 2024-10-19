import express from 'express';
import { CreateRole } from '../Scripts/roleScript.js';

const router = express.Router();

// Route to create a new role with the specified role name
router.post('/create', async (req, res) => {
    const { roleName } = req.body; // Extract roleName from the request body

    // Validate that roleName is provided before proceeding
    if (!roleName) {
        return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    // Log the request for role creation for tracing/debugging
    console.log('Create Role Request Received:', roleName);

    try {
        // Call CreateRole to add a new role to the database
        const role = await CreateRole(roleName);

        // Return success response with new role data if creation is successful
        res.status(200).json({ success: true, role });
    } catch (err) {
        // Log error and return a 400 status with the error message if creation fails
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router; // Export the router to be used in server.js
