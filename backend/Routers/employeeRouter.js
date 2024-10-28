import express from 'express';
import { AddEmployee, fetchEmployeesWithRoles, UpdateEmployee } from '../Scripts/employeeScript.js';

const router = express.Router();

// Route to fetch all employees for a given business ID
router.get('/fetchAll/:businessId', async (req, res) => {
    const { businessId } = req.params; // Extract the business ID from the request Parameter

    try {
        // Call fetchEmployees to retrieve a list of employees for the given business ID
        const employees = await fetchEmployeesWithRoles(businessId);
        
        // Return the list of employees in JSON format on success
        res.status(200).json(employees);
    } catch (err) {
        // Log error and return a 500 status with error details if fetching fails
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update information for a specific employee
router.put('/update', async (req, res) => {
    const { employeeId, role_id, f_name, l_name, email, last4ssn, birthday } = req.body;

    // Check if all required fields are present before proceeding
    if (!role_id || !f_name || !l_name || !email || !last4ssn || !birthday) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Create an object containing the new employee information
    const newEmployeeInfo = {
        role_id,
        f_name,
        l_name,
        email,
        last4ssn,
        birthday
    };

    try {
        // Call UpdateEmployee to apply changes to the employee's information
        await UpdateEmployee(employeeId, newEmployeeInfo);

        // Send a success response if the update is successful
        res.status(200).json({ success: true, message: 'Employee updated successfully' });
    } catch (err) {
        // Log error and return a 500 status with error message if update fails
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to add a new employee with specified role, name, email, SSN, and date of birth
router.post('/add', async (req, res) => {
    const { role, fName, lName, email, ssn, dob, businessId } = req.body;

    // Log the received data for tracing and debugging purposes
    console.log('Add employee request received:', role, fName, lName, email, ssn, dob);

    if (!businessId) {
        return res.status(400).json({ error: 'Business ID is required' });
    }

    try {
        // Call AddEmployee to create a new employee record
        const employee = await AddEmployee(role, fName, lName, email, ssn, dob, businessId);

        // Return the new employee data in JSON format on success
        res.status(200).json({ success: true, employee });
    } catch (err) {
        // Log error and return a 400 status with error details if addition fails
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router; // Export the router to be used in server.js
