import express from 'express';
import { CreateRole, CreateRoleWithPermissions, DeleteRole, GetAllPermissions, GetRolePermissions, GetRolesByBusinessAndManagerStatus, GetRolesByOnlyBusinessAndManagerStatus, UpdateRoleWithPermissions } from '../Scripts/roleScript.js';

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

router.post('/createRoleWithPermissions', async (req, res) => {
    const { businessId, roleName, permissions, isManager } = req.body;

    // Validate input
    if (!businessId || !roleName || !Array.isArray(permissions) || isManager === undefined) {
        return res.status(400).json({ success: false, message: 'Invalid input: Business ID, role name, permissions, and manager flag are required' });
    }

    try {
        // Call the script to create the role with permissions and manager flag
        const result = await CreateRoleWithPermissions(businessId, roleName, permissions, isManager);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Route to update a role with the specified role name and permissions
router.put('/updateRoleWithPermissions', async (req, res) => {
    const { businessId, roleId, roleName, permissions, isManager } = req.body;

    // Validate input
    if (!businessId || !roleId || !roleName || !Array.isArray(permissions) || isManager === undefined) {
        return res.status(400).json({ success: false, message: 'Invalid input: Business ID, role ID, role name, permissions, and manager flag are required' });
    }

    try {
        // Call the script to update the role with permissions and manager flag
        const result = await UpdateRoleWithPermissions(businessId, roleId, roleName, permissions, isManager);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Route to get roles by business ID
router.get('/getRoles', async (req, res) => {
    const { businessId, roleType } = req.query; // Use query parameters instead

    // Validate businessId input
    if (!businessId) {
        return res.status(400).json({ success: false, message: 'Business ID is required' });
    }

    // Determine the manager filter based on roleType
    let managerFilter = null;
    if (roleType === 'manager') {
        managerFilter = true;
    } else if (roleType === 'employee') {
        managerFilter = false;
    } else if (roleType !== 'all' && roleType !== undefined) {
        return res.status(400).json({ success: false, message: 'Invalid roleType. Use "manager", "employee", or "all".' });
    }

    try {
        // Call the script to get roles by business ID and manager status
        const roles = await GetRolesByBusinessAndManagerStatus(Number(businessId), managerFilter);
        res.status(200).json({ success: true, roles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Route to get roles by only business ID
router.get('/getBusinessRoles', async (req, res) => {
    const { businessId, roleType } = req.query; // Use query parameters instead

    // Validate businessId input
    if (!businessId) {
        return res.status(400).json({ success: false, message: 'Business ID is required' });
    }

    // Determine the manager filter based on roleType
    let managerFilter = null;
    if (roleType === 'manager') {
        managerFilter = true;
    } else if (roleType === 'employee') {
        managerFilter = false;
    } else if (roleType !== 'all' && roleType !== undefined) {
        return res.status(400).json({ success: false, message: 'Invalid roleType. Use "manager", "employee", or "all".' });
    }

    try {
        // Call the script to get roles by business ID and manager status
        const roles = await GetRolesByOnlyBusinessAndManagerStatus(Number(businessId), managerFilter);
        res.status(200).json({ success: true, roles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Route to get all permissions
router.get('/getPermissions', async (req, res) => {
    try {
        // Call the script to get all permissions
        const permissions = await GetAllPermissions();
        res.status(200).json({ success: true, permissions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Route to get permissions for a specific role using GET request
router.get('/getRolePermissions', async (req, res) => {
    const { businessId, roleId } = req.query; // Get from query parameters

    // Validate inputs
    if (!businessId || !roleId) {
        return res.status(400).json({ success: false, message: 'Business ID and Role ID are required.' });
    }

    try {
        // Call the script to get role permissions
        const permissions = await GetRolePermissions(Number(businessId), Number(roleId));
        res.status(200).json({ success: true, permissions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Route to delete a role
router.delete('/deleteRole', async (req, res) => {
    const { roleId, businessId } = req.query; // Receive as query parameters

    // Validate inputs
    if (!roleId || !businessId) {
        return res.status(400).json({ success: false, message: 'Role ID and Business ID are required.' });
    }

    try {
        // Call the deleteRole script
        const result = await DeleteRole(Number(roleId), Number(businessId));
        if (!result.success) {
            return res.status(400).json(result); // Return error message if unable to delete
        }
        res.status(200).json(result); // Success message
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

export default router; // Export the router to be used in server.js
