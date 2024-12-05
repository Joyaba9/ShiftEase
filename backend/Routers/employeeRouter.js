import express from 'express';
import { AddEmployee, fetchEmployees, SoftDeleteEmployee, UpdateEmployee, AddEmployeeAvailability, fetchEmployeeAvailability, getFutureRequestsByEmployee, getPastRequestsByEmployee, getAllRequestsByEmployee, addRequestForEmployee, updateRequestStatus, fetchEmployeesWithRoles, getAllRequestStatusByEmployee, getRequestById, checkIfEmployeeIsManager, getEmployeeData, saveEmployeeData, addAvailabilityRequestForEmployee, getAvailabilityRequestById, getFutureAvailabilityRequests, updateAvailabilityRequestStatus, getApprovedAvailabilityRequests, getRejectedAvailabilityRequests, getPastAvailabilityRequests } from '../Scripts/employeeScript.js';

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

// Route to add a new employee with specified role, name, email, SSN, date of birth, and employment type
router.post('/add', async (req, res) => {
    const { role, fName, lName, email, ssn, dob, businessId, full_time } = req.body;

    // Log the received data for tracing and debugging purposes
    console.log('Add employee request received:', { role, fName, lName, email, ssn, dob, businessId, full_time });

    // Validate required fields
    if (!role || !fName || !lName || !email || !ssn || !dob || full_time === undefined || !businessId) {
        return res.status(400).json({ error: 'All fields are required, including employment type (full_time).' });
    }

    try {
        // Call AddEmployee to create a new employee record
        const employee = await AddEmployee(role, fName, lName, email, ssn, dob, businessId, full_time);

        // Return the new employee data in JSON format on success
        res.status(200).json({ success: true, employee });
    } catch (err) {
        // Log error and return a 400 status with error details if addition fails
        console.error('Error adding employee:', err);
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
    const { emp_id, business_id, isManager } = req.query; // Extract emp_id and business_id from query parameters

    // Validate input
    if (!emp_id || !business_id) {
        return res.status(400).json({ success: false, message: 'Employee ID and Business ID are required' });
    }

    try {
        // Fetch future requests for the given employee and business
        const futureRequests = await getFutureRequestsByEmployee(emp_id, business_id, isManager);

        // Return the list of future requests in JSON format
        res.status(200).json({ success: true, futureRequests });
    } catch (err) {
        console.error('Error fetching future requests:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to fetch all past requests for a specific employee and business
router.get('/getPastRequests', async (req, res) => {
    const { emp_id, business_id, isManager} = req.query; // Extract emp_id and business_id from query parameters

    // Validate input
    if (!emp_id || !business_id || !isManager) {
        return res.status(400).json({ success: false, message: 'Employee ID, Business ID, and isManager are required' });
    }
    
    console.log('isManager in status past router: ', isManager);
    console.log('Type of isManager past: ', typeof isManager);

    try {
        // Fetch past requests for the given employee and business
        const pastRequests = await getPastRequestsByEmployee(emp_id, business_id, isManager);

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

// Route to fetch all requests for a specific employee, sorted by status
router.get('/getAllRequestsByStatus', async (req, res) => {
    console.log('Function being called');
    const { emp_id, business_id, status, isManager, requestType } = req.query; // Extract parameters from query

    // Validate input
    if (!emp_id || !business_id || !status) {
        return res.status(400).json({ success: false, message: 'Employee ID, Business ID, and Status are required' });
    }

    console.log('isManager in status router: ', isManager);
    console.log('requestType in status router: ', requestType);

    try {
        // Fetch all requests for the given employee and business
        const allRequestsByStatus = await getAllRequestStatusByEmployee(emp_id, business_id, status, isManager, requestType || 'pto'); // Default to PTO if requestType is not provided

        // Return the list of all requests in JSON format
        res.status(200).json({ success: true, allRequestsByStatus });
    } catch (err) {
        console.error('Error fetching all requests:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});


// ROute for displaying the request by requestid
router.get('/getRequestInfo', async (req, res) => {
    const { request_id } = req.query; 

    // Validate input
    if (!request_id) {
        return res.status(400).json({ success: false, message: 'request id is required' });
    }

    try {
        // Fetch all requests for the given employee and business
        const requestInfo = await getRequestById (request_id);

        // Return the list of all requests in JSON format
        res.status(200).json({ success: true, requestInfo });
    } catch (err) {
        console.error('Error fetching request info:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to fetch details of an availability request by ID
router.get('/getAvailabilityRequestInfo', async (req, res) => {
    const { request_id } = req.query;

    if (!request_id) {
        return res.status(400).json({ success: false, message: 'Request ID is required.' });
    }

    try {
        const requestInfo = await getAvailabilityRequestById(request_id);
        if (!requestInfo) {
            return res.status(404).json({ success: false, message: 'Availability request not found.' });
        }
        res.status(200).json({ success: true, requestInfo });
    } catch (error) {
        console.error('Error fetching availability request info:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch availability request info.' });
    }
});



// Route to add a new request for a specific employee
router.post('/addRequest', async (req, res) => {
    const requestData = req.body;

    // Validate required fields in the request data
    const requiredFields = ['emp_id', 'business_id', 'request_type', 'day_type', 'start_date', 'reason'];
    for (const field of requiredFields) {
        if (!requestData[field]) {
            return res.status(400).json({ success: false, message: `Field ${field} is required.` });
        }
    }

    // Convert dates from string format to Date format for validation
    const startDate = new Date(requestData.start_date);
    const endDate = requestData.end_date ? new Date(requestData.end_date) : null;

    // Check if start_date is before or the same as end_date
    if (endDate && startDate > endDate) {
        return res.status(400).json({ success: false, message: 'Start date must be before or equal to the end date.' });
    }

    try {
        // Add a new request for the given employee and business with validations
        const newRequest = await addRequestForEmployee(requestData);

        // Return the new request data in JSON format
        res.status(201).json({ success: true, newRequest });
    } catch (err) {
        console.error('Error adding new request:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to add a new availability change request
router.post('/addAvailabilityRequest', async (req, res) => {
    const requestData = req.body;

    // Validate required fields in the request data
    const requiredFields = ['emp_id', 'business_id', 'start_date', 'availability', 'reason'];
    for (const field of requiredFields) {
        if (!requestData[field]) {
            return res.status(400).json({ success: false, message: `Field ${field} is required.` });
        }
    }

    // Convert dates from string format to Date format for validation
    const startDate = new Date(requestData.start_date);
    const endDate = requestData.end_date ? new Date(requestData.end_date) : null;

    // Check if start_date is before or the same as end_date
    if (endDate && startDate > endDate) {
        return res.status(400).json({ success: false, message: 'Start date must be before or equal to the end date.' });
    }

    try {
        // Call the function to handle database insertion
        const newRequest = await addAvailabilityRequestForEmployee(requestData);

        // Return the new request data in JSON format
        res.status(201).json({ success: true, newRequest });
    } catch (err) {
        console.error('Error adding availability request:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});



// Route to update the status of a request (Approve or Reject) and add manager comments
router.put('/updateRequestStatus', async (req, res) => {
    const { request_id, business_id, status, manager_comments } = req.body;

    console.log("Received Payload:", req.body);// Route to add a new availability change request
    router.post('/addAvailabilityRequest', async (req, res) => {
        const requestData = req.body;
    
        // Validate required fields in the request data
        const requiredFields = ['emp_id', 'business_id', 'start_date', 'availability'];
        for (const field of requiredFields) {
            if (!requestData[field]) {
                return res.status(400).json({ success: false, message: `Field ${field} is required.` });
            }
        }
    
        // Convert dates from string format to Date format for validation
        const startDate = new Date(requestData.start_date);
        const endDate = requestData.end_date ? new Date(requestData.end_date) : null;
    
        // Check if start_date is before or the same as end_date
        if (endDate && startDate > endDate) {
            return res.status(400).json({ success: false, message: 'Start date must be before or equal to the end date.' });
        }
    
        try {
            // Function to handle the actual insertion into the database
            const newRequest = await addAvailabilityRequestForEmployee(requestData);
    
            // Return the new request data in JSON format
            res.status(201).json({ success: true, newRequest });
        } catch (err) {
            console.error('Error adding availability request:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });


    // Validate input
    if (!request_id || !business_id || !status) {
        return res.status(400).json({ success: false, message: 'Request ID, Business ID, and status are required' });
    }

    try {
        // Update the request status and manager comments
        const updatedRequest = await updateRequestStatus(request_id, business_id, status, manager_comments);

        // Return the updated request data in JSON format
        res.status(200).json({ success: true, updatedRequest });
    } catch (err) {
        console.error('Error updating request status:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/checkIfEmployeeIsManager', async (req, res) => {
    const { emp_id } = req.query;  // Assume emp_id is passed as a query parameter

    // Validate input
    if (!emp_id) {
        return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    try {
        // Check if the employee is a manager
        const isManager = await checkIfEmployeeIsManager(emp_id);

        // Return the result in JSON format
        res.status(200).json({ success: true, isManager });
    } catch (err) {
        console.error('Error checking if employee is a manager:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/getEmployeeData', async (req, res) => {
    const { emp_id } = req.query; 

    try {
        const EmployeeData = await getEmployeeData(emp_id); // Fetch business location from database

        if (EmployeeData) {
            res.status(200).json({ EmployeeData });
        } else {
            res.status(404).json({ error: 'Employee data not found' });
        }
    } catch (err) {
        console.error('Error fetching Employee Data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/saveEmployeeData', async (req, res) => {
    const employeeData = req.body; // Extract employee data from the request

    try {
        // Call saveEmployeeData to save or update the employee location info
        await saveEmployeeData(employeeData); // Wait for the function to complete

        // Return the employee ID (emp_id) after saving or updating the data
        console.log("Employee data saved or updated for emp_id:", employeeData.emp_id);
        res.status(201).json({ emp_id: employeeData.emp_id }); 
    } catch (err) {
        // Log error and respond with 500 status if saving fails
        console.error('Error saving employee data:', err);
        res.status(500).json({ error: 'Internal server error while saving employee data' });
    }
});

//Router to get Future Availability Requests
router.get('/getFutureAvailabilityRequests', async (req, res) => {
    const { emp_id, business_id, isManager } = req.query;

    // Validate required fields
    if (!emp_id || !business_id) {
        return res.status(400).json({ success: false, message: 'Employee ID and Business ID are required.' });
    }

    try {
        // Call the function to fetch future availability requests
        const futureAvailabilityRequests = await getFutureAvailabilityRequests(emp_id, business_id, isManager);

        // Return the fetched requests in JSON format
        res.status(200).json({ success: true, futureAvailabilityRequests });
    } catch (err) {
        console.error('Error fetching future availability requests:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update availability request status
router.put('/updateAvailabilityRequestStatus', async (req, res) => {
    const { request_id, business_id, status, manager_comments } = req.body;

    if (!request_id || !business_id || !status) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const result = await updateAvailabilityRequestStatus(request_id, business_id, status, manager_comments);
        if (result.success) {
            return res.status(200).json({ success: true, message: 'Request updated successfully' });
        } else {
            return res.status(400).json({ success: false, message: result.message || 'Failed to update request' });
        }
    } catch (error) {
        console.error('Error updating availability request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Fetch Approved Availability Requests
router.get('/getApprovedAvailabilityRequests', async (req, res) => {
    const { emp_id, business_id, isManager } = req.query;

    if (!emp_id || !business_id) {
        return res.status(400).json({ success: false, message: 'Employee ID and Business ID are required.' });
    }

    try {
        const approvedRequests = await getApprovedAvailabilityRequests(emp_id, business_id, isManager);
        res.status(200).json({ success: true, approvedAvailabilityRequests: approvedRequests });
    } catch (error) {
        console.error('Error fetching approved availability requests:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



//Fetch Rejected Availability Requests
router.get('/getRejectedAvailabilityRequests', async (req, res) => {
    const { emp_id, business_id } = req.query;

    if (!emp_id || !business_id) {
        return res.status(400).json({ success: false, message: 'Missing required parameters: emp_id or business_id' });
    }

    try {
        const rejectedRequests = await getRejectedAvailabilityRequests(emp_id, business_id);
        res.json({ success: true, rejectedAvailabilityRequests: rejectedRequests });
    } catch (error) {
        console.error('Error fetching rejected availability requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch rejected availability requests' });
    }
});


router.get('/getPastAvailabilityRequests', async (req, res) => {
    const { emp_id, business_id, isManager } = req.query;

    if (!business_id) {
        return res.status(400).json({ success: false, message: 'Business ID is required.' });
    }

    try {
        const pastAvailabilityRequests = await getPastAvailabilityRequests(emp_id, business_id, isManager === 'true');
        res.status(200).json({ success: true, pastAvailabilityRequests });
    } catch (error) {
        console.error('Error fetching past availability requests:', error);
        res.status(500).json({ success: false, message: 'Error fetching past availability requests.' });
    }
});






export default router; // Export the router to be used in server.js
