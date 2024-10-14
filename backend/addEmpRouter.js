import express from 'express';
import { AddEmployee } from './addEmp.js';

const router = express.Router();

router.post('/', async (req, res) => {
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
