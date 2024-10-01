import express from 'express';
import { LoginEmployee } from './login.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { employeeString, password } = req.body;

    console.log('Login request received:', employeeString, password);

    try {
        const employee = await LoginEmployee(employeeString, password);
        res.status(200).json({ success: true, employee });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router;