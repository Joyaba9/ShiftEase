import express from 'express';
import { AddEmployee, fetchEmployees, fetchEmployeesWithRoles, SoftDeleteEmployee, UpdateEmployee, AddEmployeeAvailability, fetchEmployeeAvailability } from '../Scripts/employeeScript.js';

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
router.put('/update/:emp_id', async (req, res) => {  // Use emp_id here in the URL
    const { emp_id } = req.params;  // Get emp_id from URL
    const { role_id, f_name, l_name, email, last4ssn, birthday } = req.body;

    // Validate required fields
    if (!role_id || !f_name || !l_name || !email || !last4ssn || !birthday) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // New employee info object
    const newEmployeeInfo = { role_id, f_name, l_name, email, last4ssn, birthday };

    try {
        // Call UpdateEmployee function with emp_id
        await UpdateEmployee(emp_id, newEmployeeInfo);

        res.status(200).json({ success: true, message: 'Employee updated successfully' });
    } catch (err) {
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

// Route to soft delete an employee
router.put('/softDeleteEmployee', async (req, res) => {
    const { businessId, employeeId } = req.body;

    // Validate inputs
    if (!businessId || !employeeId) {
        return res.status(400).json({ success: false, message: 'Business ID and Employee ID are required' });
    }

    try {
        // Call the script to soft delete the employee
        const result = await SoftDeleteEmployee(businessId, employeeId);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Endpoint to add availability data for an employee
router.post('/availability/add', async (req, res) => {
    const { emp_id, availability } = req.body;

    // Validate input
    if (!emp_id || !Array.isArray(availability) || availability.length === 0) {
        return res.status(400).json({ success: false, message: 'Employee ID and availability data are required' });
    }

    try {
        // Call the function to add availability data in your script
        await AddEmployeeAvailability(emp_id, availability);
        res.status(200).json({ success: true, message: 'Availability data added successfully' });
    } catch (error) {
        console.error('Error adding availability data:', error);
        res.status(500).json({ success: false, message: 'Failed to add availability data' });
    }
});

// Endpoint to fetch availability for a specific employee
router.get('/availability/fetch/:emp_id', async (req, res) => {
    console.log("Incoming request to /availability/fetch/:emp_id");
    const { emp_id } = req.params;
    console.log(`Fetching availability for employee ${emp_id}`);

    try {
        const availability = await fetchEmployeeAvailability(emp_id); // Call the function in your script
        res.status(200).json(availability); // Send the fetched availability data
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch availability data' });
    }
});


export default router; // Export the router to be used in server.js
