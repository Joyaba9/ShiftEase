// File: employeeRouter.js
import express from 'express';
import { createShift, createWeeklySchedule, getAvailableEmployees, getShiftsByScheduleId, getScheduleByBusinessIdAndDate, updateShift, removeShift } from '../Scripts/scheduleScript.js';

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
    const { employeeId, scheduleId, date, startTime, endTime, rowIndex } = req.body;

    // Input validation
    if (employeeId === undefined || scheduleId === undefined || date === undefined || startTime === undefined || endTime === undefined || rowIndex === undefined) {
        return res.status(400).json({ error: 'All fields (employeeId, scheduleId, date, startTime, endTime, rowIndex) are required.' });
    }

    try {
        // Call the script function to create the shift
        const shift = await createShift(employeeId, scheduleId, date, startTime, endTime, rowIndex);

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

router.get('/getScheduleId', async (req, res) => {
    const { businessId, weekStartDate } = req.query;

    // Input validation
    if (!businessId || !weekStartDate) {
        return res.status(400).json({ error: 'Business ID and week start date are required.' });
    }

    try {
        // Check if a schedule exists
        const existingSchedule = await getScheduleByBusinessIdAndDate(businessId, weekStartDate);

        if (existingSchedule) {
            // If the schedule exists, fetch associated shifts
            const shifts = await getShiftsByScheduleId(existingSchedule.schedule_id);
            return res.status(200).json({
                success: true,
                schedule: existingSchedule,
                shifts,
            });
        } else {
            // If no schedule exists, respond accordingly
            return res.status(404).json({ success: false, message: 'No schedule found for the specified week.' });
        }
    } catch (err) {
        console.error('Error fetching schedule:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update an existing shift
router.put('/updateShift/:shift_id', async (req, res) => {
    const { shift_id } = req.params; // Get shift_id from URL
    const { startTime, endTime, description } = req.body;

    // Validate required fields
    if (!startTime || !endTime || !description) {
        return res.status(400).json({ success: false, message: 'Start time and end time, and description are required' });
    }

    const newShiftInfo = { startTime, endTime, description };

    try {
        // Call updateShift function with shift_id
        await updateShift(shift_id, newShiftInfo);

        res.status(200).json({ success: true, message: 'Shift updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route to delete a shift by shift_id
router.delete('/removeShift/:shiftId', async (req, res) => {
    const { shiftId } = req.params;

    try {
        const result = await removeShift(shiftId);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error removing shift:', err);
        res.status(500).json({ error: 'Failed to remove shift' });
    }
});

export default router;
