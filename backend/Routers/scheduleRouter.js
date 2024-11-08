// File: employeeRouter.js
import express from 'express';
import { createShift, createWeeklySchedule, getAvailableEmployees, getShiftsByScheduleId } from '../Scripts/scheduleScript.js';

const router = express.Router();


// Route to fetch available employees for a specific day and date
router.post('/availableEmployees', async (req, res) => {
    const { businessId, day, date } = req.body;

    // Log the received day value to check its format
    console.log('Received businessId:', businessId);
    console.log('Received day:', day);
    console.log('Received date:', date);

    // Input validation
    if (!businessId || !day || !date) {
        return res.status(400).json({ error: 'Business ID, day, and date are required.' });
    }

    try {
        // Call the script function to fetch available employees
        const employees = await getAvailableEmployees(businessId, day, date);

        if (employees.length > 0) {
            res.status(200).json({ success: true, employees });
        } else {
            res.status(404).json({ success: false, message: 'No available employees found for the given criteria.' });
        }
    } catch (err) {
        console.error('Error fetching available employees:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to create a weekly schedule for a business
router.post('/createWeeklySchedule', async (req, res) => {
    const { businessId, weekStartDate } = req.body;

    // Input validation
    if (!businessId || !weekStartDate) {
        return res.status(400).json({ error: 'Business ID and week start date are required.' });
    }

    try {
        // Call the script function to create a weekly schedule
        const schedule = await createWeeklySchedule(businessId, weekStartDate);

        res.status(200).json({ success: true, schedule });
    } catch (err) {
        console.error('Error creating weekly schedule:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to create a shift for an employee on a specific date
router.post('/createShift', async (req, res) => {
    const { employeeId, scheduleId, date, startTime, endTime } = req.body;

    // Input validation
    if (!employeeId || !scheduleId || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'All fields (employeeId, scheduleId, date, startTime, endTime) are required.' });
    }

    try {
        // Call the script function to create the shift
        const shift = await createShift(employeeId, scheduleId, date, startTime, endTime);

        res.status(200).json({ success: true, shift });
    } catch (err) {
        console.error('Error creating shift:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/shiftsByScheduleId', async (req, res) => {
    const { scheduleId } = req.body;

    // Input validation
    if (!scheduleId) {
        return res.status(400).json({ error: 'Schedule ID is required.' });
    }

    try {
        // Call the script function to get shifts by schedule ID
        const shifts = await getShiftsByScheduleId(scheduleId);

        if (shifts.length === 0) {
            return res.status(404).json({ success: false, message: 'No shifts found for the specified schedule.' });
        }

        res.status(200).json({ success: true, shifts });
    } catch (err) {
        console.error('Error fetching shifts:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
