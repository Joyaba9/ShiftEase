// File: employeeRouter.js
import express from 'express';
import { createShift, createWeeklySchedule, getAvailableEmployees, getShiftsByScheduleId, getScheduleByBusinessIdAndDate, createShiftOffer, acceptShiftOffer, cancelShiftOffer, searchOpenShiftOffers } from '../Scripts/scheduleScript.js';

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

// Route to create a shift offer
router.post('/createShiftOffer', async (req, res) => {
    const { shift_id, emp_id } = req.body;

    // Validate that both shift_id and emp_id are provided
    if (!shift_id || !emp_id) {
        return res.status(400).json({ error: 'Shift ID and Employee ID are required.' });
    }

    try {
        // Create the shift offer and handle shift history if needed
        const result = await createShiftOffer(shift_id, emp_id);
        res.status(200).json({ success: true, result });
    } catch (err) {
        console.error('Error creating shift offer:', err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// Route to accept a shift offer
router.post('/acceptShiftOffer', async (req, res) => {
    const { shift_id, emp_id } = req.body;

    // Validate input
    if (!shift_id || !emp_id) {
        return res.status(400).json({ error: 'Shift ID and Employee ID are required.' });
    }

    try {
        // Call the script to accept the shift offer
        const result = await acceptShiftOffer(shift_id, emp_id);
        res.status(200).json({ success: true, result });
    } catch (err) {
        console.error('Error accepting shift offer:', err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// Route to cancel a shift offer
router.post('/cancelShiftOffer', async (req, res) => {
    const { shift_id, emp_id } = req.body;

    if (!shift_id || !emp_id) {
        return res.status(400).json({ error: 'Shift ID and Employee ID are required.' });
    }

    try {
        const result = await cancelShiftOffer(shift_id, emp_id);
        res.status(200).json({ success: true, result });
    } catch (err) {
        console.error('Error cancelling shift offer:', err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// Route to search for open shift offers
router.get('/searchOpenShiftOffers', async (req, res) => {
    const { emp_id, business_id } = req.query;

    if (!emp_id || !business_id) {
        return res.status(400).json({ error: 'Employee ID and Business ID are required.' });
    }

    try {
        const offers = await searchOpenShiftOffers(Number(emp_id), Number(business_id));
        res.status(200).json({ success: true, offers });
    } catch (err) {
        console.error('Error searching open shift offers:', err);
        res.status(400).json({ success: false, error: err.message });
    }
});

export default router;
