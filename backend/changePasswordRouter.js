import express from 'express';
import { changeUserPassword } from './changePasswordScript.js';

const router = express.Router();

// Route to change the Firebase password
router.post('/', async (req, res) => {
    const { employeeId, currentPassword, newPassword } = req.body;

    if (!employeeId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Employee ID, current password, and new password are required' });
    }

    try {
        const result = await changeUserPassword(employeeId, currentPassword, newPassword);
        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;