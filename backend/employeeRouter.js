import express from 'express';
import { fetchEmployees } from './employee.js'; // Adjust the path as needed

const router = express.Router();

// Define the route to fetch employees
router.get('/:businessId', async (req, res) => {
    const { businessId } = req.params;

    try {
        const employees = await fetchEmployees(businessId);
        res.status(200).json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
