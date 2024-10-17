import express from 'express';
import { AddEmployee, fetchEmployees, UpdateEmployee } from '../Scripts/employeeScript.js'; // Adjust the path as needed

const router = express.Router();

// Define the route to fetch employees
router.get('/fetchAll', async (req, res) => {
    const { businessId } = req.body;

    try {
        const employees = await fetchEmployees(businessId);
        res.status(200).json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update employee information
router.put('/update', async (req, res) => {
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

// Route to add an employee
router.post('/add', async (req, res) => {
    const { role, fName, lName, email, ssn, dob } = req.body;

    console.log('Login request received:', role, fName, lName, email, ssn, dob);

    try {
        const employee = await AddEmployee(role, fName, lName, email, ssn, dob);
        res.status(200).json({ success: true, employee });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router;
