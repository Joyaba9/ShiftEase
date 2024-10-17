import express from 'express';
import { CreateRole } from '../Scripts/createRoleScript.js';

const router = express.Router();

router.post('/create', async (req, res) => {
    const { roleName } = req.body;

    if (!roleName) {
        return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    console.log('Create Role Request Received:', roleName);

    try {
        const role = await CreateRole(roleName);
        res.status(200).json({ success: true, role });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router;