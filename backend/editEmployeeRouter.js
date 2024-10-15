import express from 'express';
import { UpdateEmployee } from './editEmployeeScript.js';

const router = express.Router();

// Route to update employee information
router.put('/', async (req, res) => {
    const { employeeId, role_id, f_name, l_name, email, last4ssn, birthday } = req.body;

    // Validate input
    if (!role_id || !f_name || !l_name || !email || !last4ssn || !birthday) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newEmployeeInfo = {
        role_id,
        f_name,
        l_name,
        email,
        last4ssn,
        birthday
    };

    try {
        await UpdateEmployee(employeeId, newEmployeeInfo);
        res.status(200).json({ success: true, message: 'Employee updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;