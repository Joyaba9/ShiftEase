import express from 'express';
import { AddEmployee, fetchEmployees, SoftDeleteEmployee, UpdateEmployee, AddEmployeeAvailability, fetchEmployeeAvailability, getFutureRequestsByEmployee, getPastRequestsByEmployee, getAllRequestsByEmployee, addRequestForEmployee, updateRequestStatus } from '../Scripts/employeeScript.js';

const router = express.Router();

// Route to fetch all employees for a given business ID
router.get('/fetchAll/:businessId', async (req, res) => {
    const { businessId } = req.params; // Extract the business ID from the request Parameter

    try {
        // Call fetchEmployees to retrieve a list of employees for the given business ID
        const employees = await fetchEmployees(businessId);
        
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

// Route to fetch all future requests for a specific employee and business
router.get('/getFutureRequests', async (req, res) => {
    const { emp_id, business_id } = req.query; // Extract emp_id and business_id from query parameters

    // Validate input
    if (!emp_id || !business_id) {
        return res.status(400).json({ success: false, message: 'Employee ID and Business ID are required' });
    }

    try {
        // Fetch future requests for the given employee and business
        const futureRequests = await getFutureRequestsByEmployee(emp_id, business_id);

        // Return the list of future requests in JSON format
        res.status(200).json({ success: true, futureRequests });
    } catch (err) {
        console.error('Error fetching future requests:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to fetch all past requests for a specific employee and business
router.get('/getPastRequests', async (req, res) => {
    const { emp_id, business_id } = req.query; // Extract emp_id and business_id from query parameters

    // Validate input
    if (!emp_id || !business_id) {
        return res.status(400).json({ success: false, message: 'Employee ID and Business ID are required' });
    }

    try {
        // Fetch past requests for the given employee and business
        const pastRequests = await getPastRequestsByEmployee(emp_id, business_id);

        // Return the list of past requests in JSON format
        res.status(200).json({ success: true, pastRequests });
    } catch (err) {
        console.error('Error fetching past requests:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to fetch all requests for a specific employee, sorted by the latest start date first
router.get('/getAllRequests', async (req, res) => {
    const { emp_id, business_id } = req.query; // Extract emp_id and business_id from query parameters

    // Validate input
    if (!emp_id || !business_id) {
        return res.status(400).json({ success: false, message: 'Employee ID and Business ID are required' });
    }

    try {
        // Fetch all requests for the given employee and business
        const allRequests = await getAllRequestsByEmployee(emp_id, business_id);

        // Return the list of all requests in JSON format
        res.status(200).json({ success: true, allRequests });
    } catch (err) {
        console.error('Error fetching all requests:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to add a new request for a specific employee
router.post('/addRequest', async (req, res) => {
    const requestData = req.body;

    // Validate required fields in the request data
    const requiredFields = ['emp_id', 'business_id', 'request_type', 'day_type', 'start_date', 'end_date', 'reason'];
    for (const field of requiredFields) {
        if (!requestData[field]) {
            return res.status(400).json({ success: false, message: `Field ${field} is required.` });
        }
    }

    try {
        // Add a new request for the given employee and business
        const newRequest = await addRequestForEmployee(requestData);

        // Return the new request data in JSON format
        res.status(201).json({ success: true, newRequest });
    } catch (err) {
        console.error('Error adding new request:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to update the status of a request (Approve or Reject)
router.put('/updateRequestStatus', async (req, res) => {
    const { request_id, business_id, status } = req.body;

    // Validate input
    if (!request_id || !business_id || !status) {
        return res.status(400).json({ success: false, message: 'Request ID, Business ID, and status are required' });
    }

    try {
        // Update the request status
        const updatedRequest = await updateRequestStatus(request_id, business_id, status);

        // Return the updated request data in JSON format
        res.status(200).json({ success: true, updatedRequest });
    } catch (err) {
        console.error('Error updating request status:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router; // Export the router to be used in server.js
